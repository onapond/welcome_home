#!/usr/bin/env python3
"""Download + resize the old site's photos (migration m3). Everything stays OUTSIDE the repo.

Input : <out>/boards/*.json, <out>/binaries.json   (written by crawl.py)
Output: <out>/media/original/<key stem>.<ext>       originals as downloaded (untrusted data)
        <out>/media/out/<key>                        main webp (long edge <= 1600 px)
        <out>/media/out/<key stem>-480.webp          thumbnail (long edge <= 480 px)
        <out>/media/manifest.json                    original URL -> key, sizes, sha256, references, status
        <out>/media/state/                           resumable state (downloads, resize results, jobs)

Scope: photos referenced by the migrated boards (BOARDS below). s_board_2 (새가족소개) and
s_board_4 (중보기도) are not migrated (user decision 2026-11-27): a URL used only there is skipped.
PDFs (weekly) are not handled here.

Key: <collection>/<board_key>-<seq>/<nnn>.webp, nnn = 1-based position of the photo in its item
(images in page order, then photo attachments). A URL used by several items gets ONE key, from the
first item in BOARDS order / file order; every reference is recorded in the manifest.

Resume is bound to identity, not to "a file of the right size is there": a download record holds
the URL, key, file and sha256; it is reused only when the current plan maps the URL to that same
file and the file still hashes the same. A resize result holds the sha256 of the original it was
made from; it is reused only when that equals the current download's sha256.

Stages (default: all): plan download resize manifest verify   (+ prune, report)
Exit codes: 0 ok; 1 verify found problems (report written first); 2 refused (output inside the repo,
stale manifest for prune). Download/resize failures are recorded in the manifest, not exit codes.
Run with `python3 -I photos.py` (downloaded files are untrusted; -I keeps cwd/script dir off sys.path,
crawl.py is loaded by explicit path).
"""
import argparse
import functools
import hashlib
import importlib.util
import json
import os
import random
import re
import subprocess
import sys
import threading
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import parse_qs, unquote, urlsplit

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("migrate_crawl", os.path.join(HERE, "crawl.py"))
crawl = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(crawl)
log = crawl.log

# board_key -> collection (docs/migration-plan.md). Order matters for "first item wins".
BOARDS = [
    ("media_1", "sermons"),
    ("media_2", "sermons"),
    ("media_3", "praise"),
    ("s_board_3", "videos"),
    ("s_board_1", "albums"),
    ("s_board_5", "events"),
    ("s_board_6", "news"),
    ("history", "history"),
    ("staff", "staff"),
]
EXCLUDED = ["s_board_2", "s_board_4"]
KEY_OK = re.compile(r"^[a-z0-9_\-/.]+$")
MAGIC = [(b"\xff\xd8\xff", "jpeg"), (b"\x89PNG\r\n\x1a\n", "png"), (b"GIF87a", "gif"), (b"GIF89a", "gif"), (b"BM", "bmp")]


def sniff(b):
    for sig, name in MAGIC:
        if b.startswith(sig):
            return name
    if b[:4] == b"RIFF" and b[8:12] == b"WEBP":
        return "webp"
    return None


def refuse(msg, code=2):
    print("오류: " + msg, file=sys.stderr, flush=True)
    sys.exit(code)


# ------------------------------------------------------------------ never write inside the repo


@functools.lru_cache(maxsize=1)
def repo_roots():
    """Real paths of the git checkout(s) holding this script: the worktree and, for a worktree, the main checkout."""
    roots = set()
    for args in (["rev-parse", "--show-toplevel"], ["rev-parse", "--path-format=absolute", "--git-common-dir"]):
        try:
            res = subprocess.run(["git", "-C", HERE] + args, capture_output=True, text=True, check=True).stdout.strip()
        except Exception:
            continue
        if res:
            roots.add(os.path.realpath(os.path.dirname(res) if "--git-common-dir" in args else res))
    if not roots:  # no git: fall back to the nearest parent holding .git
        d = HERE
        while True:
            if os.path.exists(os.path.join(d, ".git")):
                roots.add(os.path.realpath(d))
                break
            nd = os.path.dirname(d)
            if nd == d:
                break
            d = nd
    return tuple(sorted(roots))


