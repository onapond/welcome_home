#!/usr/bin/env python3
"""Turn the crawled old site into this repo's content/ files (migration m2).

Input : <crawl>/boards/*.json        (crawl.py)
        <crawl>/media/manifest.json   (photos.py: old photo URL -> store key + sizes)
        <crawl>/binaries.json         (expected PDF sizes)
Output: <out>/{sermons,praise,videos,albums,events,news,bulletins}/*.md, <out>/history.yaml,
        <out>/staff.yaml, <public>/bulletins/<id>.pdf, and a report (outside the repo).
        Bulletin PDFs come from the cache <crawl>/weekly-pdf/ (checked: %PDF- + expected size);
        missing ones are downloaded there first (resumable, one polite connection, crawl.Fetcher)
        unless --no-download. A PDF not obtained in a run never deletes an existing public copy.

Rules (docs/migration-plan.md, docs/검토규칙.md ⑱, content/README.md):
- s_board_2 (새가족소개) and s_board_4 (중보기도) are never read.
- Vimeo videos do not play: `video:` is only written for YouTube; Vimeo items keep text only.
- Author IPs and author ids are never written. Phone-like numbers (except the church's own)
  and e-mail addresses (except the church's) are masked. Staff phones/e-mails are omitted.
- Every collection item gets `legacy: {board, seq, url}` (history/staff schemas have no legacy).
- File ids: YYYY-MM-DD, same-day items get -2, -3 ... in (date, board order, seq) order.
- Deterministic: the same input always produces byte-identical files.

Run with `python3 -I` (downloaded data is untrusted; crawl.py is loaded by explicit path):
    python3 -I scripts/migrate/convert.py --crawl ../chungpa21-crawl --out /tmp/x/content
    python3 -I scripts/migrate/convert.py --crawl ../chungpa21-crawl --out content --replace
"""
import argparse
import datetime
import hashlib
import html as htmllib
import importlib.util
import json
import os
import re
import shutil
import sys
import tempfile
from collections import Counter, defaultdict
from html.parser import HTMLParser
from urllib.parse import quote, unquote, urljoin, urlsplit

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("migrate_crawl", os.path.join(HERE, "crawl.py"))
crawl = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(crawl)

OLD_BASE = "http://www.chungpa21.org"
EXCLUDED = ("s_board_2", "s_board_4")  # user decision 2026-11-27: never migrated
COLLECTIONS = ("sermons", "praise", "videos", "albums", "events", "news", "bulletins")
BOARD_NAMES = {
    "media_1": "주일예배", "media_2": "금요예배", "media_3": "찬양", "s_board_3": "특별영상",
    "s_board_1": "청파앨범", "s_board_5": "교회 일정", "s_board_6": "교회소식", "weekly": "주보",
    "history": "교회연혁", "staff": "섬기는 분",
}
YOUTUBE_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
CHURCH_PHONES = {"027140041", "027140042", "027140043", "027118166"}
CHURCH_EMAILS = {"church@chungpa21.org"}

# ------------------------------------------------------------------ report


class Report:
    def __init__(self):
        self.counts = {}  # board -> Counter(in, written, skipped)
        self.skips = defaultdict(Counter)  # board -> reason -> n
        self.masks = []  # (file, kind)
        self.addr = []  # (file, kind): home addresses removed
        self.addr_kept = []  # files with an event venue address kept
        self.pdf_held = []  # (bulletin id, kind): PDF not copied (see PDF_HOLD)
        self.pdf_missing = []  # bulletin ids written without a PDF: none obtained in this run
        self.pdf_restored = []  # bulletin ids whose PDF came from a previous run's public copy
        self.vimeo_only = Counter()  # board -> items whose only video was Vimeo
        self.vimeo_dropped = Counter()  # board -> Vimeo links dropped in total
        self.notes = defaultdict(list)  # board -> free text lines
        self.names = defaultdict(list)  # board -> [(file, excerpt)]
        self.replaced = []  # files removed from <out> (samples)
        self.overwritten = []  # existing files replaced by different content (samples with a real date)
        self.collisions = Counter()
        self.no_photo = set()  # (board, seq, original url): failed downloads left out

    def missing_photo(self, board, seq, url):
        n = crawl.norm_url(url) or url
        self.no_photo.add((board, int(seq), n))

    def board(self, b):
        return self.counts.setdefault(b, Counter())

    def skip(self, b, reason):
        self.board(b)["skipped"] += 1
        self.skips[b][reason] += 1


R = Report()

# ------------------------------------------------------------------ privacy

PHONE = re.compile(r"(?<![\d*])(0\d{1,2})([-. )]{1,2})(\d{3,4})([-. ]{1,2})(\d{4})(?![\d*])")
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+")
RRN = re.compile(r"(?<!\d)\d{6}\s?-\s?[1-8]\d{6}(?!\d)")  # 주민등록번호
CARD = re.compile(r"(?<!\d)\d{4}([- ])\d{4}\1\d{4}\1\d{4}(?!\d)")  # 카드번호-like

# Home addresses (user decision 2026-11-27: names stay, home addresses go). An address span needs
# at least one 시/군/구/읍/면 word, then a road (…로/…길 + number) or lot (…동/리/가 + number),
# optionally followed by a building and 동/호 unit. The church's own address and venue addresses
# given for events (a venue word right before the address) are kept; anything else is removed.
ADDR_PROV = ("서울특별시|서울시|서울|경기도|경기|인천광역시|인천시|인천|부산광역시|부산|대구광역시|대구|"
             "광주광역시|광주|대전광역시|대전|울산광역시|울산|세종특별자치시|세종|강원특별자치도|강원도|강원|"
             "충청북도|충청남도|충북|충남|전북특별자치도|전라북도|전라남도|전북|전남|경상북도|경상남도|경북|경남|"
             "제주특별자치도|제주도|제주")
ADDR_ADMIN = r"[가-힣]{1,6}(?:시|군|구|읍|면)"
ADDR_ROAD = r"[가-힣0-9]{1,12}(?:로|길)(?: ?[0-9]{1,4}번?길)? ?[0-9]{1,4}(?:-[0-9]{1,4})?"
ADDR_LOT = r"[가-힣0-9]{1,10}(?:동|리|가)(?:[0-9]가)? ?[0-9]{1,5}(?:-[0-9]{1,5})?"
ADDR_UNIT = r"(?:[0-9]{1,4} ?동(?: ?[0-9]{1,4} ?호)?|[0-9]{1,4} ?호|[가-힣A-Za-z]+(?:아파트|빌라|연립|맨션|오피스텔))"
ADDR_TAIL = r"(?:(?: [가-힣A-Za-z0-9]{1,20}){0,5} %s)?" % ADDR_UNIT
ADDRESS = re.compile(r"(?<![가-힣0-9])(?:(?:%s) )?(?:%s ){1,3}(?:%s|%s)(?![0-9])%s(?![가-힣0-9])"
                     % (ADDR_PROV, ADDR_ADMIN, ADDR_ROAD, ADDR_LOT, ADDR_TAIL))
# District-only home address right after a move notice: "이사하였습니다.(강북구 수유동)".
ADDR_AREA = re.compile(r"(?<![가-힣])(?:(?:%s) )?(?:%s ){0,2}%s ?[가-힣0-9]{1,8}(?:동|읍|면|리)(?![가-힣])%s(?![가-힣0-9])"
                       % (ADDR_PROV, ADDR_ADMIN, r"[가-힣]{1,6}(?:시|군|구)", ADDR_TAIL))
ADDR_UNIT_ONLY = re.compile(r"(?<![0-9])[0-9]{1,4} ?동 ?[0-9]{1,4} ?호(?![가-힣])")
HAS_UNIT = re.compile(r"[0-9] ?동|[0-9] ?호|단지|아파트|빌라|연립|맨션|오피스텔")
OWN_ADDRESS = re.compile(r"청파로|서계동")
HOME_CUE = re.compile(r"이사|자택|거주|집 ?주소")
# A venue word directly before the address (교회 needs a name attached: 로고스교회, not 「우리 교회」).
VENUE_CUE = re.compile(r"[가-힣A-Za-z]교회|수양관|기도원|수련원|연수원|센터|호텔|학교|대학|홀|웨딩|예식장|컨벤션|회관|"
                       r"캠핑장|장례식장|병원|채플|성당|리조트|펜션|공원|빌딩|타워|노회|총회")
ADDR_WINDOW = 60
ADDR_MARK = "(주소 생략)"


def address_verdict(text, a, b):
    """'own' | 'venue' | 'home' | 'unsure' for the address text[a:b]."""
    span = text[a:b]
    if OWN_ADDRESS.search(span):
        return "own"
    if HAS_UNIT.search(span):
        return "home"
    before = text[max(0, a - ADDR_WINDOW):a]
    home = [m.end() for m in HOME_CUE.finditer(before)]
    venue = [m.end() for m in VENUE_CUE.finditer(before)]
    if home and (not venue or home[-1] >= venue[-1]):
        return "home"
    if venue:
        return "venue"
    return "unsure"


