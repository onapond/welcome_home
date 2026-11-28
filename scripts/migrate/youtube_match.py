#!/usr/bin/env python3
"""Old Vimeo posts -> the same video on the church YouTube channel (2nd migration m3, 2026-11-28).

The old site's Vimeo player no longer plays (「사용할 수 없습니다」, checked on the old site too).
User decision 2026-11-28: link the same video on the church YouTube channel; posts (sermons, praise,
special videos) whose video is not found, or whose YouTube video does not play, are deleted by
convert.py. 교회소식 keeps its text.

Input : <crawl>/boards/*.json
        <crawl>/youtube/channel-dates.tsv   id, upload date, availability, embeddable, title. Made with
          yt-dlp --flat-playlist on the channel's /videos and /streams (-> channel-list.tsv), then per id
          yt-dlp --skip-download --print "%(id)s<TAB>%(upload_date)s<TAB>%(availability)s<TAB>%(playable_in_embed)s<TAB>%(title)s"
        <crawl>/youtube/channel-durations.tsv  id, seconds, list (videos | streams), title. Made with
          yt-dlp --flat-playlist --print "%(id)s<TAB>%(duration)s<TAB><list><TAB>%(title)s" on /videos and /streams
Output: <crawl>/youtube/vimeo-match.tsv     board, seq, youtube id, score, how, post title, youtube title
        <crawl>/youtube/unplayable.tsv      YouTube ids linked by old posts that do not play (oEmbed 401/403/404)
        <crawl>/youtube/sermon-clip.tsv     board, seq, live id, sermon id, score, how, post title, sermon title

Sermon clips (user 2026-11-28 「주일 예배, 설교 영상을 가져와야 하는데, 예배 영상을 가져왔어」): many sermon posts
link the whole live service (/streams, 1-2 hours). The channel also has the sermon alone (/videos, 10-60 min,
「제목 │ 김항우 목사 │ 날짜」). A post whose video is a live service gets the sermon clip of the same day when the
titles agree (similarity >= 0.5; 0.7 when the clip title has no date and its upload day is used), or a clip whose title is the post title (>= 0.85, digits kept so (1) != (2))
uploaded within a few days. Posts without a clip keep the live service.

Rules: sermons (media_1) and praise (media_3) — the YouTube title date (or, without one, the upload date
1 day before to 10 days after) equals the post date or a date in the post title, and the titles agree
(similarity >= 0.6, dates / church / preacher words and digits removed). Special videos (s_board_3; post
dates are bulk upload days) — the same year (title year, else date year) and similarity >= 0.7 with digits
kept (62주년 != 64주년). MANUAL overrides were checked by eye. Run with `python3 -I`.
"""
import argparse
import datetime
import difflib
import json
import os
import re
import unicodedata
import urllib.error
import urllib.request

RX = [
    re.compile(r"(?<!\d)(20\d\d)(\d\d)(\d\d)(?!\d)"),
    re.compile(r"(20\d\d)\s*[-./ ]\s*(\d{1,2})\s*[-./ ]\s*(\d{1,2})(?!\d)"),
    re.compile(r"(?<!\d)(\d\d)[-.](\d{1,2})[-.](\d{1,2})(?!\d)"),
    re.compile(r"(?<!\d)(\d\d)(\d\d)(\d\d)(?!\d)"),
]
DATES = re.compile(r"(?<!\d)(20\d{6}|\d{6}|20\d\d\s*[-./ ]\s*\d{1,2}\s*[-./ ]\s*\d{1,2}|\d\d[-.]\d{1,2}[-.]\d{1,2})(?!\d)")
STOP = re.compile(r"청파중앙교회|주일예배|주일 예배|금요기도회|김항우|목사|LIVE|live|실시간|특송|l(?=\s)")

