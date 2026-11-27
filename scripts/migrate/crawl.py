#!/usr/bin/env python3
"""Inventory crawler for the old church site http://www.chungpa21.org/ (WebChurch ASP.NET CMS).

Metadata + file URL lists only. Binaries are NEVER downloaded here (only HEAD / tiny Range probes).
Python 3 stdlib only. Single connection, polite delay, retries, resumable (page cache on disk).

Stages (default: all):
  crawl     walk every board/page, write <out>/boards/*.json and <out>/pages.json
  binaries  HEAD every binary URL found, cache in <out>/binaries.json
  dims      Range-GET the first 64KB of a small photo sample to read pixel size
  report    write <out>/inventory.md from the JSON files

Usage: python3 crawl.py [stage ...] [--out DIR] [--delay SEC] [--refresh-lists] [--dims-sample N]
"""
import argparse
import gzip
import hashlib
import html as htmllib
import http.client
import json
import os
import random
import re
import statistics
import struct
import sys
import time
from collections import Counter, defaultdict
from html.parser import HTMLParser
from urllib.parse import quote, unquote, urljoin, urlsplit

HOST = "www.chungpa21.org"
BASE = "http://" + HOST
UA = "Mozilla/5.0 (compatible; chungpa-migration-inventory/1.0; +church-owned-site-migration)"
DEFAULT_OUT = "/Users/shin/Developer/chungpa21-crawl"

# ------------------------------------------------------------------ utils


def now():
    return time.strftime("%Y-%m-%dT%H:%M:%S")


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, file=sys.stderr, flush=True)