def remove_addresses(text, where):
    """Replace home addresses by ADDR_MARK; log each removal / kept venue by kind (never the text)."""
    out, pos = [], 0
    spans = []
    for m in ADDRESS.finditer(text):
        spans.append((m.start(), m.end(), "full"))
    for m in ADDR_AREA.finditer(text):
        if any(a < m.end() and m.start() < b for a, b, _ in spans):
            continue
        before = text[max(0, m.start() - 30):m.start()]
        if HOME_CUE.search(before) and not OWN_ADDRESS.search(m.group(0)):
            spans.append((m.start(), m.end(), "area"))
    for m in ADDR_UNIT_ONLY.finditer(text):
        if not any(a <= m.start() < b for a, b, _ in spans):
            spans.append((m.start(), m.end(), "unit"))
    for a, b, how in sorted(spans):
        if a < pos:
            continue
        verdict = "home" if how in ("unit", "area") else address_verdict(text, a, b)
        if verdict == "own":
            continue
        if verdict == "venue":
            R.addr_kept.append(where)
            continue
        kind = {"home": "집 주소", "unsure": "판단 불확실(지움)"}[verdict]
        if how == "area" and not HAS_UNIT.search(text[a:b]):
            kind = "집 주소(시 · 구 · 동까지만)"
        R.addr.append((where, kind))
        out.append(text[pos:a])
        out.append(ADDR_MARK)
        pos = b
    out.append(text[pos:])
    return "".join(out)


def mask_private(text, where, markdown=False):
    """Remove home addresses; mask phone numbers / e-mail addresses (not the church's own),
    주민등록번호 and card-like numbers; log each by kind (never the value)."""
    star = "\\*" if markdown else "*"
    if not text:
        return text
    text = remove_addresses(text, where)

    def rrn(m):
        R.masks.append((where, "주민등록번호"))
        return "(주민번호 생략)"

    def card(m):
        R.masks.append((where, "카드번호"))
        return "(카드번호 생략)"
    text = CARD.sub(card, RRN.sub(rrn, text))

    def ph(m):
        digits = m.group(1) + m.group(3) + m.group(5)
        if digits in CHURCH_PHONES:
            return m.group(0)
        kind = "휴대전화" if m.group(1).startswith("01") else "전화번호"
        R.masks.append((where, kind))
        return "%s-%s-%s" % (m.group(1), star * len(m.group(3)), star * 4)

    def em(m):
        if m.group(0).lower() in CHURCH_EMAILS:
            return m.group(0)
        R.masks.append((where, "이메일"))
        return "(이메일 가림)"

    return EMAIL.sub(em, PHONE.sub(ph, text))


# Korean personal names (report only — nothing is changed in the output).
SURNAMES = "김이박최정강조윤장임한오서신권황안송류유전홍고문양손배백허남심노하곽성차주우구민진나지엄채원천방공현함변염여추도소석선설마길연위표명기반왕금옥육인맹제모탁국어은편용예봉경"
NAME3 = "[%s][가-힣]{2}" % SURNAMES
TITLES = "권사|집사|장로|성도|청년|목사|전도사|강도사|선교사|사모|간사|어린이|학생|형제|자매|교수|안수집사|권찰|구역장"
HONOR = re.compile(r"(?<![가-힣])(%s)\s?(?:%s)(?:님)?(?![가-힣]{2})" % (NAME3, TITLES))
NAMELIST = re.compile(r"(?<![가-힣])%s(?:\s*[,、·/]\s*%s){2,}(?![가-힣])" % (NAME3, NAME3))
NAMESEQ = re.compile(r"(?<![가-힣])%s(?:\s+%s){2,}\s+(?:%s)" % (NAME3, NAME3, TITLES))
NOT_NAMES = {"선교사", "전도사", "강도사", "교구장", "장로교", "주일학", "청년부", "이번주", "오늘은", "우리의"}


def name_hits(text, public):
    hits = []
    for rx in (NAMELIST, NAMESEQ, HONOR):
        for m in rx.finditer(text):
            names = re.findall(NAME3, m.group(0))
            names = [n for n in names if n not in public and n not in NOT_NAMES]
            if names:
                hits.append((m.start(), m.end(), names))
    return hits


NAME2_NEAR = re.compile(r"(?<![가-힣])([%s])[가-힣](?=\s*[,、·/)]|\s+(?:%s))" % (SURNAMES, TITLES))


def mask_names(s):
    s = re.sub(NAME3, lambda m: m.group(0)[0] + "○○", s)
    return NAME2_NEAR.sub(lambda m: m.group(1) + "○", s)


def record_names(board, file, text, public):
    hits = name_hits(text, public)
    if not hits:
        return
    a, b, _ = min(hits)
    ex = text[max(0, a - 25): b + 25].replace("\n", " ")
    R.names[board].append((file, mask_names(ex)))


# ------------------------------------------------------------------ YAML helpers

PLAIN_OK = re.compile(r"^[^\s\-?:,\[\]{}#&*!|>'\"%@`0-9+.~=<][^#]*$")
YAML_WORDS = {"true", "false", "null", "yes", "no", "on", "off", "y", "n", "~"}


def q(s):
    """A YAML scalar for a string: plain when unambiguous, else JSON-style double quotes."""
    s = str(s)
    if (PLAIN_OK.match(s) and ": " not in s and not s.endswith(":") and " #" not in s
            and s.lower() not in YAML_WORDS and s == s.strip() and "\n" not in s and "\t" not in s):
        return s
    return json.dumps(s, ensure_ascii=False)


def legacy_lines(board, seq, url):
    return ["legacy:", "  board: %s" % board, "  seq: %s" % seq, "  url: %s" % q(url)]


# ------------------------------------------------------------------ HTML -> Markdown

B_OPEN, B_CLOSE, BR = "", "", ""
BLOCK = {"p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol", "table", "tbody", "thead",
         "tr", "blockquote", "section", "article", "center", "hr", "pre", "dl", "dt", "dd", "figure"}
# Elements whose whole content is dropped. A depth is tracked only for these (a stack, so a missing
# close tag of an inner one cannot swallow the rest of the post). `option` is not here: it is only
# ever inside <select>, and its close tag is optional, so it would never be popped.
SKIP = {"script", "style", "noscript", "head", "title", "iframe", "object", "video", "audio",
        "select", "textarea", "button", "svg", "map"}
# Void elements (no children, no close tag) that are dropped: only the tag itself is skipped.
SKIP_VOID = {"embed", "input", "param", "source", "track", "link", "meta", "base", "area", "wbr", "col", "keygen"}
INNER_CELL = {"br", "p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol", "center", "blockquote"}
MD_ESC = re.compile(r"([\\`*_\[\]<>])")
ENTITY_LIKE = re.compile(r"&(?=#?[A-Za-z0-9]+;)")
LEFTOVER_TAG = re.compile(r"</?[A-Za-z][A-Za-z0-9:-]*(?:\s[^<>]*)?/?>")


def md_escape(s):
    s = s.replace("{{", "{ {").replace("}}", "} }")
    return ENTITY_LIKE.sub(r"\\&", MD_ESC.sub(r"\\\1", s))


class ToMarkdown(HTMLParser):
    """Paragraphs, line breaks, links, bold and images; everything else becomes plain text."""

    def __init__(self, image_cb, base_url=OLD_BASE + "/"):
        super().__init__(convert_charrefs=True)
        self.image_cb = image_cb  # src -> markdown image line or None
        self.base_url = base_url  # the post's old detail URL: relative links resolve against it
        self.blocks = []
        self.cur = []
        self.skip = []  # open SKIP elements (innermost last)
        self.bold = 0
        self.link = None  # [href, start index in cur]
        self.li_pending = False
        self.cells = 0
        self.in_cell = 0  # inside <td>/<th>: inner blocks and <br> become spaces, the row is one line

    def flush(self):
        text = "".join(self.cur)
        self.cur = []
        self.link = None
        if self.bold:
            text += B_CLOSE
        for para in re.split(BR + r"\s*(?:" + BR + r"\s*)+", text):
            p = render_para(para)
            if p:
                self.blocks.append(p)
        if self.bold:
            self.cur.append(B_OPEN)

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        a = dict(attrs)
        if tag in SKIP_VOID:
            return
        if tag in SKIP:
            self.skip.append(tag)
            return
        if self.skip:
            return
        if self.in_cell and tag in INNER_CELL:
            self.cur.append(" ")
        elif tag == "br":
            self.cur.append(BR)
        elif tag in BLOCK:
            self.flush()
            self.in_cell = 0
            if tag == "li":
                self.cur.append("- ")
            elif tag == "tr":
                self.cells = 0
        elif tag in ("td", "th"):
            if self.cells:
                self.cur.append(" · ")
            self.cells += 1
            self.in_cell += 1
        elif tag in ("b", "strong"):
            if self.bold == 0:
                self.cur.append(B_OPEN)
            self.bold += 1
        elif tag == "a":
            self.link = [a.get("href") or "", len(self.cur)]
        elif tag == "img":
            line = self.image_cb(a.get("src") or "")
            if line:
                self.flush()
                self.blocks.append(line)

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in SKIP_VOID:
            return  # a stray </embed> closes nothing
        if tag in SKIP:
            if tag in self.skip:  # close it and anything left open inside it
                del self.skip[len(self.skip) - 1 - self.skip[::-1].index(tag):]
            return
        if self.skip:
            return
        if self.in_cell and tag in INNER_CELL:
            self.cur.append(" ")
        elif tag in ("td", "th"):
            self.in_cell = max(0, self.in_cell - 1)
        elif tag == "br":
            self.cur.append(BR)
        elif tag in BLOCK:
            self.flush()
            self.in_cell = 0
        elif tag in ("b", "strong") and self.bold:
            self.bold -= 1
            if self.bold == 0:
                self.cur.append(B_CLOSE)
        elif tag == "a" and self.link:
            href, start = self.link
            self.link = None
            inner = "".join(self.cur[start:])
            url = link_url(href, self.base_url)
            if url and inner.strip(B_OPEN + B_CLOSE + BR + " "):
                del self.cur[start:]
                self.cur.append("[" + inner + "](" + url + ")")

    def handle_data(self, data):
        if self.skip:
            return
        t = re.sub(r"[\s ​﻿]+", " ", data)
        t = LEFTOVER_TAG.sub("", t)
        if t:
            self.cur.append(md_escape(t))

    def result(self):
        self.flush()
        return "\n\n".join(self.blocks)