def guard(path):
    """Refuse (exit 2) if `path` resolves (symlinks followed) into the repo."""
    rp = os.path.realpath(path)
    for root in repo_roots():
        if rp == root or rp.startswith(root + os.sep):
            refuse("쓰기 대상이 저장소 안입니다: %s (실제 경로 %s, 저장소 %s). 원본 사진(GPS 포함)과 옛 주소 목록이 "
                   "저장소나 public/ 에 들어가면 안 되므로 멈춥니다. 저장소 밖 폴더를 --out 으로 주세요." % (path, rp, root))
    return path


def jload(fn, default):
    if os.path.exists(fn):
        with open(fn, encoding="utf-8") as f:
            return json.load(f)
    return default


def jsave(fn, obj, indent=None):
    guard(fn)
    os.makedirs(os.path.dirname(fn), exist_ok=True)
    tmp = fn + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=indent)
    os.replace(tmp, fn)


def sha256_file(fn):
    h = hashlib.sha256()
    with open(fn, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def unlink(fn):
    if os.path.lexists(fn):
        guard(fn)
        os.remove(fn)
        return True
    return False


# ------------------------------------------------------------------ URLs


def is_asp_link(path_lower):
    return "view_img.asp" in path_lower or "download.asp" in path_lower


def src_name(u):
    """File name of the photo a URL points at: the `filename=` of view_img.asp / download.asp, else the path's last part."""
    sp = urlsplit(u)
    if is_asp_link(sp.path.lower()):
        fn = parse_qs(sp.query).get("filename", [""])[0]
        return unquote(fn.split("?")[0])
    return unquote(sp.path).rsplit("/", 1)[-1]


def is_photo(u):
    if "view_img.asp" in unquote(urlsplit(u).path).lower():
        return True
    return src_name(u).lower().endswith(crawl.BIN_PHOTO)


def photo_urls(item):
    urls = []
    for p in item.get("images") or []:
        if crawl.is_binary_path(p) and is_photo(p) and p not in urls:
            urls.append(p)
    for a in item.get("attachments") or []:
        u = a["url"] if isinstance(a, dict) else a
        if is_photo(u) and u not in urls:  # download.asp?filename=x.jpg counts; the bytes are sniffed after download
            urls.append(u)
    return urls


def url_ext(u):
    name = src_name(u)
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    ext = {"jpeg": "jpg"}.get(ext, ext)
    return ext if re.fullmatch(r"[a-z0-9]{2,5}", ext) else "bin"


class Paths:
    def __init__(self, out):
        self.out = os.path.abspath(os.path.expanduser(out))  # absolute once, at entry; everything derives from it
        self.media = os.path.join(self.out, "media")
        self.original = os.path.join(self.media, "original")
        self.outdir = os.path.join(self.media, "out")
        self.state = os.path.join(self.media, "state")
        self.plan = os.path.join(self.state, "plan.json")
        self.downloads = os.path.join(self.state, "downloads.json")
        self.resized = os.path.join(self.state, "resized.json")
        self.manifest = os.path.join(self.media, "manifest.json")
        for p in (self.out, self.media, self.original, self.outdir, self.state, self.manifest, os.path.join(self.out, "cache")):
            guard(p)

    def orig_file(self, rec):
        return os.path.join(self.original, rec["key"][: -len(".webp")] + "." + rec["ext"])

    def main_file(self, rec):
        return os.path.join(self.outdir, rec["key"])

    def thumb_file(self, rec):
        return os.path.join(self.outdir, rec["thumbKey"])


# ------------------------------------------------------------------ plan


def run_plan(P):
    bins = jload(os.path.join(P.out, "binaries.json"), {})
    plan = {}  # url -> record (insertion order = key order)
    excluded_refs = {}
    for bk in EXCLUDED:
        fn = os.path.join(P.out, "boards", bk + ".json")
        for it in jload(fn, {"items": []})["items"]:
            for u in photo_urls(it):
                excluded_refs.setdefault(u, []).append({"board_key": bk, "seq": it.get("seq")})
    for bk, coll in BOARDS:
        board = jload(os.path.join(P.out, "boards", bk + ".json"), None)
        if board is None:
            sys.exit("missing boards/%s.json - run crawl.py first" % bk)
        for it in board["items"]:
            seq = str(it.get("seq"))
            if not re.fullmatch(r"[0-9a-z_\-]+", seq.lower()):
                sys.exit("unexpected seq %r in %s" % (seq, bk))
            for n, u in enumerate(photo_urls(it), 1):
                ref = {"board_key": bk, "seq": it.get("seq"), "position": n}
                if u in plan:
                    plan[u]["references"].append(ref)
                    continue
                key = "%s/%s-%s/%03d.webp" % (coll, bk, seq.lower(), n)
                thumb = key[: -len(".webp")] + "-480.webp"
                for k in (key, thumb):
                    if not KEY_OK.match(k):
                        sys.exit("bad key %r for %s" % (k, u))
                b = bins.get(u, {})
                plan[u] = {"key": key, "thumbKey": thumb, "ext": url_ext(u), "expected_bytes": b.get("size"),
                           "head_status": b.get("status"), "references": [ref]}
                if u in excluded_refs:
                    plan[u]["excluded_board_refs"] = excluded_refs[u]
    keys = [r["key"] for r in plan.values()]
    assert len(keys) == len(set(keys)), "duplicate keys"
    only_excluded = sorted(set(excluded_refs) - set(plan))
    jsave(P.plan, {"generated_at": crawl.now(), "boards": [b for b, _ in BOARDS], "excluded_boards": EXCLUDED,
                   "skipped_only_in_excluded": len(only_excluded), "photos": plan}, indent=1)
    exp = sum(r["expected_bytes"] or 0 for r in plan.values())
    log("plan: %d unique photo urls (%.1f MB by HEAD), %d skipped (only in excluded boards)" % (len(plan), exp / 1e6, len(only_excluded)))
    return plan


def load_plan(P):
    if not os.path.exists(P.plan):
        return run_plan(P)
    return jload(P.plan, {})["photos"]


# ------------------------------------------------------------------ download


def download_valid(P, u, rec, d, claims):
    """True if the download record `d` of URL `u` still proves that the original file of `rec` is u's bytes.
    Records from before sha256 was stored are accepted once (genuine download records carry `format`)
    and get their sha256 filled in."""
    fn = P.orig_file(rec)
    rel = os.path.relpath(fn, P.media)
    if d.get("status") != "ok" or d.get("file") != rel or claims.get(rel) != [u]:
        return False
    if not os.path.isfile(fn) or os.path.getsize(fn) != d.get("bytes"):
        return False
    if not d.get("sha256") and not d.get("format"):
        return False  # written by the old "right size on disk" shortcut, never proven
    h = sha256_file(fn)
    if d.get("sha256") and d["sha256"] != h:
        return False
    d["sha256"] = h
    d["key"] = rec["key"]
    return True


def run_download(P, args):
    plan = load_plan(P)
    state = jload(P.downloads, {})
    claims = {}  # original file -> URLs whose ok record points at it
    for v, d in state.items():
        if d.get("status") == "ok" and d.get("file"):
            claims.setdefault(d["file"], []).append(v)
    todo, invalidated = [], 0
    for u, rec in plan.items():
        if download_valid(P, u, rec, state.get(u) or {}, claims):
            continue
        todo.append(u)
        # the file / outputs at this key are not proven to be u's: drop them before fetching u
        rel = os.path.relpath(P.orig_file(rec), P.media)
        for v in claims.get(rel, []):
            if v != u:
                state[v] = dict(state[v], status="superseded", superseded_by=u, superseded_at=crawl.now())
        removed = [unlink(f) for f in (P.orig_file(rec), P.main_file(rec), P.thumb_file(rec))]
        if any(removed):
            invalidated += 1
        if (state.get(u) or {}).get("status") == "ok":
            state[u] = dict(state[u], status="stale")
    jsave(P.downloads, state)
    log("download: %d planned, %d verified on disk (url+key+sha256), %d to fetch (%d stale files/outputs removed)"
        % (len(plan), len(plan) - len(todo), len(todo), invalidated))
    lock = threading.Lock()
    tl = threading.local()
    counter = {"n": 0, "bytes": 0}

    def fetcher():
        if not hasattr(tl, "f"):
            tl.f = crawl.Fetcher(P.out, delay=args.delay)
            tl.f.init_session()
        return tl.f

    def one(u):
        rec = plan[u]
        fn = P.orig_file(rec)
        res = {"at": crawl.now(), "key": rec["key"]}
        try:
            st, hl, data = fetcher().raw("GET", u)
            h = {k.lower(): v for k, v in hl}
            kind = sniff(data[:16])
            if st != 200:
                res.update(status="failed", error="HTTP %s (%s)" % (st, h.get("content-type", "")))
            elif not kind:
                res.update(status="failed", error="not an image (content-type %s, %d bytes)" % (h.get("content-type", ""), len(data)))
            else:
                guard(fn)
                os.makedirs(os.path.dirname(fn), exist_ok=True)
                with open(fn + ".part", "wb") as f:
                    f.write(data)
                os.replace(fn + ".part", fn)
                res.update(status="ok", bytes=len(data), format=kind, sha256=hashlib.sha256(data).hexdigest(),
                           file=os.path.relpath(fn, P.media))
                if rec.get("expected_bytes") and rec["expected_bytes"] != len(data):
                    res["note"] = "size differs from HEAD (%s)" % rec["expected_bytes"]
        except SystemExit:
            raise
        except Exception as e:
            res.update(status="failed", error=str(e)[:300])
        with lock:
            state[u] = res
            counter["n"] += 1
            counter["bytes"] += res.get("bytes", 0)
            if counter["n"] % 100 == 0:
                jsave(P.downloads, state)
                log("download %d/%d (%.1f MB this run)" % (counter["n"], len(todo), counter["bytes"] / 1e6))

    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        list(ex.map(one, todo))
    jsave(P.downloads, state)
    bad = [u for u in plan if (state.get(u) or {}).get("status") != "ok"]
    log("download done: %d ok, %d failed, %d fetched this run (%.1f MB)" % (len(plan) - len(bad), len(bad), len(todo), counter["bytes"] / 1e6))
    return {"fetched": len(todo), "bytes": counter["bytes"], "failed": len(bad)}


# ------------------------------------------------------------------ resize


def node_env():
    """Find a node_modules with sharp: this checkout, else the main checkout of a git worktree."""
    env = dict(os.environ)
    d = HERE
    while True:
        if os.path.isdir(os.path.join(d, "node_modules", "sharp")):
            env["SHARP_BASE"] = d
            return env
        nd = os.path.dirname(d)
        if nd == d:
            break
        d = nd
    try:
        common = subprocess.run(["git", "-C", HERE, "rev-parse", "--path-format=absolute", "--git-common-dir"],
                                capture_output=True, text=True, check=True).stdout.strip()
        main = os.path.dirname(common)
        if os.path.isdir(os.path.join(main, "node_modules", "sharp")):
            env["SHARP_BASE"] = main
    except Exception:
        pass
    return env


def run_node(mode, payload, P, name):
    jin = os.path.join(P.state, name + "-in.json")
    jout = os.path.join(P.state, name + "-out.json")
    jsave(jin, payload)
    if os.path.exists(jout):
        os.remove(jout)
    subprocess.run(["node", os.path.join(HERE, "resize.mjs"), mode, jin, jout], check=True, env=node_env(), cwd=P.state)
    return jload(jout, {})


def resize_valid(P, rec, d, r):
    """A resize result counts only if it was made from the current original (same sha256) for the same key."""
    return (bool(r.get("ok")) and bool(d.get("sha256")) and r.get("srcSha256") == d.get("sha256") and r.get("key") == rec["key"]
            and os.path.isfile(P.main_file(rec)) and os.path.isfile(P.thumb_file(rec)))


def run_resize(P, args):
    plan = load_plan(P)
    dl = jload(P.downloads, {})
    done = jload(P.resized, {})
    jobs = []
    for u, rec in plan.items():
        d = dl.get(u) or {}
        if d.get("status") != "ok":
            continue
        if resize_valid(P, rec, d, done.get(u) or {}) and not args.force_resize:
            continue
        job = {"id": u, "in": P.orig_file(rec), "main": P.main_file(rec), "thumb": P.thumb_file(rec)}
        for f in (job["main"], job["thumb"]):
            guard(os.path.dirname(f))
            guard(f)
        jobs.append(job)
    log("resize: %d jobs" % len(jobs))
    step = 500
    for i in range(0, len(jobs), step):
        res = run_node("resize", jobs[i:i + step], P, "resize")
        for u, r in res.items():
            rec, d = plan[u], dl.get(u) or {}
            r["key"] = rec["key"]
            if r.get("ok") and r.get("srcSha256") != d.get("sha256"):
                r = {"ok": False, "key": rec["key"], "error": "original changed (sha256 %s != download %s)" % (r.get("srcSha256"), d.get("sha256"))}
                for f in (P.main_file(rec), P.thumb_file(rec)):
                    unlink(f)
            done[u] = r
        jsave(P.resized, done)
        log("resize %d/%d" % (min(i + step, len(jobs)), len(jobs)))
    ok = sum(1 for u, rec in plan.items() if resize_valid(P, rec, dl.get(u) or {}, done.get(u) or {}))
    log("resize done: %d ok, %d of %d downloaded not ok" % (ok, sum(1 for u in plan if (dl.get(u) or {}).get("status") == "ok") - ok, len(plan)))
    return len(jobs)


# ------------------------------------------------------------------ manifest + report


def build_manifest(P):
    plan = load_plan(P)
    dl = jload(P.downloads, {})
    rz = jload(P.resized, {})
    items, failures = {}, []
    for u, rec in plan.items():
        d = dl.get(u) or {}
        r = rz.get(u) or {}
        m = {"key": rec["key"], "thumbKey": rec["thumbKey"], "references": rec["references"]}
        if rec.get("excluded_board_refs"):
            m["excludedBoardRefs"] = rec["excluded_board_refs"]
        if d.get("status") != "ok":
            m["status"] = "download_failed"
            failures.append({"url": u, "key": rec["key"], "stage": "download", "error": d.get("error", "not attempted")})
        else:
            m.update(originalBytes=d.get("bytes"), originalFormat=d.get("format"), sha256=d.get("sha256"))
            if not resize_valid(P, rec, d, r):
                m["status"] = "resize_failed"
                err = r.get("error") or ("not resized from the current original" if r.get("ok") else "not resized")
                failures.append({"url": u, "key": rec["key"], "stage": "resize", "error": err})
            else:
                m.update(status="ok", width=r["width"], height=r["height"], bytes=r["bytes"],
                         thumbWidth=r["thumbWidth"], thumbHeight=r["thumbHeight"], thumbBytes=r["thumbBytes"])
        items[u] = m

    # identical bytes: point later ok entries at the first ok entry with the same sha256
    first_by_hash = {}
    for u, m in items.items():
        if m["status"] == "ok":
            if m["sha256"] in first_by_hash:
                m["sameContentAs"] = items[first_by_hash[m["sha256"]]]["key"]
            else:
                first_by_hash[m["sha256"]] = u

    # sameFileAs: a failed download (e.g. view_img.asp?filename=X) is the same photo as another URL of the
    # SAME item whose file name is exactly X - only if every such candidate is ok and all have one sha256.
    # Candidates: every /file/... path with that name (a failed one is a separate file we cannot compare ->
    # unresolved), plus view_img/download.asp aliases of that name only when they downloaded (a failed alias
    # names the file by `filename=` only, like the failed URL itself, so it is not another file).
    by_item_name = {}
    for u, rec in plan.items():
        for ref in rec["references"]:
            lst = by_item_name.setdefault((src_name(u), ref["board_key"], str(ref["seq"])), [])
            if u not in lst:
                lst.append(u)
    for f in failures:
        if f["stage"] != "download":
            continue
        u, nm = f["url"], src_name(f["url"])
        if not nm:
            continue
        cands = []
        for ref in plan[u]["references"]:
            cands += [v for v in by_item_name.get((nm, ref["board_key"], str(ref["seq"])), []) if v != u and v not in cands
                      and (items[v]["status"] != "download_failed" or not is_asp_link(urlsplit(v).path.lower()))]
        if not cands:
            continue
        hashes = {items[v].get("sha256") for v in cands}
        if all(items[v]["status"] == "ok" for v in cands) and len(hashes) == 1:
            target = first_by_hash[hashes.pop()]
            items[u]["sameFileAs"] = f["sameFileAs"] = items[target]["key"]
        else:
            f["sameFileCandidates"] = [{"key": items[v]["key"], "status": items[v]["status"], "sha256": items[v].get("sha256")} for v in cands]
            f["unresolved"] = "several different or not-ok candidates; check by hand"

    ok = [m for m in items.values() if m["status"] == "ok"]
    totals = {
        "photos": len(items),
        "ok": len(ok),
        "failed": len(failures),
        "failedSameFileAs": sum(1 for f in failures if f.get("sameFileAs")),
        "failedUnresolved": sum(1 for f in failures if not f.get("sameFileAs")),
        "okSameContentAs": sum(1 for m in ok if m.get("sameContentAs")),
        "originalBytes": sum(m.get("originalBytes") or 0 for m in items.values()),
        "mainBytes": sum(m["bytes"] for m in ok),
        "thumbBytes": sum(m["thumbBytes"] for m in ok),
    }
    return {"generator": "scripts/migrate/photos.py",
            "keyScheme": "<collection>/<board_key>-<seq>/<nnn>.webp (+ -480 thumb)",
            "boards": [b for b, _ in BOARDS], "excludedBoards": EXCLUDED,
            "totals": totals, "photos": items, "failures": failures}


def run_manifest(P):
    man = build_manifest(P)
    jsave(P.manifest, dict({"generated_at": crawl.now()}, **man), indent=1)
    log("manifest: %s" % json.dumps(man["totals"]))
    return man["photos"], man["failures"], man["totals"]


MANIFEST_FIELDS = ("key", "thumbKey", "status", "sha256", "width", "height", "bytes", "thumbBytes", "sameFileAs")


def manifest_drift(P, man):
    """Entries where the saved manifest disagrees with what plan + state say now."""
    want = build_manifest(P)["photos"]
    have = man.get("photos", {})
    diff = sorted(set(want) ^ set(have))
    diff += [u for u in want if u in have and any(want[u].get(k) != have[u].get(k) for k in MANIFEST_FIELDS)]
    return diff


def walk_out(P):
    """Every file / symlink under media/out, as key-style relative paths."""
    found = []
    for root, dirs, files in os.walk(P.outdir):
        for n in files + [d for d in dirs if os.path.islink(os.path.join(root, d))]:
            found.append(os.path.relpath(os.path.join(root, n), P.outdir).replace(os.sep, "/"))
    return found


def extra_outputs(P, man):
    keep = set()
    for m in man.get("photos", {}).values():
        if m["status"] == "ok":
            keep.update((m["key"], m["thumbKey"]))
    return sorted(set(walk_out(P)) - keep)


def check_one(r, m):
    """problems for one photo: metadata left in outputs, wrong long edge, lost orientation, manifest mismatch."""
    if r.get("error"):
        return [r["error"]]
    dw, dh = r["displayed"]["width"], r["displayed"]["height"]
    errs = []
    if r.get("originalSha256") != m.get("sha256"):
        errs.append("original sha256 %s != manifest %s" % (r.get("originalSha256"), m.get("sha256")))
    for which, lim in (("main", 1600), ("thumb", 480)):
        o = r[which]
        if o["format"] != "webp":
            errs.append("%s not webp" % which)
        if o["exif"] or o["xmp"] or o["iptc"] or o["icc"] or o["gps"]:
            errs.append("%s has metadata %s" % (which, {k: o[k] for k in ("exif", "xmp", "iptc", "icc", "gps") if o[k]}))
        long_exp = min(max(dw, dh), lim)
        if abs(max(o["width"], o["height"]) - long_exp) > 1:
            errs.append("%s long edge %d != %d" % (which, max(o["width"], o["height"]), long_exp))
        if dw != dh and (o["width"] > o["height"]) != (dw > dh):
            errs.append("%s orientation differs" % which)
    if (r["main"]["width"], r["main"]["height"]) != (m["width"], m["height"]):
        errs.append("manifest size mismatch")
    return errs


def run_verify(P, args):
    """Checks EVERY ok output (sharp metadata + original sha256), the manifest against current state, and that
    media/out holds nothing but the manifest's ok keys. Prints a random sample in detail. Returns problem count."""
    plan = load_plan(P)
    man = jload(P.manifest, None)
    if man is None:
        run_manifest(P)
        man = jload(P.manifest, {})
    drift = manifest_drift(P, man)
    extras = extra_outputs(P, man)
    ok = [u for u, m in man["photos"].items() if m["status"] == "ok" and u in plan]
    lst = [{"id": u, "original": P.orig_file(plan[u]), "main": P.main_file(plan[u]), "thumb": P.thumb_file(plan[u])} for u in ok]
    res = run_node("verify", lst, P, "verify")
    bad = {}
    for u in ok:
        e = check_one(res.get(u, {"error": "no result"}), man["photos"][u])
        if e:
            bad[u] = e
    orig = [res[u]["original"] for u in ok if "original" in res.get(u, {})]
    rotated = [u for u in ok if (res.get(u, {}).get("original") or {}).get("orientation") not in (None, 1)]
    rnd = random.Random(args.seed)
    sample = rnd.sample(ok, min(args.verify_n, len(ok)))
    if rotated:  # make sure the sample shows the EXIF-rotation case too
        sample += [u for u in rnd.sample(rotated, min(2, len(rotated))) if u not in sample]
    print("verify (seed %s): sample of %d" % (args.seed, len(sample)))
    for u in sample:
        r, m = res.get(u, {}), man["photos"][u]
        if r.get("error"):
            print("  ERROR", m["key"], r["error"])
            continue
        print("  %-4s %s  orig %dx%d (exif %dB, gps %s, orient %s) -> main %dx%d exif=%d icc=%d xmp=%d, thumb %dx%d exif=%d %s" % (
            "FAIL" if u in bad else "OK", m["key"], r["displayed"]["width"], r["displayed"]["height"], r["original"]["exif"],
            r["original"]["gps"], r["original"]["orientation"], r["main"]["width"], r["main"]["height"], r["main"]["exif"],
            r["main"]["icc"], r["main"]["xmp"], r["thumb"]["width"], r["thumb"]["height"], r["thumb"]["exif"], "; ".join(bad.get(u, []))))
    summary = {"checked": len(ok), "problems": len(bad) + len(extras) + len(drift),
               "badOutputs": len(bad), "extraOutputs": len(extras), "manifestDrift": len(drift),
               "originalsWithExif": sum(1 for o in orig if o["exif"]),
               "originalsWithGps": sum(1 for o in orig if o["gps"]), "originalsRotated": len(rotated),
               "outputsWithMetadata": sum(1 for e in bad.values() if any("metadata" in x for x in e)),
               "failedSameFileAs": sum(1 for f in man.get("failures", []) if f.get("sameFileAs")),
               "failedUnresolved": sum(1 for f in man.get("failures", []) if not f.get("sameFileAs"))}
    print("verify all outputs: %s" % json.dumps(summary))
    for u, e in list(bad.items())[:20]:
        print("  PROBLEM", man["photos"][u]["key"], "; ".join(e))
    for x in extras[:20]:
        print("  PROBLEM extra file in media/out (not an ok key of the manifest; run `prune`):", x)
    if drift:
        print("  PROBLEM manifest out of date for %d photos (run `manifest`), e.g. %s" % (len(drift), drift[:3]))
    jsave(os.path.join(P.state, "verify-summary.json"), {"at": crawl.now(), "seed": args.seed, "summary": summary,
                                                        "problems": {u: e for u, e in bad.items()},
                                                        "extraOutputs": extras, "manifestDrift": drift}, indent=1)
    return summary["problems"]


def run_prune(P):
    """Delete files under media/out that are not an ok key/thumbKey of the (current) manifest."""
    man = jload(P.manifest, None)
    if man is None:
        refuse("manifest.json 이 없습니다. manifest 단계를 먼저 실행하세요.")
    drift = manifest_drift(P, man)
    if drift:
        refuse("manifest.json 이 현재 상태와 %d건 다릅니다. manifest 단계를 먼저 실행하세요 (지울 목록을 옛 manifest로 정하지 않음)." % len(drift))
    extras = extra_outputs(P, man)
    for x in extras:
        unlink(os.path.join(P.outdir, x))
    for root, dirs, files in os.walk(P.outdir, topdown=False):
        if root != P.outdir and not os.listdir(root):
            os.rmdir(root)
    log("prune: removed %d files from media/out" % len(extras))
    return len(extras)


def report(P):
    man = jload(P.manifest, {})
    t = man.get("totals", {})
    dl = jload(P.downloads, {})
    plan = load_plan(P)
    okd = [dl[u] for u in plan if (dl.get(u) or {}).get("status") == "ok"]
    print("originals: %d files, %.1f MB" % (len(okd), sum(d.get("bytes", 0) for d in okd) / 1e6))
    print("outputs: %d main (%.1f MB) + %d thumbs (%.1f MB)" % (t.get("ok", 0), t.get("mainBytes", 0) / 1e6, t.get("ok", 0), t.get("thumbBytes", 0) / 1e6))
    print("failures: %d (%d with sameFileAs, %d unresolved)" % (len(man.get("failures", [])), t.get("failedSameFileAs", 0), t.get("failedUnresolved", 0)))
    for f in man.get("failures", []):
        print("  %s %s %s: %s%s" % (f["stage"], f["key"], f["url"][:90], f["error"],
                                   " -> sameFileAs " + f["sameFileAs"] if f.get("sameFileAs") else " (unresolved)"))
    ok = sorted((m for m in man.get("photos", {}).values() if m["status"] == "ok"), key=lambda m: -m["bytes"])
    print("largest main outputs:")
    for m in ok[:5]:
        print("  %s %.0f KB %dx%d" % (m["key"], m["bytes"] / 1024, m["width"], m["height"]))


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("stages", nargs="*", default=["plan", "download", "resize", "manifest", "verify"])
    ap.add_argument("--out", default=crawl.DEFAULT_OUT)
    ap.add_argument("--workers", type=int, default=4, help="parallel downloads (max 4)")
    ap.add_argument("--delay", type=float, default=0.3, help="seconds between requests per connection")
    ap.add_argument("--force-resize", action="store_true")
    ap.add_argument("--verify-n", type=int, default=10)
    ap.add_argument("--seed", type=int, default=None)
    args = ap.parse_args(argv)
    args.workers = max(1, min(args.workers, 4))
    if args.seed is None:
        args.seed = random.randrange(1 << 30)
    for st in args.stages:
        if st not in ("plan", "download", "resize", "manifest", "verify", "prune", "report"):
            sys.exit("unknown stage " + st)
    P = Paths(args.out)  # absolute + refuses a target inside the repo before anything is written
    for st in args.stages:
        if st == "plan":
            run_plan(P)
        elif st == "download":
            run_download(P, args)
        elif st == "resize":
            run_resize(P, args)
        elif st == "manifest":
            run_manifest(P)
        elif st == "prune":
            run_prune(P)
        elif st == "verify":
            problems = run_verify(P, args)
            report(P)
            if problems:
                refuse("검증 실패: 문제 %d건 (%s). 이 상태로 올리지 마세요." % (problems, os.path.join(P.state, "verify-summary.json")), code=1)
        elif st == "report":
            report(P)


if __name__ == "__main__":
    main()