class _Text(HTMLParser):
    BLOCK = {"p", "div", "br", "li", "tr", "h1", "h2", "h3", "h4", "h5", "h6", "table", "ul", "ol", "section", "article", "dt", "dd"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip += 1
        if tag in self.BLOCK:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self.skip:
            self.skip -= 1
        if tag in self.BLOCK:
            self.parts.append("\n")

    def handle_data(self, d):
        if not self.skip:
            self.parts.append(d)


def html_to_text(s):
    if not s:
        return ""
    s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
    p = _Text()
    p.feed(s)
    t = "".join(p.parts).replace("\xa0", " ").replace("​", "")
    lines = [re.sub(r"[ \t\r\f\v]+", " ", ln).strip() for ln in t.split("\n")]
    out = []
    for ln in lines:
        if ln or (out and out[-1]):
            out.append(ln)
    return "\n".join(out).strip()


def strip_comments(s):
    return re.sub(r"<!--.*?-->", "", s or "", flags=re.S)


def between(s, a, b, start=0):
    i = s.find(a, start)
    if i < 0:
        return None
    i += len(a)
    j = s.find(b, i)
    return s[i:j] if j >= 0 else s[i:]


def cls_html(s, cls, tag=None):
    """inner html of first element whose class attr contains cls (non-nested simple match)."""
    m = re.search(r'<(%s)\b[^>]*class="[^"]*\b%s\b[^"]*"[^>]*>(.*?)</\1>' % (tag or r"\w+", re.escape(cls)), s, flags=re.S)
    return m.group(2) if m else None


def cls_text(s, cls, tag=None):
    h = cls_html(s, cls, tag)
    return html_to_text(h) if h is not None else ""


def norm_url(u, base=BASE + "/"):
    """Return same-host path+query (unquoted-safe), or None if external/non-http."""
    if not u:
        return None
    u = htmllib.unescape(u.strip())
    if u.startswith(("javascript:", "mailto:", "tel:", "#", "data:")):
        return None
    if u.startswith("//"):
        u = "http:" + u
    full = urljoin(base, u)
    sp = urlsplit(full)
    if sp.hostname and sp.hostname.lower() not in (HOST, "chungpa21.org"):
        return None
    return sp.path + (("?" + sp.query) if sp.query else "")


def abs_url(path):
    return BASE + path


def quote_path(p):
    return quote(p, safe="/%?=&:@+,;~-_.!*'()")


BIN_PHOTO = (".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tif", ".tiff", ".heic")


def bin_class(path):
    pl = unquote(path).lower().split("?")[0]
    if "view_img.asp" in pl:
        return "photo"
    if pl.endswith(BIN_PHOTO):
        return "photo"
    if pl.endswith(".pdf"):
        return "pdf"
    return "other"


def is_binary_path(p):
    if not p:
        return False
    pl = p.lower()
    return pl.startswith("/file/") or ("view_img.asp" in pl and "ori=y" in pl)


VIDEO_PATTERNS = [
    ("youtube", re.compile(r"(?:youtube(?:-nocookie)?\.com/embed/|youtu\.be/|youtube\.com/watch\?(?:[^\"' <>]*?&(?:amp;)?)?v=|youtube\.com/v/)([\w-]{11})")),
    ("vimeo", re.compile(r"vimeo\.com/(?:video/|channels/[\w]+/|groups/[\w]+/videos/)?(\d{5,})")),
    ("kakao", re.compile(r"tv\.kakao\.com/(?:embed/player/cliplink/|v/|channel/\d+/cliplink/)(\d+)")),
    ("naver", re.compile(r"tv\.naver\.com/(?:embed|v)/(\d+)")),
]


def find_videos(*chunks):
    seen, out = set(), []
    for ch in chunks:
        if not ch:
            continue
        ch = htmllib.unescape(ch)
        for host, rx in VIDEO_PATTERNS:
            for m in rx.finditer(ch):
                k = (host, m.group(1))
                if k in seen:
                    continue
                seen.add(k)
                if host == "youtube":
                    url = "https://www.youtube.com/watch?v=" + m.group(1)
                elif host == "vimeo":
                    url = "https://vimeo.com/" + m.group(1)
                else:
                    url = m.group(0)
                out.append({"host": host, "id": m.group(1), "url": url})
        # other iframes that are not covered (kept for completeness)
        for m in re.finditer(r'<iframe[^>]+src=["\']([^"\']+)["\']', ch, flags=re.I):
            src = m.group(1)
            if not any(rx.search(src) for _, rx in VIDEO_PATTERNS) and "kakao_Link" not in src and "pdf-js" not in src:
                k = ("other", src)
                if k not in seen:
                    seen.add(k)
                    out.append({"host": "other", "id": src, "url": src})
    return out


def find_images_and_files(region_html):
    """image URLs (img src) and file links (a href) that live on this host and look like binaries."""
    imgs, files = [], []
    for m in re.finditer(r"<img\b[^>]*?\bsrc=[\"']([^\"']+)[\"']", region_html or "", flags=re.I):
        p = norm_url(m.group(1))
        if p and is_binary_path(p) and p not in imgs:
            imgs.append(p)
    for m in re.finditer(r"<a\b[^>]*?\bhref=[\"']([^\"']+)[\"'][^>]*>(.*?)</a>", region_html or "", flags=re.I | re.S):
        p = norm_url(m.group(1))
        if not p:
            continue
        low = p.lower()
        if is_binary_path(p) or "download" in low or "filedown" in low or re.search(r"\.(pdf|hwp|hwpx|docx?|xlsx?|pptx?|zip|mp3|mp4)(\?|$)", low):
            if p not in [f["url"] for f in files]:
                files.append({"url": p, "name": html_to_text(m.group(2))[:200]})
    return imgs, files


def parse_fields(text):
    """'▶ 설교자 : …' style lines -> dict (raw strings; real parsing comes later)."""
    out = {}
    for ln in text.split("\n"):
        m = re.match(r"^\s*[▶▷►●■◆\-\*]?\s*([^:：]{1,12})\s*[:：]\s*(.+)$", ln)
        if m and ln.lstrip().startswith(("▶", "▷", "►")):
            out.setdefault(m.group(1).strip(), m.group(2).strip())
    return out


PHONE_RX = re.compile(r"(?<!\d)(?:0\d{1,2}[-. ]?\d{3,4}[-. ]?\d{4})(?!\d)")
EMAIL_RX = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")

# ------------------------------------------------------------------ fetcher


class Fetcher:
    def __init__(self, out, delay=0.4, refresh_lists=False):
        self.out = out
        self.delay = delay
        self.refresh_lists = refresh_lists
        self.cache_dir = os.path.join(out, "cache", "pages")
        os.makedirs(self.cache_dir, exist_ok=True)
        self.conn = None
        self.cookie = ""
        self.cookie_at = 0
        self.nreq = 0
        self.failures = []
        self.last_net = 0.0

    # --- cookies: parse Set-Cookie by hand (http.cookiejar drops the value of `com` because it contains & and =)
    def _absorb_cookies(self, headers):
        jar = dict(p.split("=", 1) for p in self.cookie.split("; ") if "=" in p)
        for k, v in headers:
            if k.lower() == "set-cookie":
                first = v.split(";", 1)[0]
                if "=" in first:
                    n, val = first.split("=", 1)
                    if n.strip() == "com" and "communityid=" not in val:
                        continue  # ignore odd/partial com cookies; they break later requests
                    jar[n.strip()] = val
        self.cookie = "; ".join("%s=%s" % kv for kv in jar.items())

    def _connect(self):
        if self.conn:
            try:
                self.conn.close()
            except Exception:
                pass
        self.conn = http.client.HTTPConnection(HOST, 80, timeout=40)

    def _sleep(self):
        wait = self.delay + random.uniform(0, self.delay * 0.4) - (time.time() - self.last_net)
        if wait > 0:
            time.sleep(wait)

    def raw(self, method, path, body=None, extra=None, want_body=True):
        """One polite request with retries. Returns (status, headers_list, bytes)."""
        hdrs = {"User-Agent": UA, "Accept": "*/*", "Accept-Language": "ko,en;q=0.5", "Cookie": self.cookie}
        if body is not None:
            hdrs["Content-Type"] = "application/x-www-form-urlencoded"
            hdrs["X-Requested-With"] = "XMLHttpRequest"
        if extra:
            hdrs.update(extra)
        if method == "HEAD":
            hdrs["Connection"] = "close"  # keep-alive HEADs stall ~2 s each on this server; a fresh connection answers in ~20 ms
        last = None
        for attempt in range(5):
            try:
                if self.conn is None:
                    self._connect()
                self._sleep()
                self.conn.request(method, quote_path(path), body=body.encode() if isinstance(body, str) else body, headers=hdrs)
                r = self.conn.getresponse()
                data = r.read() if (want_body and method != "HEAD") else (r.read() if method != "HEAD" else b"")
                self.last_net = time.time()
                self.nreq += 1
                hl = r.getheaders()
                self._absorb_cookies(hl)
                if r.status in (301, 302) and r.getheader("Location"):
                    path = norm_url(r.getheader("Location"), base=BASE + path) or path
                    continue
                if r.status == 400 and attempt < 3:
                    last = "HTTP 400 (stale keep-alive?) - reconnecting"
                    self._connect()
                    time.sleep(1 + attempt)
                    continue
                if self.nreq % 60 == 0:
                    self._connect()  # fresh connection regularly; long keep-alives went bad after a while
                if r.status >= 500 and attempt < 3 and method != "HEAD":
                    last = "HTTP %d" % r.status
                    time.sleep(2 ** attempt)
                    continue
                if method == "HEAD" or r.getheader("Connection", "").lower() == "close":
                    self._connect()
                return r.status, hl, data
            except Exception as e:  # network error: reconnect + backoff
                last = repr(e)
                self.last_net = time.time()
                self._connect()
                time.sleep(1.5 * (2 ** attempt))
        raise RuntimeError("giving up on %s %s: %s" % (method, path, last))

    def init_session(self):
        st, hl, _ = self.raw("GET", "/")
        self.cookie_at = time.time()
        if "com=" not in self.cookie:
            log("WARNING: no `com` cookie received")
        log("session cookie:", self.cookie[:120])

    def _key(self, method, path, body):
        return hashlib.sha1(("%s %s %s" % (method, path, body or "")).encode()).hexdigest()

    @staticmethod
    def bad(text):
        return ("er404_bg1" in text) or ("er500_bg1" in text) or len(text) < 200

    def get(self, path, body=None, is_list=False, min_len=0):
        """Cached text fetch. Returns text or None (recorded in self.failures)."""
        method = "POST" if body is not None else "GET"
        fn = os.path.join(self.cache_dir, self._key(method, path, body) + ".gz")
        if os.path.exists(fn) and not (is_list and self.refresh_lists):
            with gzip.open(fn, "rt", encoding="utf-8") as f:
                return f.read()
        if time.time() - self.cookie_at > 40 * 60:
            self.init_session()
        try:
            st, hl, data = self.raw(method, path, body)
        except Exception as e:
            self.failures.append({"url": path, "body": body, "error": str(e), "at": now()})
            return None
        text = data.decode("utf-8", errors="replace")
        if st != 200 or self.bad(text) or len(text) < min_len:
            self.failures.append({"url": path, "body": body, "error": "status %s len %d%s" % (st, len(text), " (error page)" if self.bad(text) else ""), "at": now()})
            log("FAIL", path, body or "", st, len(text), "cookie=" + self.cookie[:100])
            return None
        with gzip.open(fn, "wt", encoding="utf-8") as f:
            f.write(text)
        return text


# ------------------------------------------------------------------ list/detail parsers


def total_pages(h):
    m = re.search(r'navi_all_btn">\s*(\d+)\s*/\s*(\d+)', h)
    return int(m.group(2)) if m else 1


def parse_media_list(h):
    rows = []
    parts = re.split(r'<tr class="media_board_list_line"', h)[1:]
    for p in parts:
        m = re.search(r"read\.asp\?seq=(\d+)[^\"']*?board_idx=(\d+)&(?:amp;)?sub_idx=(\d*)", htmllib.unescape(p))
        if not m:
            continue
        row = {"seq": int(m.group(1)), "board_idx": int(m.group(2)), "sub_idx": m.group(3) or "0"}
        row["title"] = cls_text(p, "abm_b_item_tit")
        row["chapter"] = cls_text(p, "abm_b_item_txt")
        row["author"] = cls_text(p, "abm_b_item_name")
        row["date"] = cls_text(p, "abm_b_item_date")
        row["views"] = cls_text(p, "abm_b_item_inq")
        row["likes"] = cls_text(p, "abm_b_item_good")
        t = re.search(r'<img src="([^"]+)" class="abm_b_img"', p)
        row["thumb"] = t.group(1) if t else ""
        rows.append(row)
    return rows


def parse_media_detail(h, board_idx, seq):
    info = between(h, 'media_read_info ', "<!-- 비디오 정보 end -->") or ""
    title = cls_text(info, "media_read_info_tit")
    chapter = cls_text(info, "media_read_info_chpt")
    spans = re.findall(r'<span class="(name|date|view)">(.*?)</span>', info, flags=re.S)
    name = next((html_to_text(v) for k, v in spans if k == "name"), "")
    date = next((html_to_text(v) for k, v in spans if k == "date"), "")
    views = [html_to_text(v) for k, v in spans if k == "view"]
    vod_region = between(h, 'class="media_read_vod_btn_area">', "<!-- 비디오 버튼 end -->") or ""
    doc_region = between(h, "<!-- 문서 다운로드 -->", "<!-- 문서 다운로드 end -->") or ""
    att_region = between(h, "<!--첨부파일 25.05.08 추가-->", "<!--첨부파일 25.05.08 추가 end-->") or ""
    video_region = between(h, 'class="media_read_video_area', "<!-- 비디오 영역 end -->") or ""
    body_html = between(h, '<div class="media_read_cont">', "<!-- 미디어보드 내용 end -->") or ""
    body_html = strip_comments(body_html)
    body_html = re.sub(r"</div>\s*$", "", body_html.strip()).strip()
    imgs, files = find_images_and_files(body_html + strip_comments(doc_region) + strip_comments(att_region))
    # every file link in the explicit attachment regions counts as an attachment
    files2 = []
    for reg in (doc_region, att_region):
        for m in re.finditer(r"<a\b[^>]*?\bhref=[\"']([^\"']+)[\"'][^>]*>(.*?)</a>", strip_comments(reg), flags=re.I | re.S):
            p = norm_url(m.group(1))
            if p:
                files2.append({"url": p, "name": html_to_text(m.group(2))[:200]})
    seenu = {f["url"] for f in files}
    files += [f for f in files2 if f["url"] not in seenu]
    # video buttons: they hide URLs inside onclick/href/data attributes
    vod_clean = strip_comments(vod_region) + strip_comments(video_region)
    vids = find_videos(body_html, vod_clean)
    vod_links = [u for u in re.findall(r"""(?:href|onclick|data-[\w-]+|src)=["']([^"']*(?:http|//)[^"']*)["']""", vod_clean) if u]
    text = html_to_text(body_html)
    return {
        "title": title, "chapter": chapter, "author": name, "date": date,
        "views": views[0] if views else "", "likes": views[1] if len(views) > 1 else "",
        "body_html": body_html, "body_text": text, "body_fields": parse_fields(text),
        "images": imgs, "attachments": files, "videos": vids, "vod_button_links": vod_links,
    }


def parse_sboard_list(h, board_seq):
    out, seen = [], set()
    for m in re.finditer(r"read\.asp\?board_seq=(\d+)&(?:amp;)?board_sub_seq=(\d*)&(?:amp;)?view_sub_seq=(\d*)&(?:amp;)?seq=(\d+)", htmllib.unescape(h)):
        if int(m.group(1)) != board_seq or m.group(4) in seen:
            continue
        seen.add(m.group(4))
        out.append({"seq": int(m.group(4)), "sub_seq": m.group(2), "view_sub_seq": m.group(3)})
    return out


def parse_sboard_detail(h):
    info = between(h, 'class="sboard_info_tbl"', "<!-- 게시글 정보 end -->") or ""
    title = cls_text(info, "sboard_info_sbj")
    rows = dict((html_to_text(a), b) for a, b in re.findall(r"<th>(.*?)</th>\s*<td>(.*?)</td>", info, flags=re.S))
    who_raw = rows.get("글쓴이", "")
    who = html_to_text(who_raw)
    ip = (re.search(r"\((\d{1,3}(?:\.\d{1,3}){3})\)", who) or [None, ""])[1]
    mid = re.search(r"^(.*?)\s*\(([\w.\-]+)\)", who)
    author, author_id = (mid.group(1).strip(), mid.group(2)) if mid else (re.sub(r"\([\d.]+\)", "", who).strip(), "")
    body_html = strip_comments(between(h, '<div class="sboard_cont_details print_area">', "<!-- 게시글 내용 end -->") or "")
    body_html = re.sub(r"</div>\s*$", "", body_html.strip()).strip()
    att_raw = between(h, "<!-- 게시글 첨부파일 -->", "<!-- 게시글 첨부파일 end -->") or ""
    imgs, files = find_images_and_files(body_html)
    for m in re.finditer(r"<a\b[^>]*?\bhref=[\"']([^\"']+)[\"'][^>]*>(.*?)</a>", strip_comments(att_raw), flags=re.I | re.S):
        p = norm_url(m.group(1))
        if p and p not in [f["url"] for f in files]:
            files.append({"url": p, "name": html_to_text(m.group(2))[:200]})
    text = html_to_text(body_html)
    return {
        "title": title, "author": author, "author_id": author_id, "ip": ip,
        "date": html_to_text(rows.get("날짜", "")), "views": html_to_text(rows.get("조회수", "")),
        "body_html": body_html, "body_text": text, "body_fields": parse_fields(text),
        "images": imgs, "attachments": files, "videos": find_videos(body_html),
        "attachment_region_raw": strip_comments(att_raw).strip()[:2000],
    }


def parse_steward(h):
    people = []
    for art in re.split(r'<article class="stwd_cate_area', h)[1:]:
        cat = cls_text(art, "stwd_cate_tit")
        for card in re.split(r'<div class="stwd_card">', art)[1:]:
            tit = cls_html(card, "stwd_card_info_tit") or ""
            duty_m = re.search(r"<span[^>]*>(.*?)</span>", tit, flags=re.S)
            duty = html_to_text(duty_m.group(1)) if duty_m else ""
            name = html_to_text(re.sub(r"<span.*", "", tit, flags=re.S))
            img = re.search(r'class="stwd_card_prof_img"|<img src="([^"]+)"[^>]*class="stwd_card_prof_img"', card)
            imm = re.search(r'<img src="([^"]+)"[^>]*class="stwd_card_prof_img"', card)
            fields = {"phone": [], "email": [], "charge": [], "other": []}
            lst = cls_html(card, "stwd_card_info_list") or ""
            for li in re.findall(r"<li[^>]*>(.*?)</li>", lst, flags=re.S):
                txt = html_to_text(strip_comments(li))
                ic = re.search(r'src="[^"]*icon_(\w+)', li)
                kind = {"phone": "phone", "email": "email", "charge": "charge"}.get(ic.group(1) if ic else "", "other")
                if txt:
                    fields[kind].append(txt)
            intro = cls_text(card, "stwd_card_info_intro_cont")
            people.append({
                "category": cat, "name": name, "duty": duty, "photo": norm_url(imm.group(1)) if imm else None,
                "phones": fields["phone"], "emails": fields["email"], "charge": fields["charge"], "other_fields": fields["other"],
                "intro": intro, "private_fields": ["phones", "emails"],
            })
    return people


def parse_history(h):
    items = []
    for cat_block in re.split(r'<li class="history_list_item">', h)[1:]:
        cat = cls_text(cat_block, "history_list_item_tit")
        for blk in re.split(r'<div class="history_list_scd_item_cont">', cat_block)[1:]:
            s_date = cls_text(blk, "s_date")
            e_date = cls_text(blk, "e_date")
            txt = cls_text(blk, "history_list_scd_item_txt")
            imgs, _ = find_images_and_files(blk)
            items.append({"category": cat, "date": s_date, "date_end": e_date, "text": txt, "images": imgs})
    return items


def parse_weekly(h):
    """-> dict(pdf=..., day=..., weeks=[...]) from ajax_weekly_V2_cate.asp"""
    clean = strip_comments(h)
    pdfs = []
    for m in re.finditer(r"""viewer\.html\?file=([^"'>]+)""", clean):
        p = norm_url(m.group(1))
        if p and p not in pdfs:
            pdfs.append(p)
    other = []
    for m in re.finditer(r"""<div class="weekly_slide">(.*?)</div>""", clean, flags=re.S):
        i, f = find_images_and_files(m.group(1))
        other += [x for x in i if x not in other]
    for m in re.finditer(r'<li\s+class="yl_on"[^>]*>(.*?)</li>', clean, flags=re.S):
        pass
    act = re.search(r'<li\s+class="yl_on"\s+onclick="newWeek\((\d+),(\d+),(\d+),(\d+)\);">\s*([^<]*)</li>', clean)
    day = ""
    if act:
        dm = re.search(r"(\d+)일", act.group(5))
        day = dm.group(1) if dm else ""
    return {"pdfs": pdfs, "images": other, "day": day, "week_label": act.group(5).strip() if act else ""}


# ------------------------------------------------------------------ crawl stages


class Crawl:
    def __init__(self, fetcher, out):
        self.f = fetcher
        self.out = out
        self.boards_dir = os.path.join(out, "boards")
        os.makedirs(self.boards_dir, exist_ok=True)

    def save(self, name, obj):
        fn = os.path.join(self.boards_dir if not name.endswith("pages") else self.out, name + ".json")
        with open(fn + ".tmp", "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=1)
        os.replace(fn + ".tmp", fn)

    # --- media_board (sermons / praise)
    def media_board(self, idx):
        base = "/modu/media_board/list.asp?board_idx=%d" % idx
        first = self.f.get(base, is_list=True)
        if not first or "media_board_list_line" not in first:
            log("media_board %d: no list" % idx)
            return None
        title = ""
        det0 = None
        npages = total_pages(first)
        rows, seen = [], set()
        for pg in range(1, npages + 1):
            h = first if pg == 1 else self.f.get(base + "&page=%d" % pg, is_list=True)
            if h is None:
                continue
            new = 0
            for r in parse_media_list(h):
                if r["seq"] not in seen:
                    seen.add(r["seq"])
                    rows.append(r)
                    new += 1
            if pg % 10 == 0:
                log("media_board %d list page %d/%d  rows=%d" % (idx, pg, npages, len(rows)))
        items = []
        for n, r in enumerate(rows, 1):
            durl = "/modu/media_board/read.asp?board_idx=%d&sub_idx=%s&seq=%d" % (idx, r["sub_idx"], r["seq"])
            h = self.f.get(durl, min_len=5000)
            it = {"board_key": "media_%d" % idx, "board_idx": idx, "seq": r["seq"], "detail_url": durl,
                  "list_title": r["title"], "list_chapter": r["chapter"], "list_author": r["author"], "list_date": r["date"],
                  "list_thumb": r["thumb"]}
            if h is None:
                it.update({"ok": False, "title": r["title"], "title_raw": r["title"], "date": r["date"], "author": r["author"], "chapter": r["chapter"]})
            else:
                d = parse_media_detail(h, idx, r["seq"])
                if not title:
                    title = cls_text(h, "media_board_tit") or title
                it.update(d)
                it["title_raw"] = d["title"]
                it["ok"] = True
                # list thumbnail (youtube) can reveal the id when the body has none
                if not it["videos"]:
                    tm = re.search(r"img\.youtube\.com/vi/([\w-]{11})/", r["thumb"] or "")
                    if tm:
                        it["videos"] = [{"host": "youtube", "id": tm.group(1), "url": "https://www.youtube.com/watch?v=" + tm.group(1), "source": "list_thumbnail"}]
            items.append(it)
            if n % 50 == 0:
                log("media_board %d detail %d/%d" % (idx, n, len(rows)))
        name = {1: "주일예배", 2: "금요예배", 3: "찬양"}.get(idx, title or "media_board_%d" % idx)
        obj = {"board": "media_board", "board_key": "media_%d" % idx, "board_idx": idx, "name": name, "list_url": base,
               "total_pages": npages, "crawled_at": now(), "items": items}
        self.save("media_%d" % idx, obj)
        log("media_board %d (%s): %d items" % (idx, name, len(items)))
        return obj

    # --- s_board (albums, special videos, new-family, prayer, schedule, church news)
    def s_board(self, bseq):
        base = "/modu/s_board/list.asp?board_seq=%d" % bseq
        first = self.f.get(base, is_list=True)
        if not first or ("sboard_tit" not in first):
            log("s_board %d: absent" % bseq)
            return None
        name = cls_text(first, "sboard_tit") or "s_board_%d" % bseq
        npages = total_pages(first)
        rows, seen = [], set()
        for pg in range(1, npages + 1):
            h = first if pg == 1 else self.f.get(base + "&page=%d" % pg, is_list=True)
            if h is None:
                continue
            for r in parse_sboard_list(h, bseq):
                if r["seq"] not in seen:
                    seen.add(r["seq"])
                    rows.append(r)
            if pg % 5 == 0:
                log("s_board %d list page %d/%d rows=%d" % (bseq, pg, npages, len(rows)))
        if not rows:
            log("s_board %d (%s): no rows" % (bseq, name))
        items = []
        for n, r in enumerate(rows, 1):
            durl = "/modu/s_board/read.asp?board_seq=%d&board_sub_seq=%s&view_sub_seq=%s&seq=%d" % (bseq, r["sub_seq"], r["view_sub_seq"] or "0", r["seq"])
            h = self.f.get(durl, min_len=5000)
            it = {"board_key": "s_board_%d" % bseq, "board_seq": bseq, "seq": r["seq"], "sub_seq": r["sub_seq"], "detail_url": durl}
            if h is None or "sboard_info_tbl" not in h:
                it.update({"ok": False, "title": "", "title_raw": "", "date": ""})
            else:
                d = parse_sboard_detail(h)
                it.update(d)
                it["title_raw"] = d["title"]
                it["ok"] = True
            items.append(it)
            if n % 50 == 0:
                log("s_board %d detail %d/%d" % (bseq, n, len(rows)))
        obj = {"board": "s_board", "board_key": "s_board_%d" % bseq, "board_seq": bseq, "name": name, "list_url": base,
               "total_pages": npages, "crawled_at": now(), "items": items}
        self.save("s_board_%d" % bseq, obj)
        log("s_board %d (%s): %d items" % (bseq, name, len(items)))
        return obj

    # --- weekly bulletins
    def weekly(self, y0, y1):
        items, by_pdf = [], {}
        today = time.localtime()
        for y in range(y0, y1 + 1):
            for m in range(1, 13):
                if (y, m) > (today.tm_year, today.tm_mon + 1):
                    break
                for w in range(1, 6):
                    body = "vget=5&cate=1&y=%d&m=%d&w=%d" % (y, m, w)
                    h = self.f.get("/modu/weekly/ajax_weekly_V2_cate.asp", body=body, is_list=True)
                    if h is None:
                        continue
                    p = parse_weekly(h)
                    for pdf in p["pdfs"] + p["images"]:
                        rec = by_pdf.get(pdf)
                        ref = {"year": y, "month": m, "week": w, "day": p["day"], "label": p["week_label"]}
                        if rec is None:
                            rec = {"board_key": "weekly", "file": pdf, "refs": [], "detail_url": "/modu/weekly/weekly_V2.asp?select_year=%d&select_month=%d&select_week=%d" % (y, m, w)}
                            by_pdf[pdf] = rec
                            items.append(rec)
                        rec["refs"].append(ref)
                if y == today.tm_year and m % 3 == 0 or m == 12:
                    log("weekly %d-%02d  unique files=%d" % (y, m, len(items)))
        for rec in items:
            r0 = rec["refs"][0]
            rec["title"] = "%d년 %d월 %d주 주보" % (r0["year"], r0["month"], r0["week"])
            rec["images"] = []
            rec["attachments"] = [{"url": rec["file"], "name": os.path.basename(unquote(rec["file"]))}]
            d = r0["day"]
            rec["date"] = "%04d-%02d-%02d" % (r0["year"], r0["month"], int(d)) if d else ""
            rec["ok"] = True
            rec["videos"] = []
            rec["body_text"] = ""
        # best-effort dates: those weeks whose day label was only shown once (selected week) keep it; others left empty
        obj = {"board": "weekly", "board_key": "weekly", "name": "주보", "crawled_at": now(), "scan_years": [y0, y1], "items": items}
        self.save("weekly", obj)
        log("weekly: %d unique files" % len(items))
        return obj

    # --- history
    def history(self):
        body = "historyid=&yearyn=N&sort_type=desc&cate_sort_type=desc&t_width=600&wd=&all="
        h = self.f.get("/modu/history/ajax_history_main_list.asp", body=body, is_list=True)
        items = parse_history(h) if h else []
        for i, it in enumerate(items):
            it["board_key"] = "history"
            it["seq"] = i + 1
            it["title"] = it["text"][:80]
            it["title_raw"] = it["text"]
            it["body_text"] = it["text"]
            it["attachments"] = []
            it["videos"] = []
            it["ok"] = True
            it["detail_url"] = "/modu/history/history_main.asp?sub=history&all=Y"
        obj = {"board": "history", "board_key": "history", "name": "교회연혁", "crawled_at": now(), "items": items}
        self.save("history", obj)
        log("history: %d entries" % len(items))
        return obj

    # --- staff
    def steward(self):
        people, seen = [], set()
        urls = ["/modu/info/steward/steward_prepare.asp?sub=serve&seq=1"]
        h0 = self.f.get(urls[0], is_list=True)
        # discover other categories, if the page links to them
        if h0:
            for m in re.finditer(r"steward_prepare\.asp\?sub=serve&(?:amp;)?seq=(\d+)(?:&(?:amp;)?stepid=(\d+))?", htmllib.unescape(h0)):
                u = "/modu/info/steward/steward_prepare.asp?sub=serve&seq=%s" % m.group(1)
                if m.group(2):
                    u += "&stepid=%s" % m.group(2)
                if u not in urls:
                    urls.append(u)
        for u in urls:
            h = h0 if u == urls[0] else self.f.get(u, is_list=True)
            if not h:
                continue
            for p in parse_steward(h):
                k = (p["category"], p["name"], p["duty"])
                if k not in seen:
                    seen.add(k)
                    p["source_url"] = u
                    people.append(p)
        for i, p in enumerate(people):
            p["board_key"] = "staff"
            p["seq"] = i + 1
            p["title"] = "%s %s" % (p["name"], p["duty"])
            p["title_raw"] = p["title"]
            p["date"] = ""
            p["images"] = [p["photo"]] if p.get("photo") else []
            p["attachments"] = []
            p["videos"] = []
            p["body_text"] = p["intro"]
            p["detail_url"] = p["source_url"]
            p["ok"] = True
        obj = {"board": "staff", "board_key": "staff", "name": "섬기는 분들", "crawled_at": now(),
               "PRIVATE": "items[].phones and items[].emails contain personal contact data - do not publish", "items": people}
        self.save("staff", obj)
        log("staff: %d people" % len(people))
        return obj

    # --- static / auto-generated pages
    def doc_page(self, code, sub, label=""):
        url = "/modu/document/document_view.asp?uotc_code=%s&uotc=%s" % (code, sub)
        h = self.f.get(url)
        if not h:
            return {"url": url, "ok": False, "label": label}
        title = cls_text(h, "document_tit") or label
        body = between(h, 'id="print_area">', "<!-- 내용 영역 end -->") or ""
        body = strip_comments(body)
        imgs, files = find_images_and_files(body)
        return {"url": url, "ok": True, "kind": "document", "title": title, "nav_label": label,
                "body_html": body.strip(), "body_text": html_to_text(body), "images": imgs, "attachments": files,
                "videos": find_videos(body),
                "map_embed": ({"provider": "daum_roughmap", "key": mk.group(1), "timestamp": (re.search(r'"timestamp"\s*:\s*"(\d+)"', body) or [0, ""])[1]} if (mk := re.search(r'"key"\s*:\s*"(\w+)"', body)) else None)}

    def nav_from_home(self, home_html):
        """goTo(...) calls -> {(type,args)}, with labels from the menu anchors."""
        found = {}
        for m in re.finditer(r"goTo\('(nav\d+)',\s*'(\w+)'((?:,\s*'[^']*')*)\)[^>]*id=\"menu_gnb_id_nav\d+\"[^>]*>([^<]*)<", home_html):
            args = re.findall(r"'([^']*)'", m.group(3))
            found[m.group(1)] = (m.group(2), args, m.group(4).strip())
        return found

    def static_pages(self):
        pages = {"crawled_at": now()}
        home = self.f.get("/", is_list=True)
        if home:
            body = re.sub(r'<article class="privacy_area.*?</article>', "", home, flags=re.S)
            body = re.sub(r'<aside class="sol_security_pop.*?</aside>', "", body, flags=re.S)
            imgs, files = find_images_and_files(strip_comments(body))
            pages["home"] = {"url": "/", "title": (re.search(r"<title>(.*?)</title>", home, flags=re.S) or [0, ""])[1].strip(),
                             "text": html_to_text(between(body, "<body", "</body>") or body)[:20000],
                             "images": imgs, "videos": find_videos(home),
                             "links": sorted(set(re.findall(r"goTo\('[^)]*\)", home)))}
            nav = self.nav_from_home(home)
            pages["nav"] = {k: {"type": v[0], "args": v[1], "label": v[2]} for k, v in nav.items()}
        else:
            nav = {}
        docs = {}
        for k, (typ, args, label) in nav.items():
            if typ == "uotc" and len(args) >= 2:
                key = (args[0], args[1])
                if key not in docs:
                    docs[key] = self.doc_page(args[0], args[1], label)
                    docs[key]["nav_labels"] = [label]
                else:
                    docs[key]["nav_labels"].append(label)
        pages["documents"] = list(docs.values())
        # other WebChurch modules: probe, keep text if there is anything
        probes = {
            "공지사항(내장)": "/modu/info/manager/main2_news_l.asp",
            "교회소식(내장)": "/modu/info/newsletter/main_newsletter_l.asp?main=Y",
            "설교(내장)": "/modu/jubo/main-sermon_l.asp",
            "방명록": "/modu/gbook/Gbook_prepare.asp?sub=gbook",
            "칼럼": "/modu/colum/colum_prepare.asp?main=Y",
            "인터넷방송": "/modu/ibroadcast_upgrade/ibroadcast_prepare.asp?sub=Y",
            "멀티미디어": "/modu/contentsboard/contents_l.asp",
            "일정": "/modu/schedule/_html/index.asp?sub=schedule",
            "예배안내(내장)": "/modu/worship/worship_view.asp?sub=worshipTable",
            "추천사이트": "/modu/info/manager/recom.asp?main=Y",
            "성도사업장": "/modu/business/business_main.asp",
            "교우사업체": "/modu/work/work.asp?sub=work",
            "지교회": "/modu/shichal/shichal_l.asp?main=Y&sub=shichal",
            "사이버상담": "/modu/info/cybercounsel/main_cybercounsel_l.asp?sub=cyber",
            "카페": "/modu/cafe/cafe_main.asp?sub=comm",
            "온라인행정": "/modu/onlineADMv2/spaces/spaces_main.asp",
            "개인정보처리방침(스킨)": "/modu/privacy/privacy.asp",
        }
        pr = []
        for label, u in probes.items():
            nfail = len(self.f.failures)
            h = self.f.get(u, is_list=True)
            if not h:
                del self.f.failures[nfail:]  # absent module is a finding, not a failure
                pr.append({"label": label, "url": u, "exists": False})
                continue
            main = between(h, 'class="main_contents">', "<!-- contents end -->") or h
            txt = html_to_text(re.sub(r"<script.*?</script>|<style.*?</style>", "", main, flags=re.S))
            imgs, files = find_images_and_files(strip_comments(main))
            pr.append({"label": label, "url": u, "exists": True, "text": txt[:6000], "text_len": len(txt),
                       "images": imgs, "attachments": files, "videos": find_videos(main)})
        pages["module_probes"] = pr
        self.save("pages", pages)
        log("static pages: %d documents, %d probes" % (len(pages["documents"]), len(pr)))
        return pages


def run_crawl(args, F):
    c = Crawl(F, args.out)
    F.init_session()
    c.static_pages()
    for idx in range(1, 13):
        o = c.media_board(idx)
        if o is None and idx > 3:
            break
    for b in range(1, 21):
        c.s_board(b)
    c.steward()
    c.history()
    c.weekly(args.weekly_from, time.localtime().tm_year)
    write_failures(args.out, F)


def write_failures(out, F):
    fn = os.path.join(out, "failures.json")
    old = []
    if os.path.exists(fn):
        try:
            old = json.load(open(fn, encoding="utf-8"))
        except Exception:
            old = []
    keyset = {(x.get("url"), x.get("body")) for x in F.failures}
    merged = [x for x in old if (x.get("url"), x.get("body")) not in keyset and x.get("stage") == "binaries"] + F.failures
    with open(fn, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=1)


# ------------------------------------------------------------------ binaries


def load_boards(out):
    d = os.path.join(out, "boards")
    res = {}
    for fn in sorted(os.listdir(d)):
        if fn.endswith(".json"):
            with open(os.path.join(d, fn), encoding="utf-8") as f:
                o = json.load(f)
            res[o["board_key"]] = o
    return res


def collect_binary_refs(out):
    """-> {board_key: set(path)} plus pages.json refs under key 'pages'"""
    refs = defaultdict(set)
    for k, o in load_boards(out).items():
        for it in o["items"]:
            for p in it.get("images", []) or []:
                if is_binary_path(p):
                    refs[k].add(p)
            for a in it.get("attachments", []) or []:
                refs[k].add(a["url"] if isinstance(a, dict) else a)
    pf = os.path.join(out, "pages.json")
    if os.path.exists(pf):
        pg = json.load(open(pf, encoding="utf-8"))
        for d in pg.get("documents", []):
            for p in d.get("images", []) + [a["url"] for a in d.get("attachments", [])]:
                refs["static_pages"].add(p)
        for p in pg.get("home", {}).get("images", []):
            if is_binary_path(p):
                refs["static_pages"].add(p)
        for pr in pg.get("module_probes", []):
            for p in pr.get("images", []) + [a["url"] for a in pr.get("attachments", [])]:
                refs["static_pages"].add(p)
    return refs


def run_binaries(args, F):
    F.init_session()
    refs = collect_binary_refs(args.out)
    allp = sorted({p for s in refs.values() for p in s})
    fn = os.path.join(args.out, "binaries.json")
    cache = json.load(open(fn, encoding="utf-8")) if os.path.exists(fn) else {}
    todo = [p for p in allp if p not in cache or cache[p].get("status") in (None, 0)]
    log("binaries: %d unique urls, %d to probe" % (len(allp), len(todo)))
    failures = []
    for n, p in enumerate(todo, 1):
        rec = {"checked_at": now()}
        try:
            st, hl, _ = F.raw("HEAD", p, want_body=False)
            h = {k.lower(): v for k, v in hl}
            rec.update(status=st, method="HEAD", type=h.get("content-type", ""), last_modified=h.get("last-modified", ""))
            if st == 200 and h.get("content-length", "").isdigit():
                rec["size"] = int(h["content-length"])
            else:
                st2, hl2, _d = F.raw("GET", p, extra={"Range": "bytes=0-0"})
                h2 = {k.lower(): v for k, v in hl2}
                rec.update(status=st2, method="Range")
                cr = h2.get("content-range", "")
                if "/" in cr and cr.split("/")[-1].isdigit():
                    rec["size"] = int(cr.split("/")[-1])
                elif st2 == 200 and h2.get("content-length", "").isdigit():
                    rec["size"] = int(h2["content-length"])  # server ignored Range; body was read (1 file) - unavoidable
                rec["type"] = h2.get("content-type", rec["type"])
        except Exception as e:
            rec.update(status=0, error=str(e))
        if rec.get("status") != 200 or "size" not in rec:
            failures.append({"url": p, "error": "status %s size %s %s" % (rec.get("status"), rec.get("size"), rec.get("error", "")), "stage": "binaries", "at": now()})
        cache[p] = rec
        if n % 100 == 0:
            with open(fn, "w", encoding="utf-8") as f:
                json.dump(cache, f, ensure_ascii=False)
            log("binaries %d/%d" % (n, len(todo)))
    with open(fn, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False)
    F.failures = failures
    # keep non-binary failures from the crawl stage
    ff = os.path.join(args.out, "failures.json")
    old = json.load(open(ff, encoding="utf-8")) if os.path.exists(ff) else []
    old = [x for x in old if x.get("stage") != "binaries"]
    with open(ff, "w", encoding="utf-8") as f:
        json.dump(old + failures, f, ensure_ascii=False, indent=1)
    log("binaries done; %d without size" % len(failures))


# ------------------------------------------------------------------ pixel dimensions (sample)


def image_dims(b):
    if b[:8] == b"\x89PNG\r\n\x1a\n" and len(b) >= 24:
        return struct.unpack(">II", b[16:24])
    if b[:2] == b"\xff\xd8":
        i = 2
        while i + 9 < len(b):
            if b[i] != 0xFF:
                i += 1
                continue
            mk = b[i + 1]
            if mk in (0xD8, 0x01) or 0xD0 <= mk <= 0xD7:
                i += 2
                continue
            ln = struct.unpack(">H", b[i + 2:i + 4])[0]
            if mk in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                h, w = struct.unpack(">HH", b[i + 5:i + 9])
                return w, h
            i += 2 + ln
    if b[:6] in (b"GIF87a", b"GIF89a"):
        return struct.unpack("<HH", b[6:10])
    return None


def run_dims(args, F):
    F.init_session()
    refs = collect_binary_refs(args.out)
    photos = sorted(p for p in refs.get("s_board_1", set()) if bin_class(p) == "photo")
    n = args.dims_sample
    step = max(1, len(photos) // n)
    sample = photos[::step][:n]
    fn = os.path.join(args.out, "image_dims_sample.json")
    cache = json.load(open(fn, encoding="utf-8")) if os.path.exists(fn) else {}
    for p in sample:
        if p in cache:
            continue
        try:
            st, hl, data = F.raw("GET", p, extra={"Range": "bytes=0-65535"})
            d = image_dims(data) if st in (200, 206) else None
            cache[p] = {"status": st, "w": d[0] if d else None, "h": d[1] if d else None}
        except Exception as e:
            cache[p] = {"status": 0, "error": str(e)}
    with open(fn, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=1)
    log("dims sample: %d" % len(cache))


# ------------------------------------------------------------------ report


def fmt_bytes(n):
    if n is None:
        return "-"
    for u in ("B", "KB", "MB", "GB"):
        if n < 1024 or u == "GB":
            return ("%d %s" % (n, u)) if u == "B" else ("%.2f %s" % (n, u))
        n /= 1024.0


def date_key(s):
    m = re.search(r"(\d{4})[-.](\d{1,2})[-.](\d{1,2})", s or "")
    return "%s-%02d-%02d" % (m.group(1), int(m.group(2)), int(m.group(3))) if m else None


def percentile(v, p):
    v = sorted(v)
    if not v:
        return None
    k = (len(v) - 1) * p
    f = int(k)
    c = min(f + 1, len(v) - 1)
    return v[f] + (v[c] - v[f]) * (k - f)


def run_report(args):
    out = args.out
    boards = load_boards(out)
    refs = collect_binary_refs(out)
    bins = json.load(open(os.path.join(out, "binaries.json"), encoding="utf-8")) if os.path.exists(os.path.join(out, "binaries.json")) else {}
    fails = json.load(open(os.path.join(out, "failures.json"), encoding="utf-8")) if os.path.exists(os.path.join(out, "failures.json")) else []
    pages = json.load(open(os.path.join(out, "pages.json"), encoding="utf-8")) if os.path.exists(os.path.join(out, "pages.json")) else {}
    dims = json.load(open(os.path.join(out, "image_dims_sample.json"), encoding="utf-8")) if os.path.exists(os.path.join(out, "image_dims_sample.json")) else {}
    L = []
    A = L.append

    def bin_stats(paths):
        st = {c: {"n": 0, "bytes": 0, "nosize": 0} for c in ("photo", "pdf", "other")}
        for p in paths:
            c = bin_class(p)
            st[c]["n"] += 1
            s = bins.get(p, {}).get("size")
            if s is None:
                st[c]["nosize"] += 1
            else:
                st[c]["bytes"] += s
        return st

    A("# chungpa21.org crawl inventory\n")
    A("Generated %s by `scripts/migrate/crawl.py` (metadata + file URL lists only; no binaries were downloaded).\n" % now())
    A("Source: %s  -  all numbers below are measured from this crawl.\n" % BASE)

    # ---- board table
    A("## Boards\n")
    A("| key | board | items | ok | date range | photos (n / bytes) | PDFs (n / bytes) | other (n / bytes) | videos (YT / Vimeo / other) |")
    A("|---|---|---:|---:|---|---|---|---|---|")
    names = {}
    allp = set()
    vid_total = Counter()
    vid_ids = defaultdict(set)
    for k, o in boards.items():
        its = o["items"]
        paths = refs.get(k, set())
        allp |= paths
        s = bin_stats(paths)
        dates = [d for d in (date_key(i.get("date") or i.get("list_date") or "") for i in its) if d]
        rng = "%s ~ %s" % (min(dates), max(dates)) if dates else "-"
        vc = Counter()
        for i in its:
            for v in i.get("videos", []) or []:
                if (v["host"], v["id"]) not in vid_ids[k]:
                    vid_ids[k].add((v["host"], v["id"]))
                    vc[v["host"]] += 1
        vid_total.update(vc)
        names[k] = o["name"]

        def cell(c):
            x = s[c]
            return "%d / %s%s" % (x["n"], fmt_bytes(x["bytes"]), " (+%d unsized)" % x["nosize"] if x["nosize"] else "")
        A("| %s | %s | %d | %d | %s | %s | %s | %s | %d / %d / %d |" % (
            k, o["name"], len(its), sum(1 for i in its if i.get("ok")), rng, cell("photo"), cell("pdf"), cell("other"),
            vc["youtube"], vc["vimeo"], sum(v for kk, v in vc.items() if kk not in ("youtube", "vimeo"))))
    sp = refs.get("static_pages", set())
    allp |= sp
    s = bin_stats(sp)
    A("| static_pages | home / 소개 pages / probes | %d docs | - | - | %d / %s | %d / %s | %d / %s | - |" % (
        len(pages.get("documents", [])), s["photo"]["n"], fmt_bytes(s["photo"]["bytes"]), s["pdf"]["n"], fmt_bytes(s["pdf"]["bytes"]), s["other"]["n"], fmt_bytes(s["other"]["bytes"])))
    A("")
    tot = bin_stats(allp)
    A("**Unique binary URLs across the whole site** (a file used by two boards is counted once): photos %d (%s), PDFs %d (%s), other %d (%s); total %d files, **%s**; %d without a size.\n" % (
        tot["photo"]["n"], fmt_bytes(tot["photo"]["bytes"]), tot["pdf"]["n"], fmt_bytes(tot["pdf"]["bytes"]),
        tot["other"]["n"], fmt_bytes(tot["other"]["bytes"]), len(allp), fmt_bytes(sum(v["bytes"] for v in tot.values())),
        sum(v["nosize"] for v in tot.values())))

    # ---- sermon rollup / videos
    A("## Video links (unique ids per board; YouTube / Vimeo / other)\n")
    A("| board | YouTube | Vimeo | other hosts |")
    A("|---|---:|---:|---:|")
    allv = defaultdict(set)
    for k, ids in vid_ids.items():
        c = Counter(h for h, _ in ids)
        for h, i in ids:
            allv[h].add(i)
        A("| %s | %d | %d | %d |" % (names[k], c["youtube"], c["vimeo"], sum(v for kk, v in c.items() if kk not in ("youtube", "vimeo"))))
    A("| **unique over whole site** | %d | %d | %d |\n" % (len(allv["youtube"]), len(allv["vimeo"]), sum(len(v) for kk, v in allv.items() if kk not in ("youtube", "vimeo"))))

    # ---- photo size distribution
    A("## Photo size distribution (HEAD sizes)\n")
    for label, keyset in (("album photos (s_board_1)", ["s_board_1"]), ("all photos", list(refs.keys()))):
        ps = {p for k in keyset for p in refs.get(k, set()) if bin_class(p) == "photo"}
        sizes = [bins[p]["size"] for p in ps if p in bins and "size" in bins[p]]
        if sizes:
            A("- %s: n=%d, total %s, median %s, p90 %s, p99 %s, max %s, min %s" % (
                label, len(sizes), fmt_bytes(sum(sizes)), fmt_bytes(int(statistics.median(sizes))),
                fmt_bytes(int(percentile(sizes, 0.9))), fmt_bytes(int(percentile(sizes, 0.99))), fmt_bytes(max(sizes)), fmt_bytes(min(sizes))))
    ok = [(v["w"], v["h"]) for v in dims.values() if v.get("w")]
    if ok:
        c = Counter("%dx%d" % x for x in ok)
        A("- pixel dimensions, sample of %d album photos (Range GET of first 64 KB, header parsed): most common %s; median long edge %d px; min long edge %d, max long edge %d" % (
            len(ok), ", ".join("%s (%d)" % kv for kv in c.most_common(5)), statistics.median(max(a, b) for a, b in ok),
            min(max(a, b) for a, b in ok), max(max(a, b) for a, b in ok)))
    A("")

    # ---- 8/21 comparison
    A("## Comparison with the lost 2026-08-21 crawl\n")
    A("| item | 8/21 | now (measured) | diff |")
    A("|---|---:|---:|---:|")

    def row(label, old, new):
        A("| %s | %s | %s | %s |" % (label, old, new, ("%+d" % (new - old)) if isinstance(old, int) and isinstance(new, int) else ""))

    def n_(k):
        return len(boards[k]["items"]) if k in boards else 0

    row("sermon+praise posts (media_1+2+3)", 565, n_("media_1") + n_("media_2") + n_("media_3"))
    row("  주일예배 (media_1)", 405, n_("media_1"))
    row("  금요예배 (media_2)", 72, n_("media_2"))
    row("  찬양 (media_3)", 88, n_("media_3"))
    row("album posts (s_board_1)", 463, n_("s_board_1"))
    album_photos = len({p for p in refs.get("s_board_1", set()) if bin_class(p) == "photo"})
    row("album photos (unique urls, s_board_1)", 3731, album_photos)
    row("bulletin PDFs (weekly, unique files)", 112, n_("weekly"))
    row("history entries", 202, n_("history"))
    row("staff", 12, n_("staff"))
    row("video links YouTube (unique ids, media boards)", 330, len({i for k in ("media_1", "media_2", "media_3") for h, i in vid_ids.get(k, set()) if h == "youtube"}))
    row("video links Vimeo (unique ids, media boards)", 377, len({i for k in ("media_1", "media_2", "media_3") for h, i in vid_ids.get(k, set()) if h == "vimeo"}))
    row("video links total (media boards)", 707, len({(h, i) for k in ("media_1", "media_2", "media_3") for h, i in vid_ids.get(k, set())}))
    row("video links total (all boards incl. 특별영상/교회소식)", 707, sum(len(v) for v in allv.values()))
    row("downloadable files total", 4559, len(allp))
    A("| total bytes | ~1.14 GB | %s | |" % fmt_bytes(sum(v["bytes"] for v in tot.values())))
    A("")
    wk = boards.get("weekly", {}).get("items", [])
    wd = sorted(d for d in (r["refs"][0]["year"] * 100 + r["refs"][0]["month"] for r in wk))
    if wd:
        A("Bulletin month range measured: %d-%02d ~ %d-%02d.\n" % (wd[0] // 100, wd[0] % 100, wd[-1] // 100, wd[-1] % 100))
    nf = os.path.join(out, "notes.md")
    if os.path.exists(nf):
        A("### Explanations of differences\n")
        A(open(nf, encoding="utf-8").read().strip() + "\n")

    # ---- private data
    A("## Private / sensitive data flagged\n")
    st = boards.get("staff", {}).get("items", [])
    A("- **Staff page (`staff.json`)**: %d people; phone numbers on %d, e-mail addresses on %d. Fields `phones`, `emails` are PRIVATE - never publish them on the new site without explicit consent." % (
        len(st), sum(1 for p in st if p["phones"]), sum(1 for p in st if p["emails"])))
    ips = sum(1 for o in boards.values() for i in o["items"] if i.get("ip"))
    A("- **Author IP addresses** (`ip` on s_board items): %d items - internal log data, drop on import." % ips)
    A("- **Footer contact** (church phone/e-mail on every page) is public by design; it is not counted here.")
    for k, o in boards.items():
        if k == "staff":
            continue
        ph = sum(1 for i in o["items"] if PHONE_RX.search(i.get("body_text", "") or ""))
        em = sum(1 for i in o["items"] if EMAIL_RX.search(i.get("body_text", "") or ""))
        if ph or em:
            A("- `%s` (%s): %d posts contain a phone-like number, %d contain an e-mail address in the body text (review before publishing)." % (k, o["name"], ph, em))
    for k, o in boards.items():
        if o["name"] in ("중보기도",):
            A("- `%s` (%s): intercessory prayer requests - may name members and health/family situations; treat as sensitive, do not migrate without review." % (k, o["name"]))
        if o["name"] in ("새가족소개",):
            A("- `%s` (%s): new-member introductions - photos/names of identifiable members; confirm consent before publishing." % (k, o["name"]))
    A("- History entries and church-news posts list baptism/membership names (e.g. 세례자); consider whether to publish names.")
    A("")

    # ---- other boards found
    A("## Other pages / modules found\n")
    nav = pages.get("nav", {})
    if nav:
        A("Menu (from home page goTo calls): " + "; ".join("%s=%s%s" % (v["label"], v["type"], v["args"]) for v in nav.values()) + "\n")
    A("Static document pages (the text is an IMAGE on this site - see `images`):\n")
    for d in pages.get("documents", []):
        A("- %s (%s): ok=%s, text=%d chars, images=%s" % (" / ".join(d.get("nav_labels", [])), d["url"], d.get("ok"), len(d.get("body_text", "")), d.get("images")))
    A("\nProbed WebChurch modules:\n")
    for p in pages.get("module_probes", []):
        A("- %s (%s): %s" % (p["label"], p["url"], ("exists, %d chars of text" % p["text_len"]) if p["exists"] else "absent / error page"))
    A("")

    # ---- failures
    A("## Failures\n")
    if not fails:
        A("None.\n")
    else:
        A("%d failures (full list in `failures.json`):\n" % len(fails))
        for x in fails[:60]:
            A("- `%s` %s" % (x.get("url"), x.get("error")))
        if len(fails) > 60:
            A("- ... %d more" % (len(fails) - 60))
        A("")
    bad_items = [(k, i["seq"]) for k, o in boards.items() for i in o["items"] if not i.get("ok")]
    if bad_items:
        A("Items whose detail page could not be parsed/fetched (list data only): %s\n" % ", ".join("%s#%s" % x for x in bad_items[:80]))
    A("## Files\n")
    A("- `boards/*.json` one per board (items with title_raw, date, author, detail_url, body_text, body_html, body_fields, images, attachments, videos)")
    A("- `pages.json` home, static document pages, module probes")
    A("- `binaries.json` HEAD results per URL (size, type, last-modified)")
    A("- `image_dims_sample.json` pixel sizes of a sample of album photos")
    A("- `failures.json`, `cache/pages/` (gzip HTML cache; delete a file to force re-fetch)")
    with open(os.path.join(out, "inventory.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(L) + "\n")
    log("wrote inventory.md")


# ------------------------------------------------------------------ main


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("stages", nargs="*", default=["crawl", "binaries", "dims", "report"])
    ap.add_argument("--out", default=DEFAULT_OUT)
    ap.add_argument("--delay", type=float, default=0.4)
    ap.add_argument("--refresh-lists", action="store_true", help="re-fetch list/ajax pages even if cached (detail pages stay cached)")
    ap.add_argument("--dims-sample", type=int, default=40)
    ap.add_argument("--weekly-from", type=int, default=2012)
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    F = Fetcher(args.out, args.delay, args.refresh_lists)
    for st in args.stages:
        if st == "crawl":
            run_crawl(args, F)
        elif st == "binaries":
            run_binaries(args, F)
        elif st == "dims":
            run_dims(args, F)
        elif st == "report":
            run_report(args)
        else:
            sys.exit("unknown stage " + st)


if __name__ == "__main__":
    main()