def link_url(href, base_url=OLD_BASE + "/"):
    """An absolute http(s) link for an <a href>, resolved against the post's old detail URL
    (`../notice.asp`, `/x`, `//host/x`, `?page=2` all work); None for other schemes
    (javascript:, mailto:, …) and for page-internal `#…` / empty links."""
    href = htmllib.unescape(href or "").strip()
    if not href or href.startswith("#"):
        return None
    try:
        href = urljoin(base_url or OLD_BASE + "/", href)
    except ValueError:
        return None
    if not re.match(r"^https?://[^/?#\s]", href, re.I):
        return None
    return href.replace(" ", "%20").replace("(", "%28").replace(")", "%29").replace("<", "%3C").replace(">", "%3E")


def render_bold(line):
    """Turn bold sentinels into **…**, moving spaces outside and dropping empty spans."""
    out, buf, depth = [], [], 0
    for ch in line:
        if ch == B_OPEN:
            if depth == 0:
                out.append("".join(buf))
                buf = []
            depth += 1
        elif ch == B_CLOSE:
            if depth:
                depth -= 1
                if depth == 0:
                    inner = "".join(buf)
                    buf = []
                    core = inner.strip()
                    if core:
                        lead = inner[: len(inner) - len(inner.lstrip())]
                        trail = inner[len(inner.rstrip()):]
                        out.append(lead + "**" + core + "**" + trail)
                    else:
                        out.append(inner)
        else:
            buf.append(ch)
    inner = "".join(buf)
    if depth and inner.strip():
        out.append("**" + inner.strip() + "**")
    else:
        out.append(inner)
    return "".join(out)


def render_para(para):
    lines = []
    carry = False
    for raw in para.split(BR):
        if carry:
            raw = B_OPEN + raw
        opens = raw.count(B_OPEN) - raw.count(B_CLOSE)
        carry = opens > 0
        if carry:
            raw = raw + B_CLOSE
        line = render_bold(raw)
        line = re.sub(r"[ \t]+", " ", line).strip()
        if line.replace("*", "").strip():
            lines.append(escape_line_start(line))
    return "\\\n".join(lines)


def escape_line_start(line):
    if re.match(r"^(#|>|=+\s*$|-{3,}\s*$|(?:-\s+){2,}-\s*$|\+\s)", line):
        return "\\" + line
    m = re.match(r"^(\d{1,9})([.)])(\s|$)", line)
    if m:
        return m.group(1) + "\\" + line[len(m.group(1)):]
    return line


def html_to_md(body_html, image_cb, base_url=OLD_BASE + "/"):
    p = ToMarkdown(image_cb, base_url)
    p.feed(body_html or "")
    p.close()
    return p.result().strip()


# ------------------------------------------------------------------ photos


class Photos:
    def __init__(self, manifest_path):
        m = json.load(open(manifest_path, encoding="utf-8"))
        self.by_url = m["photos"]
        self.by_norm = {}
        for u, rec in self.by_url.items():
            for k in self._variants(u):
                self.by_norm.setdefault(k, rec)
        self.by_item = defaultdict(list)
        for u, rec in self.by_url.items():
            for r in rec.get("references", []):
                self.by_item[(r["board_key"], int(r["seq"]))].append((r["position"], u, rec))
        for v in self.by_item.values():
            v.sort(key=lambda x: x[0])
        self.ok_keys = {rec["key"]: rec for rec in self.by_url.values() if rec.get("status") == "ok"}

    @staticmethod
    def _variants(u):
        n = crawl.norm_url(u) or u
        out = [u, n, n.split("?")[0], unquote(n), unquote(n.split("?")[0])]
        return [re.sub(r"/{2,}", "/", x) for x in out] + out

    def resolve(self, rec):
        """(key, thumbKey, rec) for a downloaded photo; None when it failed.
        `sameFileAs` is NOT followed: photos.py picks it by file-name tail only, so it can
        name a different photo. A failed photo is left out and listed as 사진 없음."""
        if rec.get("status") == "ok":
            return rec["key"], rec["thumbKey"], rec
        return None

    def find(self, src):
        """The manifest entry for a photo URL as written in a page, or None."""
        if not src:
            return None
        for k in self._variants(src):
            rec = self.by_norm.get(k)
            if rec:
                return rec
        return None

    def item_photos(self, board, seq):
        """Every usable photo of an item in position order, one entry per distinct key."""
        out, seen = [], set()
        for _pos, u, rec in self.by_item.get((board, int(seq)), []):
            r = self.resolve(rec)
            if r is None:
                R.missing_photo(board, seq, u)
                continue
            if r[0] in seen:
                continue
            seen.add(r[0])
            out.append(r)
        return out


# ------------------------------------------------------------------ collection writer


class Writer:
    def __init__(self, out, public):
        self.out = out
        self.public = public
        self.files = {}  # relative path -> text
        self.binaries = {}  # absolute dest -> source file
        self.keep = set()  # absolute paths of existing files this run must not delete
        self.used = defaultdict(set)

    def new_id(self, coll, base):
        i, name = 1, base
        while name in self.used[coll]:
            i += 1
            name = "%s-%d" % (base, i)
        if i > 1:
            R.collisions[coll] += 1
        self.used[coll].add(name)
        return name

    def md(self, coll, ident, front, body):
        text = "---\n" + "\n".join(front) + "\n---\n"
        if body:
            text += "\n" + body.rstrip() + "\n"
        self.files["%s/%s.md" % (coll, ident)] = text

    def flush(self, replace):
        for coll in COLLECTIONS:
            os.makedirs(os.path.join(self.out, coll), exist_ok=True)
        stale = []  # (shown name, absolute path)
        for coll in COLLECTIONS:
            d = os.path.join(self.out, coll)
            for name in sorted(os.listdir(d)):
                rel = "%s/%s" % (coll, name)
                if name.endswith(".md") and not name.startswith("_") and rel not in self.files:
                    stale.append(("content/" + rel, os.path.join(d, name)))
        bdir = os.path.join(self.public, "bulletins")
        if os.path.isdir(bdir):
            for name in sorted(os.listdir(bdir)):
                p = os.path.join(bdir, name)
                if name.endswith(".pdf") and p not in self.binaries and p not in self.keep:
                    stale.append(("public/bulletins/" + name, p))
        if stale and not replace:
            print("warning: %d existing files are not written by this run (use --replace to remove them): %s"
                  % (len(stale), ", ".join(s for s, _ in stale[:10])), file=sys.stderr)
        elif stale:
            for shown, p in stale:
                os.remove(p)
                R.replaced.append(shown)
        for rel, text in sorted(self.files.items()):
            p = os.path.join(self.out, rel)
            os.makedirs(os.path.dirname(p), exist_ok=True)
            if os.path.exists(p):
                if open(p, encoding="utf-8").read() == text:
                    continue
                if rel.endswith(".md"):
                    R.overwritten.append("content/" + rel)
            with open(p, "w", encoding="utf-8", newline="\n") as f:
                f.write(text)
        for dest, src in sorted(self.binaries.items()):
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            if os.path.exists(dest) and os.path.getsize(dest) == os.path.getsize(src) and sha(dest) == sha(src):
                continue
            shutil.copyfile(src, dest)


def sha(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


# ------------------------------------------------------------------ helpers


def load_board(crawl_dir, b):
    assert b not in EXCLUDED
    return json.load(open(os.path.join(crawl_dir, "boards", b + ".json"), encoding="utf-8"))["items"]


def clean_title(s):
    s = htmllib.unescape(s or "")
    s = LEFTOVER_TAG.sub("", s)
    s = re.sub(r"[\s ​﻿]+", " ", s).strip()
    return s.replace("{{", "{ {").replace("}}", "} }")


def is_date(s):
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})$", s or "")
    if not m:
        return False
    y, mo, d = map(int, m.groups())
    try:
        datetime.date(y, mo, d)
        return True
    except ValueError:
        return False


def ymd(y, m, d):
    s = "%04d-%02d-%02d" % (y, m, d)
    return s if is_date(s) else None


def videos_of(item, board):
    yts = [v["id"] for v in item.get("videos") or [] if v.get("host") == "youtube" and YOUTUBE_ID.match(v.get("id", ""))]
    yts = list(dict.fromkeys(yts))
    vimeo = [v for v in item.get("videos") or [] if v.get("host") == "vimeo"]
    if vimeo:
        R.vimeo_dropped[board] += len(vimeo)
        if not yts:
            R.vimeo_only[board] += 1
    return yts


def legacy_url(item):
    u = item.get("detail_url") or ""
    return OLD_BASE + u if u.startswith("/") else u


def image_line(alt):
    alt = re.sub(r"[\[\]*_\\`<>]", "", alt or "").strip()

    def line(key):
        return "![%s](%s)" % (alt, key)
    return line


def body_md(item, board, photos, where, title, drop_keys=(), keep_images=True, used=None):
    """Body Markdown; `used` (a list) collects the photo records written into the body, in order."""
    mk = image_line(title)
    misses = []

    def cb(src):
        rec = photos.find(src)
        if rec is None:
            if src:
                misses.append(src)
            return None
        r = photos.resolve(rec)
        if r is None:
            R.missing_photo(board, item.get("seq"), src)
            return None
        if not keep_images or r[0] in drop_keys:
            return None
        if used is not None:
            used.append(r)
        return mk(r[0])

    md = html_to_md(item.get("body_html") or "", cb, legacy_url(item) or OLD_BASE + "/")
    if misses:
        R.notes[board].append("seq %s: 본문 사진 %d장을 목록에서 찾지 못해 뺐습니다" % (item.get("seq"), len(misses)))
    return mask_private(md, where, markdown=True)