# Checked by eye (2026-11-28): (board, seq) -> YouTube id, or None to reject a rule match.
MANUAL = {
    ("media_3", "315"): "gkEyyFOqnRw",  # 20-04-12 봉헌 찬양 = 「200412 - 봉헌찬양 - 지극히 높으신 주」
    ("s_board_3", "109"): "jl3dx2qHaSQ",  # 2022 크리스마스 특별 영상 = 「'예수의 탄생'- 크리스마스 특별 영상」
    ("s_board_3", "62"): "jl3dx2qHaSQ",  # the same post, listed twice on the old board
}


def tdate(t):
    """The first date written in a title (20190414, 2019-04-14, 19-04-14, 190414), or None."""
    for rx in RX:
        for m in rx.finditer(t):
            y = int(m[1])
            y = y + 2000 if y < 100 else y
            try:
                return datetime.date(y, int(m[2]), int(m[3]))
            except ValueError:
                pass
    return None


def norm(t, keep_digits):
    # Some channel titles are stored as decomposed Hangul (NFD jamo); compare composed text (Codex 11/28 #3).
    t = unicodedata.normalize("NFC", t)
    t = STOP.sub(" ", DATES.sub(" ", t))
    t = re.sub(r"20\d\d년?", " ", t)
    if not keep_digits:
        t = re.sub(r"\d+", " ", t)
    return re.sub(r"[\W_]+", "", t).lower()


def sim(a, b):
    if not a or not b:
        return 0.0
    s, l = sorted((a, b), key=len)
    if len(s) >= 5 and s in l:
        return 1.0
    return difflib.SequenceMatcher(None, a, b).ratio()


def year_of(t, fallback):
    m = re.search(r"(?<!\d)(20\d\d)(?!\d)", t)
    return int(m[1]) if m else fallback


def best_match(board, it, yt):
    title = it.get("title") or ""
    d = datetime.date(*map(int, it["date"].split("-")))
    best = (0.0, None)
    if board in ("media_1", "media_3"):
        days = {d} | ({tdate(title)} - {None})
        tn = norm(title, False)
        for v in yt:
            ok = (v["td"] in days) if v["td"] else any(-1 <= (v["up"] - x).days <= 10 for x in days)
            if ok:
                s = sim(tn, norm(v["title"], False))
                if s > best[0]:
                    best = (s, v)
        return best, 0.6
    y = year_of(title, d.year)
    tn = norm(title, True)
    for v in yt:
        if year_of(v["title"], (v["td"] or v["up"]).year) != y:
            continue
        s = sim(tn, norm(v["title"], True))
        if s > best[0]:
            best = (s, v)
    return best, 0.7