def front_title(title, where):
    return mask_private(title, where)


# ------------------------------------------------------------------ boards


# "220814 - ", "230730_", "2016-01-03 ", "2018-12-2 ", "20-02-16 " at the start of sermon / praise
# titles (the date is in `date:`).
DATE_PREFIX = re.compile(r"^(?:\d{6}|\d{4}-\d{1,2}-\d{1,2}|\d{2}-\d{2}-\d{2})(?:\s*[-–_]\s*|\s+)")


def strip_date_prefix(title):
    return DATE_PREFIX.sub("", title) or title


def sermon_fields(item):
    # The post title is what the old list and page showed; the body's
    # `▶ 설교제목` is only a fallback (it can disagree — m6 review).
    bf = item.get("body_fields") or {}
    title = clean_title(item.get("title") or item.get("title_raw") or bf.get("설교제목"))
    title = strip_date_prefix(title)
    preacher = clean_title(item.get("author") or bf.get("설교자") or "")
    scripture = clean_title(item.get("chapter") or bf.get("성경본문") or "")
    return title, preacher, scripture


FIELD_LINE = re.compile(r"^▶\s*(설교일|설교자|설교제목|성경본문)\s*:\s*(.*)$")


def field_date(v):
    """`2023.12. 17` → `2023-12-17`, or None."""
    m = re.match(r"^(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})\.?$", v.strip())
    return "%s-%02d-%02d" % (m.group(1), int(m.group(2)), int(m.group(3))) if m else None


def strip_field_lines(md, shown):
    """Drop an old `▶ 설교자 : …` line only when the front matter shows the same
    value (`shown`: label → value; 설교일 as an ISO date). A line that differs
    (another title, the sermon day when it was posted later) stays in the body,
    so nothing the old page showed is lost or silently replaced."""
    def same(line):
        m = FIELD_LINE.match(line.strip())
        if not m:
            return False
        # compare the text as shown: Markdown escapes ("\\>") are not part of the value
        label, value = m.group(1), re.sub(r"\\(.)", r"\1", m.group(2)).strip()
        if label == "설교일":
            return field_date(value) == shown.get(label)
        if label == "설교제목":
            value = strip_date_prefix(clean_title(value))
        return bool(value) and value == shown.get(label)

    paras = []
    for p in md.split("\n\n"):
        lines = [l for l in p.split("\\\n") if l.strip() and not same(l)]
        if lines:
            paras.append("\\\n".join(lines))
    return "\n\n".join(paras)


def extra_video_links(yts):
    return "\n\n".join("[영상 %d](https://youtu.be/%s)" % (i + 2, v) for i, v in enumerate(yts[1:]))


def conv_sermons(W, crawl_dir, photos, public):
    items = []
    for board, kind in (("media_1", "주일예배"), ("media_2", "금요기도회")):
        for it in load_board(crawl_dir, board):
            R.board(board)["in"] += 1
            items.append((board, kind, it))
    items.sort(key=lambda x: (x[2].get("date") or "", x[0], int(x[2]["seq"])))
    for board, kind, it in items:
        if not it.get("ok"):
            R.skip(board, "수집 실패 항목")
            continue
        date = it.get("date")
        if not is_date(date):
            R.skip(board, "날짜 없음")
            continue
        title, preacher, scripture = sermon_fields(it)
        if not title:
            R.skip(board, "제목 없음")
            continue
        ident = W.new_id("sermons", date)
        where = "sermons/%s.md" % ident
        yts = videos_of(it, board)
        front = ["title: %s" % q(front_title(title, where)), "date: %s" % date, "kind: %s" % kind]
        if preacher:
            front.append("preacher: %s" % q(mask_private(preacher, where)))
        if scripture:
            front.append("scripture: %s" % q(mask_private(scripture, where)))
        if yts:
            front.append("video: https://youtu.be/%s" % yts[0])
        front += legacy_lines(board, it["seq"], legacy_url(it))
        shown = {"설교제목": title, "설교일": date, "설교자": preacher, "성경본문": scripture}
        body = strip_field_lines(body_md(it, board, photos, where, title), shown)
        extra = extra_video_links(yts)
        body = "\n\n".join(x for x in (body, extra) if x)
        record_names(board, where, title + "\n" + body, public)
        W.md("sermons", ident, front, body)
        R.board(board)["written"] += 1


def conv_praise(W, crawl_dir, photos, public):
    board = "media_3"
    items = sorted(load_board(crawl_dir, board), key=lambda it: (it.get("date") or "", int(it["seq"])))
    for it in items:
        R.board(board)["in"] += 1
        if not it.get("ok") or not is_date(it.get("date")):
            R.skip(board, "수집 실패 · 날짜 없음")
            continue
        title = strip_date_prefix(clean_title(it.get("title") or it.get("title_raw")))
        if not title:
            R.skip(board, "제목 없음")
            continue
        ident = W.new_id("praise", it["date"])
        where = "praise/%s.md" % ident
        yts = videos_of(it, board)
        front = ["title: %s" % q(front_title(title, where)), "date: %s" % it["date"]]
        if yts:
            front.append("video: https://youtu.be/%s" % yts[0])
        front += legacy_lines(board, it["seq"], legacy_url(it))
        # Praise bodies are never shown (content/README.md): only the title is kept.
        record_names(board, where, title, public)
        W.md("praise", ident, front, "")
        R.board(board)["written"] += 1


def conv_videos(W, crawl_dir, photos, public):
    board = "s_board_3"
    items = sorted(load_board(crawl_dir, board), key=lambda it: (it.get("date") or "", int(it["seq"])))
    for it in items:
        R.board(board)["in"] += 1
        if not it.get("ok") or not is_date(it.get("date")):
            R.skip(board, "수집 실패 · 날짜 없음")
            continue
        title = clean_title(it.get("title") or it.get("title_raw"))
        ident = W.new_id("videos", it["date"])
        where = "videos/%s.md" % ident
        yts = videos_of(it, board)
        front = ["title: %s" % q(front_title(title, where)), "date: %s" % it["date"]]
        if yts:
            front.append("video: https://youtu.be/%s" % yts[0])
        else:
            ph = photos.item_photos(board, it["seq"])
            if ph:
                front += ["thumbnail:", "  src: %s" % ph[0][0], "  thumb: %s" % ph[0][1]]
        front += legacy_lines(board, it["seq"], legacy_url(it))
        body = body_md(it, board, photos, where, title)
        body = "\n\n".join(x for x in (body, extra_video_links(yts)) if x)
        record_names(board, where, title + "\n" + body, public)
        W.md("videos", ident, front, body)
        R.board(board)["written"] += 1


ALBUM_RULES = [
    ("수련회", r"수련회|수양회|MT|엠티|워크샵|워크숍|캠프|아웃팅|기도원"),
    ("선교", r"선교|비전트립|아웃리치|전도|파송"),
    ("교육", r"교육|성경공부|세미나|암송|진급|수료|졸업|학교|코딩|제자훈련|강의|테스트|에니어그램|통독"),
    ("행사", r"척사|야유|체육|운동회|음악회|칸타타|바자회|연주회|공연|장례|임직|은퇴|김장|행사|페스티벌|노회|시찰회|축제|뮤지컬|영화|나눔|연탄|모임|월례회|회의|청소|단합|정리|챔버|카페|포토존|윷놀이|방문|전시회|꽃|시네마"),
    ("예배", r"예배|주일|부활|성탄|추수감사|맥추|세례|성찬|월삭|신년|기도회|헌신|부흥|사경회|찬양|봉헌송|고난주간|성금요일|사순절"),
]


def album_category(title):
    for cat, rx in ALBUM_RULES:
        if re.search(rx, title, re.I):
            return cat
    return "기타"


def conv_albums(W, crawl_dir, photos, public):
    board = "s_board_1"
    items = sorted(load_board(crawl_dir, board), key=lambda it: (it.get("date") or "", int(it["seq"])))
    cats = Counter()
    for it in items:
        R.board(board)["in"] += 1
        if not it.get("ok") or not is_date(it.get("date")):
            R.skip(board, "수집 실패 · 날짜 없음")
            continue
        ph = photos.item_photos(board, it["seq"])
        if not ph:
            R.skip(board, "받은 사진 없음")
            continue
        title = clean_title(it.get("title") or it.get("title_raw"))
        ident = W.new_id("albums", it["date"])
        where = "albums/%s.md" % ident
        cat = album_category(title)
        cats[cat] += 1
        front = ["title: %s" % q(front_title(title, where)), "date: %s" % it["date"], "category: %s" % cat, "photos:"]
        for key, thumb, rec in ph:
            front += ["  - src: %s" % key, "    thumb: %s" % thumb]
            if rec.get("width") and rec.get("height"):
                front += ["    width: %d" % rec["width"], "    height: %d" % rec["height"]]
        front += legacy_lines(board, it["seq"], legacy_url(it))
        body = body_md(it, board, photos, where, title, keep_images=False)
        record_names(board, where, title + "\n" + body, public)
        W.md("albums", ident, front, body)
        R.board(board)["written"] += 1
    R.notes[board].append("분류: " + ", ".join("%s %d" % kv for kv in cats.most_common()))


EVENT_RULES = [
    ("선교", r"선교|비전트립|아웃리치"),
    ("교육", r"교육|성경공부|세미나|교사|수련회|MT|캠프|리더|진급|훈련"),
    ("예배", r"예배|주일|부활|성탄|추수감사|기도회|월삭|신년|사경회|헌신"),
]


def event_category(title):
    for cat, rx in EVENT_RULES:
        if re.search(rx, title, re.I):
            return cat
    return "행사"


EV_PREFIX = re.compile(r"^(\d{2})-(\d{1,2})-(\d{1,2})(?:\s*~\s*(?:(\d{1,2})\s*[-/.]\s*)?(\d{1,2}))?\s*")
EV_KOREAN = re.compile(r"^(\d{1,2})월\s*(\d{1,2})일\s*")


def event_dates(title, post_date):
    m = EV_PREFIX.match(title)
    if m:
        y, mo, d = 2000 + int(m.group(1)), int(m.group(2)), int(m.group(3))
        start = ymd(y, mo, d)
        end = None
        if m.group(5):
            emo = int(m.group(4)) if m.group(4) else mo
            end = ymd(y + (1 if emo < mo else 0), emo, int(m.group(5)))
        return start, end, title[m.end():].strip() or title, "제목 앞 날짜"
    m = EV_KOREAN.match(title)
    if m and is_date(post_date):
        start = ymd(int(post_date[:4]), int(m.group(1)), int(m.group(2)))
        return start, None, title, "제목의 월 · 일 + 글 쓴 해"
    return None, None, title, None


def conv_events(W, crawl_dir, photos, public):
    board = "s_board_5"
    rows = []
    for it in load_board(crawl_dir, board):
        R.board(board)["in"] += 1
        if not it.get("ok"):
            R.skip(board, "수집 실패 항목")
            continue
        raw = clean_title(it.get("title") or it.get("title_raw"))
        start, end, title, how = event_dates(raw, it.get("date"))
        if not start:
            if not is_date(it.get("date")):
                R.skip(board, "날짜를 알 수 없음")
                continue
            start, how = it["date"], "글 쓴 날짜(제목에 날짜 없음)"
            R.notes[board].append("seq %s: 제목에 날짜가 없어 글 쓴 날짜 %s를 썼습니다" % (it["seq"], start))
        if end and end < start:
            end = None
        rows.append((start, int(it["seq"]), it, title, end, how))
    rows.sort(key=lambda r: (r[0], r[1]))
    for start, _seq, it, title, end, how in rows:
        ident = W.new_id("events", start)
        where = "events/%s.md" % ident
        front = ["title: %s" % q(front_title(title, where)), "start: %s" % start]
        if end and end != start:
            front.append("end: %s" % end)
        front.append("category: %s" % event_category(title))
        ph = photos.item_photos(board, it["seq"])
        drop = ()
        if ph:
            front += ["image:", "  src: %s" % ph[0][0], "  thumb: %s" % ph[0][1]]
            drop = (ph[0][0],)
        front += legacy_lines(board, it["seq"], legacy_url(it))
        body = body_md(it, board, photos, where, title, drop_keys=drop)
        record_names(board, where, title + "\n" + body, public)
        W.md("events", ident, front, body)
        R.board(board)["written"] += 1


NEWS_PREFIX = re.compile(r"^(\d{2})[-.](\d{1,2})[-.](\d{1,2})(?!\d)")


def conv_news(W, crawl_dir, photos, public):
    board = "s_board_6"
    rows = []
    for it in load_board(crawl_dir, board):
        R.board(board)["in"] += 1
        if not it.get("ok"):
            R.skip(board, "수집 실패 항목")
            continue
        title = clean_title(it.get("title") or it.get("title_raw"))
        m = NEWS_PREFIX.match(title)
        date = ymd(2000 + int(m.group(1)), int(m.group(2)), int(m.group(3))) if m else None
        if not date:
            date = it.get("date") if is_date(it.get("date")) else None
        if not date:
            R.skip(board, "날짜 없음")
            continue
        rows.append((date, int(it["seq"]), it, title))
    rows.sort(key=lambda r: (r[0], r[1]))
    for date, _seq, it, title in rows:
        ident = W.new_id("news", date)
        where = "news/%s.md" % ident
        videos_of(it, board)  # Vimeo only on this board: counted, never written
        front = ["title: %s" % q(front_title(title, where)), "date: %s" % date, "category: 소식"]
        used = []
        body = body_md(it, board, photos, where, title, used=used)
        # The body keeps every photo where it was; the first one (else the item's first photo) also
        # goes into `images:` so the news list thumbnail and the share preview (OG) can use it.
        lead = used[0] if used else (photos.item_photos(board, it["seq"]) or [None])[0]
        if lead:
            front += ["images:", "  - src: %s" % lead[0], "    thumb: %s" % lead[1]]
        front += legacy_lines(board, it["seq"], legacy_url(it))
        record_names(board, where, title + "\n" + body, public)
        W.md("news", ident, front, body)
        R.board(board)["written"] += 1


# ------------------------------------------------------------------ bulletins (PDF download)


def front_matter(fn):
    """Top-level scalars of a content file's front matter, plus `legacy.seq` as "legacy.seq".

    Reads only the plain forms this converter and content/README.md use: `key: value` ('single'
    or "double" quoted allowed) and `legacy:` followed by two-space `  key: value` lines. Anything
    else under `pdf` or `legacy` (a block or flow value, other indentation, a missing closing
    `---`) raises ValueError naming the file and key, so a hand-edited file stops the run before
    anything is deleted instead of silently losing its PDF link.
    """
    text = open(fn, encoding="utf-8").read()
    m = re.match(r"---\n(.*?\n)---(?:\n|$)", text, re.S)
    if not m:
        raise ValueError("%s: front matter (--- ... ---) not found" % fn)
    out, block = {}, None
    for line in m.group(1).split("\n"):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        top = re.match(r"([A-Za-z_][\w-]*):(.*)$", line)
        sub = re.match(r"  ([A-Za-z_][\w-]*):(.*)$", line)
        if not top and not line.startswith(" "):
            # a quoted ('legacy':), complex (? key) or otherwise unusual top-level key could be
            # `pdf` or `legacy` in disguise — never guess "not there"
            raise ValueError("%s: unsupported front matter line %r (write keys unquoted: `key: value`)" % (fn, line))
        if top:
            block = top.group(1)
            key, raw = block, top.group(2)
            if key == "legacy":
                if raw.strip() and not raw.strip().startswith("#"):
                    raise ValueError("%s: legacy: write it as a block of `  key: value` lines" % fn)
                continue
        elif block == "legacy" and sub:
            key, raw = "legacy." + sub.group(1), sub.group(2)
        elif block in ("pdf", "legacy"):
            raise ValueError("%s: %s: unsupported indentation %r" % (fn, block, line))
        elif block is None:
            # an indented first key (the whole mapping shifted right) would hide every key
            raise ValueError("%s: front matter must start with an unindented `key: value`, not %r" % (fn, line))
        else:
            continue
        if key not in ("pdf", "legacy.seq"):
            continue
        out[key] = yaml_scalar(raw, "%s: %s" % (fn, key))
    return out


def yaml_scalar(raw, where):
    v = raw.strip()
    if v.startswith('"'):
        m = re.match(r'"((?:[^"\\]|\\.)*)"\s*(?:#.*)?$', v)
        if not m or "\\" in m.group(1):
            raise ValueError("%s: unreadable value %r" % (where, v))
        return m.group(1)
    if v.startswith("'"):
        m = re.match(r"'((?:[^']|'')*)'\s*(?:#.*)?$", v)
        if not m:
            raise ValueError("%s: unreadable value %r" % (where, v))
        return m.group(1).replace("''", "'")
    v = re.sub(r"\s+#.*$", "", v)
    if not v or v[0] in "[{|>&*!%@`":
        raise ValueError("%s: unreadable value %r" % (where, v))
    return v


def prior_bulletin_pdfs(W):
    """legacy.seq -> the public PDF the existing bulletin file's front matter links to.

    Only a `pdf:` written in the current front matter counts (a leftover public file nothing
    links to is never reused), and only complete PDFs. Read before anything is written.
    """
    d = os.path.join(W.out, "bulletins")
    if not os.path.isdir(d):
        return {}
    out = {}
    for name in sorted(os.listdir(d)):
        if not name.endswith(".md") or name.startswith("_"):
            continue
        fm = front_matter(os.path.join(d, name))
        pdf, seq = fm.get("pdf"), fm.get("legacy.seq")
        m = pdf and re.fullmatch(r"/bulletins/([0-9a-z-]+\.pdf)", pdf)
        src = m and os.path.join(W.public, "bulletins", m.group(1))
        if seq and src and is_pdf_file(src):
            out.setdefault(seq, src)
    return out


def restore_cache(crawl_dir, items, prior):
    """For old PDFs this run could not get (`items`), put a previous run's linked public copy back into
    the cache <crawl>/weekly-pdf/. The cache outlives this run, so a run that fails midway (after
    deleting or overwriting public files) loses nothing: the next run finds the PDF there. Each copy
    is recorded in state.json with its size at once, so the next run accepts it as this run did
    (instead of rejecting it on an older expected size and restoring again from changed public files).
    Returns url -> cache file."""
    d = os.path.join(crawl_dir, "weekly-pdf")
    state_file = os.path.join(d, "state.json")
    restored = {}
    for it in items:
        u = it.get("file")
        src = u and prior.get(hashlib.sha1(u.encode()).hexdigest()[:10])
        if not src or u in restored:
            continue
        fn = os.path.join(d, hashlib.sha1(u.encode()).hexdigest()[:16] + ".pdf")
        os.makedirs(d, exist_ok=True)
        fd, tmp = tempfile.mkstemp(dir=d, prefix="." + os.path.basename(fn) + ".", suffix=".part")
        os.close(fd)
        try:
            shutil.copyfile(src, tmp)
            os.replace(tmp, fn)
        finally:
            if os.path.exists(tmp):
                os.remove(tmp)
        state = json.load(open(state_file, encoding="utf-8")) if os.path.exists(state_file) else {}
        state[u] = {"status": "ok", "bytes": os.path.getsize(fn), "file": os.path.basename(fn),
                    "note": "restored from a previous run's public copy (not re-checked against the old site)",
                    "at": crawl.now()}
        save_json_atomic(state_file, state)
        restored[u] = fn
    return restored