def sermon_clip(it, live, clips):
    """The sermon-only clip for a post whose video is the live service `live` (a channel row), as
    (score, clip, how) or None. The live title's date counts too: a post written a week late (Codex 11/28 #4)."""
    title = it.get("title") or ""
    d = datetime.date(*map(int, it["date"].split("-")))
    days = {d} | ({tdate(title), live["td"]} - {None})
    tn = norm(title, True)
    best = None
    for c in clips:
        cd = c["td"] or c["up"]
        same_day = (c["td"] in days) if c["td"] else any(-1 <= (c["up"] - x).days <= 10 for x in days)
        near = any(-3 <= (cd - x).days <= 10 for x in days)
        s = sim(tn, norm(c["title"], True))
        # A clip dated only by its upload day needs closer titles: a Friday post must not get Sunday's clip.
        if (same_day and s >= (0.5 if c["td"] else 0.7)) or (near and s >= 0.85):
            how = "same day" if same_day else "same title"
            if best is None or s > best[0]:
                best = (s, c, how)
    return best


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--crawl", required=True)
    ap.add_argument("--no-check", action="store_true", help="skip the oEmbed check (unplayable.tsv)")
    args = ap.parse_args()
    crawl = os.path.abspath(args.crawl)
    yt = []
    for line in open(os.path.join(crawl, "youtube/channel-dates.tsv"), encoding="utf-8"):
        vid, up, _avail, _emb, title = line.rstrip("\n").split("\t", 4)
        yt.append({"id": vid, "up": datetime.date(int(up[:4]), int(up[4:6]), int(up[6:])), "title": title,
                   "td": tdate(title)})
    by_id = {v["id"]: v for v in yt}
    rows, linked = [], set()
    for board in ("media_1", "media_2", "media_3", "s_board_3"):
        for it in json.load(open(os.path.join(crawl, "boards", board + ".json"), encoding="utf-8"))["items"]:
            vs = it.get("videos") or []
            linked.update(x["id"] for x in vs if x.get("host") == "youtube" and x.get("id"))
            if board == "media_2" or not it.get("ok"):
                continue
            if not any(x.get("host") == "vimeo" for x in vs) or any(x.get("host") == "youtube" for x in vs):
                continue
            (s, v), thr = best_match(board, it, yt)
            key = (board, str(it["seq"]))
            if key in MANUAL:
                if MANUAL[key]:
                    rows.append([board, key[1], MANUAL[key], "%.2f" % s, "manual", it.get("title"), by_id[MANUAL[key]]["title"]])
            elif v and s >= thr:
                rows.append([board, key[1], v["id"], "%.2f" % s, "rule", it.get("title"), v["title"]])

    def cell(x):
        return re.sub(r"[\t\n]+", " ", str(x or ""))

    with open(os.path.join(crawl, "youtube/vimeo-match.tsv"), "w", encoding="utf-8") as f:
        f.write("board\tseq\tyoutube\tscore\thow\tpost title\tyoutube title\n")
        for r in rows:
            f.write("\t".join(cell(x) for x in r) + "\n")
    print("vimeo-match: %d posts matched" % len(rows))

    # Sermon posts linked to a live service -> the sermon clip.
    dur = {}
    for line in open(os.path.join(crawl, "youtube/channel-durations.tsv"), encoding="utf-8"):
        vid, sec, lst, _title = line.rstrip("\n").split("\t", 3)
        dur[vid] = (None if sec == "NA" else float(sec), lst)
    clips = [v for v in yt if dur.get(v["id"], (None, ""))[1] == "videos" and 600 <= (dur[v["id"]][0] or 0) < 3600]
    matched = {(r[0], r[1]): r[2] for r in rows}
    clip_rows = []
    for board in ("media_1", "media_2"):
        for it in json.load(open(os.path.join(crawl, "boards", board + ".json"), encoding="utf-8"))["items"]:
            if not it.get("ok"):
                continue
            ids = [x["id"] for x in it.get("videos") or [] if x.get("host") == "youtube" and x.get("id")]
            live = ids[0] if ids else matched.get((board, str(it["seq"])))
            if not live or dur.get(live, (None, ""))[1] != "streams":
                continue
            got = sermon_clip(it, by_id[live], clips)
            if got:
                s, c, how = got
                clip_rows.append([board, str(it["seq"]), live, c["id"], "%.2f" % s, how, it.get("title"), c["title"]])
    with open(os.path.join(crawl, "youtube/sermon-clip.tsv"), "w", encoding="utf-8") as f:
        f.write("board\tseq\tlive\tsermon\tscore\thow\tpost title\tsermon title\n")
        for r in clip_rows:
            f.write("\t".join(cell(x) for x in r) + "\n")
    print("sermon-clip: %d live-service posts get the sermon clip" % len(clip_rows))
    if args.no_check:
        return
    outside = sorted(i for i in linked - set(by_id) if re.fullmatch(r"[A-Za-z0-9_-]{11}", i))
    bad = []
    for vid in outside:
        url = "https://www.youtube.com/oembed?format=json&url=https://youtu.be/" + vid
        try:
            urllib.request.urlopen(url, timeout=20).read()
        except urllib.error.HTTPError as e:
            if e.code in (401, 403, 404):
                bad.append((vid, e.code))
    with open(os.path.join(crawl, "youtube/unplayable.tsv"), "w", encoding="utf-8") as f:
        f.write("youtube\toembed status\n")
        for vid, code in bad:
            f.write("%s\t%d\n" % (vid, code))
    print("unplayable: %d of %d linked ids outside the public channel list" % (len(bad), len(outside)))


if __name__ == "__main__":
    main()