def pdf_complete(data):
    """A whole PDF: starts with %PDF-, ends with `startxref N %%EOF`, and N points at a cross-reference
    table or stream inside the file. A body cut short (even right after a printed "%%EOF") fails."""
    if not data.startswith(b"%PDF-"):
        return False
    m = re.search(rb"startxref\s+(\d+)\s+%%EOF\s*$", data[-1024:])
    if not m or int(m.group(1)) >= len(data):
        return False
    at = int(m.group(1))
    if re.match(rb"xref\s", data[at:at + 5]):
        return True
    # a cross-reference stream: the object there opens with a dictionary that says /Type /XRef
    # (at its own top level) and is followed directly by `stream`
    head = re.compile(rb"\d+\s+\d+\s+obj\s*<<").match(data, at)
    if not head:
        return False
    end, top = pdf_dict_end(data, head.end())
    return (end is not None and re.compile(rb"\s*stream\r?\n").match(data, end) is not None
            and re.search(rb"/Type\s*/XRef(?![\w#])", top) is not None)


def pdf_dict_end(data, i):
    """Scan a PDF dictionary whose `<<` ends just before `i`. Returns (index after its `>>`, the
    bytes at its own top level with each string and nested dictionary replaced by " () ", so
    "/Type (Catalog) /XRef 1" never reads as "/Type /XRef"), or (None, b"") when it does not close
    inside `data`."""
    depth, top, n = 1, bytearray(), len(data)
    while i < n:
        c = data[i:i + 1]
        if c == b"(":  # literal string: balanced parentheses, backslash escapes
            if depth == 1:
                top += b" () "
            level, i = 1, i + 1
            while i < n and level:
                ch = data[i:i + 1]
                if ch == b"\\":
                    i += 1
                elif ch == b"(":
                    level += 1
                elif ch == b")":
                    level -= 1
                i += 1
            continue
        if data.startswith(b"<<", i):
            if depth == 1:
                top += b" () "
            depth, i = depth + 1, i + 2
            continue
        if data.startswith(b">>", i):
            depth, i = depth - 1, i + 2
            if depth == 0:
                return i, bytes(top)
            continue
        if c == b"<":  # hex string
            j = data.find(b">", i)
            if j < 0:
                return None, b""
            if depth == 1:
                top += b" () "
            i = j + 1
            continue
        if c == b"%":  # comment to end of line
            while i < n and data[i:i + 1] not in (b"\r", b"\n"):
                i += 1
            continue
        if depth == 1:
            top += c
        i += 1
    return None, b""


def is_pdf_file(fn, want=None):
    """A regular file (not a symlink) holding a complete PDF and, when `want` is given, of that size."""
    if os.path.islink(fn) or not os.path.isfile(fn):
        return False
    if want and os.path.getsize(fn) != want:
        return False
    with open(fn, "rb") as f:
        return pdf_complete(f.read())


def save_json_atomic(path, obj):
    """Write JSON through a new temp file in the same folder (exclusive create), then replace."""
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path), prefix="." + os.path.basename(path) + ".", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=1, sort_keys=True)
        os.replace(tmp, path)
    except BaseException:
        if os.path.lexists(tmp):
            os.remove(tmp)
        raise


def download_pdfs(crawl_dir, items, delay, offline=False):
    """Every weekly PDF from the cache <crawl>/weekly-pdf/, fetching the missing ones unless `offline`.
    A cached file counts when it is a PDF of the size `binaries.json` (or, without a HEAD size, the
    state record) gives. Returns (url -> local file, [urls not obtained in this run]).
    The state file is written only when something changed (never when offline)."""
    d = os.path.join(crawl_dir, "weekly-pdf")
    state_file = os.path.join(d, "state.json")
    state = json.load(open(state_file, encoding="utf-8")) if os.path.exists(state_file) else {}
    before = json.dumps(state, sort_keys=True)
    bins_file = os.path.join(crawl_dir, "binaries.json")
    bins = json.load(open(bins_file, encoding="utf-8")) if os.path.exists(bins_file) else {}
    fetcher = None
    result, missing = {}, []
    todo = 0
    for it in items:
        u = it.get("file")
        if not u or u in result or u in missing:
            continue
        fn = os.path.join(d, hashlib.sha1(u.encode()).hexdigest()[:16] + ".pdf")
        rec = state.get(u) or {}
        # The size this run last accepted wins over the crawl's HEAD size, so a
        # source PDF that legitimately changed is not rejected on every rerun.
        want = rec.get("bytes") if rec.get("status") == "ok" else None
        want = want or (bins.get(u) or {}).get("size")
        if is_pdf_file(fn, want):
            result[u] = fn
            continue
        if offline:
            missing.append(u)
            continue
        todo += 1
        if fetcher is None:
            os.makedirs(d, exist_ok=True)
            fetcher = crawl.Fetcher(crawl_dir, delay=delay)
            fetcher.init_session()
        try:
            st, _hl, data = fetcher.raw("GET", u)
        except Exception as e:  # network trouble: keep going, the next run retries
            state[u] = {"status": "failed", "error": str(e)[:200], "at": crawl.now()}
            missing.append(u)
            continue
        # Same bar as the cache (is_pdf_file): a short or cut-off body never replaces a good file.
        if st != 200 or not pdf_complete(data):
            state[u] = {"status": "failed", "error": "HTTP %s, %d bytes (expected %s), not a complete PDF"
                        % (st, len(data), want or "?"), "at": crawl.now()}
            missing.append(u)
            continue
        fd, tmp = tempfile.mkstemp(dir=d, prefix="." + os.path.basename(fn) + ".", suffix=".part")
        with os.fdopen(fd, "wb") as f:
            f.write(data)
        os.replace(tmp, fn)
        state[u] = {"status": "ok", "bytes": len(data), "file": os.path.basename(fn), "at": crawl.now()}
        if want and want != len(data):
            state[u]["note"] = "size differs from HEAD (%s)" % want
        result[u] = fn
        if todo % 10 == 0:
            save_json_atomic(state_file, state)
            crawl.log("weekly pdf: %d fetched" % todo)
    for u, fn in result.items():
        state.setdefault(u, {"status": "ok", "bytes": os.path.getsize(fn), "file": os.path.basename(fn)})
    if not offline and json.dumps(state, sort_keys=True) != before:
        save_json_atomic(state_file, state)
    return result, missing


# Bulletin PDFs are scanned images, so the text rules above cannot reach them. An OCR pass
# (tesseract kor, 2026-11-27) found a home address or personal mobile numbers in 23 of them.
# User decision 2026-11-27: migrate the old site as it was and include those PDFs unchanged
# (privacy review happens later on the new site). Add a bulletin id here to keep its PDF out.
PDF_HOLD: dict[str, str] = {}


def conv_bulletins(W, crawl_dir, args):
    board = "weekly"
    items = load_board(crawl_dir, board)
    items.sort(key=lambda it: (it.get("date") or "", it.get("file") or ""))
    prior = prior_bulletin_pdfs(W)  # first: a hand-edited front matter stops the run before any work
    local, missing = download_pdfs(crawl_dir, items, args.delay, offline=args.no_download)
    restored = restore_cache(crawl_dir, [it for it in items if it.get("file") in missing], prior)
    local.update(restored)
    for it in items:
        R.board(board)["in"] += 1
        if not it.get("ok") or not is_date(it.get("date")):
            R.skip(board, "날짜 없음")
            continue
        ident = W.new_id("bulletins", it["date"])
        title = clean_title(it.get("title"))
        front = ["date: %s" % it["date"]]
        if title:
            front.append("title: %s" % q(title))
        seq = hashlib.sha1((it.get("file") or "").encode()).hexdigest()[:10]
        src = local.get(it.get("file") or "")
        if src and ident in PDF_HOLD:
            R.pdf_held.append((ident, PDF_HOLD[ident]))
        elif src:
            if it.get("file") in restored:
                R.pdf_restored.append(ident)
            front.append("pdf: /bulletins/%s.pdf" % ident)
            W.binaries[os.path.join(W.public, "bulletins", ident + ".pdf")] = src
        else:
            # No PDF in this run (offline without a cache, or the fetch failed). A previous run's
            # linked copy would have been put back into the cache above (restore_cache).
            R.pdf_missing.append(ident)
            R.notes[board].append("%s: PDF를 받지 못해 pdf 없이 적었습니다" % ident)
        url = OLD_BASE + it["detail_url"] if (it.get("detail_url") or "").startswith("/") else it.get("detail_url", "")
        front += legacy_lines(board, q(seq) if seq[0].isdigit() else seq, url)
        W.md("bulletins", ident, front, "")
        R.board(board)["written"] += 1
    R.notes[board].append("옛 주보에는 글 번호가 없어 legacy.seq는 PDF 주소의 SHA-1 앞 10자입니다")


# ------------------------------------------------------------------ history / staff

HISTORY_HEAD = """# 교회 연혁 — 「교회소개」 페이지가 읽는다.
#   - highlight: true 인 항목은 위쪽 「주요 연혁」 타임라인에 나온다.
#   - 모든 항목은 아래 「연혁 전체」에 10년 단위로 묶여 나온다(항목이 수백 건이어도 된다).
#   - date는 YYYY, YYYY-MM, YYYY-MM-DD 중 하나. 정확한 날짜를 모르면 년/월까지만 적는다.
# 항목을 더할 때 순서는 상관없다(날짜순으로 자동 정렬된다).
# 옛 사이트 교회연혁(scripts/migrate/convert.py로 옮김).
"""
HIGHLIGHT = re.compile(r"교회설립|새성전 입당|예배당 헌당식|위임목사 취임|설립 50주년")


def history_date(s):
    m = re.match(r"^(\d{4})\.(\d{1,2})?\.?(\d{1,2})?\.?$", (s or "").strip())
    if not m:
        return None
    y = int(m.group(1))
    if m.group(2) and m.group(3) and ymd(y, int(m.group(2)), int(m.group(3))):
        return ymd(y, int(m.group(2)), int(m.group(3)))
    if m.group(2) and 1 <= int(m.group(2)) <= 12:
        return "%04d-%02d" % (y, int(m.group(2)))
    return "%04d" % y


def conv_history(W, crawl_dir, public):
    board = "history"
    rows = []
    for it in load_board(crawl_dir, board):
        R.board(board)["in"] += 1
        date = history_date(it.get("date"))
        text = clean_title(it.get("text") or it.get("title"))
        if not date or not text:
            R.skip(board, "날짜 · 내용 없음")
            continue
        end = (it.get("date_end") or "").strip().rstrip(".")
        if end:
            text = "%s (~ %s)" % (text, end)
        text = mask_private(text, "history.yaml")
        rows.append((date, int(it["seq"]), text))
        record_names(board, "history.yaml (%s)" % date, text, public)
    rows.sort(key=lambda r: (r[0], -r[1]))
    lines = [HISTORY_HEAD]
    for date, _seq, text in rows:
        lines.append("- date: %s" % q(date))
        lines.append("  text: %s" % q(text))
        if HIGHLIGHT.search(text):
            lines.append("  highlight: true")
        R.board(board)["written"] += 1
    W.files["history.yaml"] = "\n".join(lines) + "\n"
    R.notes[board].append("legacy 칸이 연혁 스키마에 없어 옛 글 번호는 적지 않았습니다")


STAFF_HEAD = """# 교역자 · 직분자 명단 — 「교회소개」 페이지의 「교역자 소개」가 읽는다.
#   name   이름 (직분은 role에)       role   담임목사 · 부목사 · 전도사 …
#   group  카드 아래 작은 배지(부서·역할)   photo  사진 경로(없으면 자리표시)
#
# 주의: 이 파일은 공개 저장소에 그대로 올라간다(누구나 읽을 수 있고, 지워도 기록에 남는다).
#   본인이 홈페이지 공개에 동의한 연락처만 적는다. email · phone을 적으려면 publishContact: true 가
#   함께 있어야 하고, 없으면 빌드가 멈춘다. 공개하지 않을 연락처는 이 파일에 적지 않는다.
#   자세한 규칙은 content/README.md 「교역자 연락처」.
# 옛 사이트 「섬기는 분들」(scripts/migrate/convert.py로 옮김). 옛 사이트의 전화 · 이메일은 옮기지 않았다.
"""


def staff_names(crawl_dir):
    names = set()
    for it in load_board(crawl_dir, "staff"):
        for n in re.findall(r"[가-힣]{2,4}", it.get("name") or ""):
            names.add(n)
    return names


def conv_staff(W, crawl_dir, photos):
    board = "staff"
    lines = [STAFF_HEAD]
    dropped = 0
    for it in sorted(load_board(crawl_dir, board), key=lambda x: int(x["seq"])):
        R.board(board)["in"] += 1
        name, role = clean_title(it.get("name")), clean_title(it.get("duty"))
        if not name or not role:
            R.skip(board, "이름 · 직분 없음")
            continue
        dropped += len(it.get("phones") or []) + len(it.get("emails") or [])
        lines.append("- name: %s" % q(name))
        lines.append("  role: %s" % q(role))
        charge = [clean_title(c) for c in it.get("charge") or [] if clean_title(c)]
        if charge:
            lines.append("  group: %s" % q(mask_private(" · ".join(charge), "staff.yaml")))
        ph = photos.item_photos(board, it["seq"])
        if ph:
            lines.append("  photo: %s" % ph[0][0])
        bio = mask_private((it.get("intro") or "").strip(), "staff.yaml")
        if bio:
            bio = "\n".join(l.rstrip() for l in bio.replace("\r", "").split("\n") if l.strip())
            lines.append("  bio: |-")
            lines += ["    " + l for l in bio.split("\n")]
        R.board(board)["written"] += 1
    W.files["staff.yaml"] = "\n".join(lines) + "\n"
    R.notes[board].append("옛 사이트 전화 · 이메일 %d건은 어디에도 적지 않았습니다(publishContact 없음)" % dropped)
    R.notes[board].append("legacy 칸이 섬기는 분 스키마에 없어 옛 글 번호는 적지 않았습니다")


# ------------------------------------------------------------------ report file


SCAN = [
    ("주민등록번호 모양", RRN),
    ("카드번호 모양(16자리)", CARD),
    ("계좌번호 모양(은행 · 계좌 말 근처)", re.compile(
        r"(?:계좌|은행|농협|국민|신한|우리|하나|기업|우체국|새마을|신협|카카오뱅크|예금주)[^\n]{0,20}?"
        r"(?<![\d*])(?:\d{2,6}-\d{2,6}-\d{2,8}(?:-\d{1,4})?|\d{10,14})(?![\d*])")),
    ("차량번호 모양", re.compile(r"(?<![0-9])\d{2,3} ?[가나다라마거너더러머버서어저고노도로모보소오조구누두루무부수우주하허호배]"
                            r" ?\d{4}(?![0-9])")),
    ("전화번호(교회 번호 제외, 안 가린 것)", PHONE),
    ("휴대전화(붙여 쓴 것)", re.compile(r"(?<![\d*])01[016789]\d{7,8}(?![\d*])")),
    ("이메일(교회 제외)", EMAIL),
    ("IPv4", re.compile(r"(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?![\d.])")),
    ("주소 모양(지우지 않은 것)", ADDRESS),
    ("동 · 호 모양", ADDR_UNIT_ONLY),
]


def sensitive_scan(W):
    """[(kind, [file per hit])] over every written text file (nothing is changed)."""
    out = []
    for kind, rx in SCAN:
        hits = []
        for rel, text in sorted(W.files.items()):
            for m in rx.finditer(text):
                if rx is PHONE and m.group(1) + m.group(3) + m.group(5) in CHURCH_PHONES:
                    continue
                if rx is EMAIL and m.group(0).lower() in CHURCH_EMAILS:
                    continue
                if rx is ADDRESS and OWN_ADDRESS.search(m.group(0)):
                    continue
                hits.append(rel)
        out.append((kind, hits))
    return out


def legacy_of(W, where):
    m = re.search(r"\nlegacy:\n  board: (\S+)\n  seq: (\S+)\n", W.files.get(where, ""))
    return "%s seq %s" % m.groups() if m else "-"


def write_report(path, args, W):
    L = ["# 옛 게시판 → content/ 변환 보고 (scripts/migrate/convert.py)", "",
         "- 입력: `%s`" % args.crawl, "- 출력: `%s`" % args.out, "- 공개 파일(PDF): `%s`" % args.public, "",
         "## 게시판별 건수", "", "| 게시판 | 이름 | 들어옴 | 씀 | 건너뜀 | 건너뛴 이유 |", "|---|---|---:|---:|---:|---|"]
    for b in ("media_1", "media_2", "media_3", "s_board_3", "s_board_1", "s_board_5", "s_board_6", "weekly", "history", "staff"):
        c = R.counts.get(b, Counter())
        why = ", ".join("%s %d" % kv for kv in sorted(R.skips[b].items())) or "-"
        L.append("| %s | %s | %d | %d | %d | %s |" % (b, BOARD_NAMES[b], c["in"], c["written"], c["skipped"], why))
    L += ["| s_board_2 | 새가족소개 | - | 0 | - | 옮기지 않음(사용자 결정 11/27, 파일을 읽지 않음) |",
          "| s_board_4 | 중보기도 | - | 0 | - | 옮기지 않음(사용자 결정 11/27, 파일을 읽지 않음) |", ""]
    if R.collisions:
        L.append("같은 날짜 파일 이름 뒤 번호(-2, -3 …): " + ", ".join("%s %d" % kv for kv in sorted(R.collisions.items())))
        L.append("")
    L += ["## Vimeo (⑱ 재생 안 됨 → video 비움)", "",
          "| 게시판 | 영상이 Vimeo뿐이라 video 없이 옮긴 글 | 버린 Vimeo 링크 수 |", "|---|---:|---:|"]
    for b in sorted(R.vimeo_dropped):
        L.append("| %s %s | %d | %d |" % (b, BOARD_NAMES[b], R.vimeo_only[b], R.vimeo_dropped[b]))
    L += ["| 합계 | %d | %d |" % (sum(R.vimeo_only.values()), sum(R.vimeo_dropped.values())), ""]
    L += ["## 개인정보 가림", "",
          "작성자 IP · 작성자 아이디는 어떤 파일에도 쓰지 않는다. 교회 대표 번호(02-714-0041~3, 02-711-8166)와 "
          "교회 이메일은 그대로 둔다. 가린 값은 이 보고에도 적지 않는다.", ""]
    kinds = Counter(k for _f, k in R.masks)
    L.append("종류별: " + (", ".join("%s %d" % kv for kv in sorted(kinds.items())) or "없음"))
    L += ["", "| 파일 | 종류 | 건수 |", "|---|---|---:|"]
    for (f, k), n in sorted(Counter(R.masks).items()):
        L.append("| %s | %s | %d |" % (f, k, n))
    L += ["", "## 집 주소 빼기 (사용자 결정 11/27: 이름은 그대로, 집 주소만 뺌)", "",
          "시 · 군 · 구 · 읍 · 면 + 도로명(…로/…길 + 번호) 또는 지번(…동/리/가 + 번호) + 건물 · 동 · 호를 「%s」로 "
          "바꿨다. 교회 주소(청파로 · 서계동)와 행사 장소 주소(바로 앞 %d자 안에 교회 이름 · 홀 · 웨딩 · 회관 · "
          "캠핑장 같은 장소 말이 있고, 「이사」보다 가까움)는 그대로 뒀다. 판단이 안 서는 것은 지우고 아래에 "
          "「판단 불확실」로 적었다. 주소 글자는 이 보고에도 적지 않는다." % (ADDR_MARK, ADDR_WINDOW), ""]
    akinds = Counter(k for _f, k in R.addr)
    L.append("지운 주소: %d건 (%s) · 행사 장소라 둔 주소: %d건 (%d개 파일)"
             % (len(R.addr), ", ".join("%s %d" % kv for kv in sorted(akinds.items())) or "없음",
                len(R.addr_kept), len(set(R.addr_kept))))
    L += ["", "| 파일 | 옛 글 | 종류 | 건수 |", "|---|---|---|---:|"]
    for (f, k), n in sorted(Counter(R.addr).items()):
        L.append("| %s | %s | %s | %d |" % (f, legacy_of(W, f), k, n))
    L += ["", "행사 장소라 둔 주소가 있는 파일: " + (", ".join("`%s`" % f for f in sorted(set(R.addr_kept))) or "없음")]
    L += ["", "## 주보 PDF 보류 (스캔 이미지 · OCR로 찾음)", "",
          "주보 PDF는 글자가 아닌 스캔 그림이라 위 규칙이 닿지 않는다. tesseract(kor) OCR로 찾은 집 주소 · 개인 휴대전화"
          "(교인 · 교역자의 행사 문의 번호)가 있는 주보는 PDF를 저장소에 넣지 않고 `pdf:` 없이 적었다(사이트에는 「준비 중」). "
          "원본은 `<crawl>/weekly-pdf/`에 그대로 있다. 가린 사본을 만들면 넣을 수 있다. OCR은 놓칠 수 있다.", "",
          "보류 %d건: %s" % (len(R.pdf_held), ", ".join("%s %d" % kv for kv in sorted(Counter(k for _i, k in R.pdf_held).items())) or "없음"), ""]
    L += ["- `bulletins/%s` — %s" % (i, k) for i, k in R.pdf_held]
    L += ["", "## 주보 PDF 못 구함 · 기존 사본 사용 (이번 실행)", "",
          "캐시(`<crawl>/weekly-pdf/`)에 맞는 파일이 없던 주보. 이전 실행이 같은 옛 PDF(`legacy.seq`)로 연결해 둔 "
          "`public/bulletins/` 파일이 있으면 캐시로 되돌려 그대로 썼다 — 옛 사이트와 다시 대조하지는 못했다. "
          "그것도 없고 내려받지도 못한(또는 `--no-download`) 주보는 pdf 없이 적었다.", "",
          "기존 사본 사용 %d건 · pdf 없이 적은 것 %d건" % (len(R.pdf_restored), len(R.pdf_missing)), ""]
    L += ["- **경고** `bulletins/%s` — 기존 사본을 옛 사이트와 다시 대조하지 못함" % i for i in R.pdf_restored]
    L += ["- `bulletins/%s` — PDF 없음" % i for i in R.pdf_missing]
    L += ["", "## 남은 민감 정보 검사 (출력 전체 · 바꾸지 않음)", "",
          "주민등록번호 · 카드번호 모양은 찾으면 가린다(위 「개인정보 가림」에 건수). 그 밖의 것은 사용자 결정"
          "(11/27: 옛 사이트 그대로 옮기고, 개인정보 검토는 새 사이트에서 나중에)대로 건수와 파일만 적는다. "
          "차량번호 · 계좌는 모양만 보고 센 것이라 다른 숫자가 섞일 수 있다. 교회 공식 헌금 계좌는 "
          "content/site.yaml · pages에 아직 없어 따로 빼지 않았다.", ""]
    L += ["| 종류 | 건수 | 파일 |", "|---|---:|---|"]
    for kind, hits in sensitive_scan(W):
        files = sorted(set(hits))
        shown = ", ".join("`%s`" % f for f in files[:20]) + (" … 외 %d개" % (len(files) - 20) if len(files) > 20 else "")
        L.append("| %s | %d | %s |" % (kind, len(hits), shown or "-"))
    L += ["", "## 개인 이름이 들어 있는 글 (사용자 결정 11/27: 그대로 옮김)", "",
          "세례 · 임직 · 등록 명단, 「○○ 권사님」 같은 호칭, 쉼표로 이어진 이름 목록을 찾았다(성씨 + 두 글자, "
          "섬기는 분 명단의 교역자 이름은 뺐다). 출력 파일은 바꾸지 않았다. 아래 예시는 이름을 가렸다(김○○).", ""]
    L += ["| 게시판 | 글 수 |", "|---|---:|"]
    for b in ("media_1", "media_2", "media_3", "s_board_3", "s_board_1", "s_board_5", "s_board_6", "history"):
        L.append("| %s %s | %d |" % (b, BOARD_NAMES[b], len(R.names.get(b, []))))
    for b in ("media_1", "media_2", "media_3", "s_board_3", "s_board_1", "s_board_5", "s_board_6", "history"):
        hits = R.names.get(b, [])
        if not hits:
            continue
        L += ["", "### %s %s — %d건" % (b, BOARD_NAMES[b], len(hits)), ""]
        step = max(1, len(hits) // 5)
        for f, ex in hits[::step][:5]:
            L.append("- `%s`: …%s…" % (f, ex))
    L += ["", "## 사진 없음 (받기 실패 → 뺌)", "",
          "media/manifest.json에서 받기에 실패한 사진은 출력에서 뺐다. `sameFileAs`는 파일 이름 끝만 맞춰 고른 값이라 "
          "다른 사진을 가리킬 수 있어 쓰지 않았다.", ""]
    L += ["- %s %s seq %s: `%s`" % (b, BOARD_NAMES.get(b, b), sq, u) for b, sq, u in sorted(R.no_photo)] or ["- 없음"]
    L += ["", "## 바뀐 샘플 파일 (이 실행에서 지움)", ""]
    L += ["- `%s` (지움)" % r for r in R.replaced]
    L += ["- `%s` (같은 이름의 옛 글로 덮어씀)" % r for r in R.overwritten]
    if not R.replaced and not R.overwritten:
        L.append("- 없음 (빈 폴더에 썼거나 이미 변환된 폴더)")
    L += ["- `history.yaml` · `staff.yaml`: 임시 문구 · 담임목사 한 명만 있던 파일을 옛 사이트 자료로 통째로 바꿈", ""]
    L += ["## 메모", ""]
    for b in sorted(R.notes):
        notes = R.notes[b]
        shown = notes[:15]
        for n in shown:
            L.append("- %s: %s" % (b, n))
        if len(notes) > len(shown):
            L.append("- %s: … 외 %d건" % (b, len(notes) - len(shown)))
    L.append("")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(L))


# ------------------------------------------------------------------ main


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--crawl", required=True, help="crawl folder (boards/, media/manifest.json, binaries.json)")
    ap.add_argument("--out", required=True, help="content folder to write into")
    ap.add_argument("--public", help="public folder for bulletin PDFs (default: <out>/../public)")
    ap.add_argument("--report", help="report file (default: <crawl>/convert-report.md)")
    ap.add_argument("--replace", action="store_true",
                    help="delete .md files (not _templates) and bulletin PDFs in <out> that this run does not write")
    ap.add_argument("--no-download", action="store_true",
                    help="offline: use only cached bulletin PDFs (<crawl>/weekly-pdf/); a PDF missing there is not "
                         "fetched, and an existing public/bulletins/<id>.pdf for it is kept")
    ap.add_argument("--delay", type=float, default=0.5, help="seconds between PDF requests (polite)")
    args = ap.parse_args()
    args.crawl = os.path.abspath(args.crawl)
    args.out = os.path.abspath(args.out)
    args.public = os.path.abspath(args.public or os.path.join(os.path.dirname(args.out), "public"))
    report = os.path.abspath(args.report or os.path.join(args.crawl, "convert-report.md"))

    photos = Photos(os.path.join(args.crawl, "media", "manifest.json"))
    public_names = staff_names(args.crawl) | {"김항우"}
    W = Writer(args.out, args.public)
    conv_sermons(W, args.crawl, photos, public_names)
    conv_praise(W, args.crawl, photos, public_names)
    conv_videos(W, args.crawl, photos, public_names)
    conv_albums(W, args.crawl, photos, public_names)
    conv_events(W, args.crawl, photos, public_names)
    conv_news(W, args.crawl, photos, public_names)
    conv_bulletins(W, args.crawl, args)
    conv_history(W, args.crawl, public_names)
    conv_staff(W, args.crawl, photos)
    W.flush(args.replace)
    write_report(report, args, W)
    total = sum(c["written"] for c in R.counts.values())
    print("convert: %d items -> %s (%d files, %d PDFs); report %s"
          % (total, args.out, len(W.files), len(W.binaries), report))
    if R.pdf_missing or R.pdf_restored:
        print("warning: bulletin PDFs: %d not obtained (written without a PDF), %d taken from a previous run's "
              "public copy (not re-checked against the old site); see the report"
              % (len(R.pdf_missing), len(R.pdf_restored)), file=sys.stderr)


if __name__ == "__main__":
    main()
