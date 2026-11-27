#!/usr/bin/env python3
"""Download + resize the old site's photos (migration m3). Everything stays OUTSIDE the repo.

Input : <out>/boards/*.json, <out>/binaries.json   (written by crawl.py)
Output: <out>/media/original/<key stem>.<ext>       originals as downloaded (untrusted data)
        <out>/media/out/<key>                        main webp (long edge <= 1600 px)
        <out>/media/out/<key stem>-480.webp          thumbnail (long edge <= 480 px)
        <out>/media/manifest.json                    original URL -> key, sizes, references, status
        <out>/media/state/                           resumable state (downloads, resize results, jobs)

Scope: photos referenced by the migrated boards (BOARDS below). s_board_2 (새가족소개) and
s_board_4 (중보기도) are not migrated (user decision 2026-11-27): a URL used only there is skipped.
PDFs (weekly) are not handled here.

Key: <collection>/<board_key>-<seq>/<nnn>.webp, nnn = 1-based position of the photo in its item
(images in page order, then photo attachments). A URL used by several items gets ONE key, from the
first item in BOARDS order / file order; every reference is recorded in the manifest.

Stages (default: all): plan download resize manifest verify
Run with `python3 -I photos.py` (downloaded files are untrusted; -I keeps cwd/script dir off sys.path,
crawl.py is loaded by explicit path).
"""
import argparse
import importlib.util
import json
import os
import random
import re
import subprocess
import sys
import threading
import time
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


def jload(fn, default):
    if os.path.exists(fn):
        with open(fn, encoding="utf-8") as f:
            return json.load(f)
    return default


def jsave(fn, obj, indent=None):
    os.makedirs(os.path.dirname(fn), exist_ok=True)
    tmp = fn + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=indent)
    os.replace(tmp, fn)


def photo_urls(item):
    urls = []
    for p in item.get("images") or []:
        if crawl.is_binary_path(p) and crawl.bin_class(p) == "photo" and p not in urls:
            urls.append(p)
    for a in item.get("attachments") or []:
        u = a["url"] if isinstance(a, dict) else a
        if crawl.bin_class(u) == "photo" and u not in urls:
            urls.append(u)
    return urls


def url_ext(u):
    sp = urlsplit(u)
    name = unquote(sp.path).rsplit("/", 1)[-1]
    if "view_img.asp" in sp.path.lower() or "download.asp" in sp.path.lower():
        fn = parse_qs(sp.query).get("filename", [""])[0]
        name = unquote(fn.split("?")[0])
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    ext = {"jpeg": "jpg"}.get(ext, ext)
    return ext if re.fullmatch(r"[a-z0-9]{2,5}", ext) else "bin"


class Paths:
    def __init__(self, out):
        self.out = out
        self.media = os.path.join(out, "media")
        self.original = os.path.join(self.media, "original")
        self.outdir = os.path.join(self.media, "out")
        self.state = os.path.join(self.media, "state")
        self.plan = os.path.join(self.state, "plan.json")
        self.downloads = os.path.join(self.state, "downloads.json")
        self.resized = os.path.join(self.state, "resized.json")
        self.manifest = os.path.join(self.media, "manifest.json")

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


def run_download(P, args):
    plan = load_plan(P)
    state = jload(P.downloads, {})
    lock = threading.Lock()
    tl = threading.local()
    todo = []
    for u, rec in plan.items():
        fn = P.orig_file(rec)
        want = (state.get(u) or {}).get("bytes") or rec.get("expected_bytes")
        if os.path.exists(fn) and want and os.path.getsize(fn) == want:
            if u not in state or state[u].get("status") != "ok":
                state[u] = {"status": "ok", "bytes": want, "file": os.path.relpath(fn, P.media), "at": crawl.now()}
            continue
        todo.append(u)
    log("download: %d planned, %d already on disk, %d to fetch" % (len(plan), len(plan) - len(todo), len(todo)))
    counter = {"n": 0, "bytes": 0}

    def fetcher():
        if not hasattr(tl, "f"):
            tl.f = crawl.Fetcher(P.out, delay=args.delay)
            tl.f.init_session()
        return tl.f

    def one(u):
        rec = plan[u]
        fn = P.orig_file(rec)
        res = {"at": crawl.now()}
        try:
            st, hl, data = fetcher().raw("GET", u)
            h = {k.lower(): v for k, v in hl}
            kind = sniff(data[:16])
            if st != 200:
                res.update(status="failed", error="HTTP %s (%s)" % (st, h.get("content-type", "")))
            elif not kind:
                res.update(status="failed", error="not an image (content-type %s, %d bytes)" % (h.get("content-type", ""), len(data)))
            else:
                os.makedirs(os.path.dirname(fn), exist_ok=True)
                with open(fn + ".part", "wb") as f:
                    f.write(data)
                os.replace(fn + ".part", fn)
                res.update(status="ok", bytes=len(data), format=kind, file=os.path.relpath(fn, P.media))
                if rec.get("expected_bytes") and rec["expected_bytes"] != len(data):
                    res["note"] = "size differs from HEAD (%s)" % rec["expected_bytes"]
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
    log("download done: %d ok, %d failed" % (len(plan) - len(bad), len(bad)))


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


def run_resize(P, args):
    plan = load_plan(P)
    dl = jload(P.downloads, {})
    done = jload(P.resized, {})
    jobs = []
    for u, rec in plan.items():
        if (dl.get(u) or {}).get("status") != "ok":
            continue
        r = done.get(u)
        if r and r.get("ok") and os.path.exists(P.main_file(rec)) and os.path.exists(P.thumb_file(rec)) and not args.force_resize:
            continue
        jobs.append({"id": u, "in": P.orig_file(rec), "main": P.main_file(rec), "thumb": P.thumb_file(rec)})
    log("resize: %d jobs" % len(jobs))
    step = 500
    for i in range(0, len(jobs), step):
        res = run_node("resize", jobs[i:i + step], P, "resize")
        done.update(res)
        jsave(P.resized, done)
        log("resize %d/%d" % (min(i + step, len(jobs)), len(jobs)))
    bad = [u for u, r in done.items() if not r.get("ok")]
    log("resize done: %d ok, %d failed" % (len(done) - len(bad), len(bad)))


# ------------------------------------------------------------------ manifest + report


def run_manifest(P):
    plan = load_plan(P)
    dl = jload(P.downloads, {})
    rz = jload(P.resized, {})
    items, failures = {}, []
    for u, rec in plan.items():
        d = dl.get(u) or {}
        r = rz.get(u) or {}
        m = {"key": rec["key"], "thumbKey": rec["thumbKey"], "references": rec["references"],
             "originalBytes": d.get("bytes"), "originalFormat": d.get("format")}
        if rec.get("excluded_board_refs"):
            m["excludedBoardRefs"] = rec["excluded_board_refs"]
        if d.get("status") != "ok":
            m["status"] = "download_failed"
            f = {"url": u, "key": rec["key"], "stage": "download", "error": d.get("error", "not attempted")}
            # view_img.asp?filename=X is an alternate link; the same file is often also linked as /file/.../X
            fname = unquote(parse_qs(urlsplit(u).query).get("filename", [""])[0].split("?")[0])
            if fname:
                for u2, rec2 in plan.items():
                    if u2 != u and unquote(urlsplit(u2).path).endswith("/" + fname) and (dl.get(u2) or {}).get("status") == "ok":
                        m["sameFileAs"] = f["sameFileAs"] = rec2["key"]
                        break
            failures.append(f)
        elif not r.get("ok"):
            m["status"] = "resize_failed"
            failures.append({"url": u, "key": rec["key"], "stage": "resize", "error": r.get("error", "not resized")})
        else:
            m.update(status="ok", width=r["width"], height=r["height"], bytes=r["bytes"],
                     thumbWidth=r["thumbWidth"], thumbHeight=r["thumbHeight"], thumbBytes=r["thumbBytes"])
        items[u] = m
    ok = [m for m in items.values() if m["status"] == "ok"]
    totals = {
        "photos": len(items),
        "ok": len(ok),
        "failed": len(failures),
        "originalBytes": sum(m.get("originalBytes") or 0 for m in items.values()),
        "mainBytes": sum(m["bytes"] for m in ok),
        "thumbBytes": sum(m["thumbBytes"] for m in ok),
    }
    jsave(P.manifest, {"generated_at": crawl.now(), "generator": "scripts/migrate/photos.py",
                       "keyScheme": "<collection>/<board_key>-<seq>/<nnn>.webp (+ -480 thumb)",
                       "boards": [b for b, _ in BOARDS], "excludedBoards": EXCLUDED,
                       "totals": totals, "photos": items, "failures": failures}, indent=1)
    log("manifest: %s" % json.dumps(totals))
    return items, failures, totals


def check_one(r, m):
    """problems for one photo: metadata left in outputs, wrong long edge, lost orientation, manifest mismatch."""
    if r.get("error"):
        return [r["error"]]
    dw, dh = r["displayed"]["width"], r["displayed"]["height"]
    errs = []
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
    """Checks EVERY ok output (sharp metadata), prints a random sample in detail."""
    plan = load_plan(P)
    man = jload(P.manifest, None) or {"photos": run_manifest(P)[0]}
    ok = [u for u, m in man["photos"].items() if m["status"] == "ok"]
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
    summary = {"checked": len(ok), "problems": len(bad), "originalsWithExif": sum(1 for o in orig if o["exif"]),
               "originalsWithGps": sum(1 for o in orig if o["gps"]), "originalsRotated": len(rotated),
               "outputsWithMetadata": sum(1 for e in bad.values() if any("metadata" in x for x in e))}
    print("verify all outputs: %s" % json.dumps(summary))
    for u, e in list(bad.items())[:20]:
        print("  PROBLEM", man["photos"][u]["key"], "; ".join(e))
    jsave(os.path.join(P.state, "verify-summary.json"), {"at": crawl.now(), "seed": args.seed, "summary": summary,
                                                        "problems": {u: e for u, e in bad.items()}}, indent=1)
    return len(bad)


def report(P):
    man = jload(P.manifest, {})
    t = man.get("totals", {})
    dl = jload(P.downloads, {})
    nd = sum(1 for d in dl.values() if d.get("status") == "ok")
    print("originals: %d files, %.1f MB" % (nd, sum(d.get("bytes", 0) for d in dl.values() if d.get("status") == "ok") / 1e6))
    print("outputs: %d main (%.1f MB) + %d thumbs (%.1f MB)" % (t.get("ok", 0), t.get("mainBytes", 0) / 1e6, t.get("ok", 0), t.get("thumbBytes", 0) / 1e6))
    print("failures: %d" % len(man.get("failures", [])))
    for f in man.get("failures", []):
        print("  %s %s %s: %s" % (f["stage"], f["key"], f["url"][:90], f["error"]))
    ok = sorted((m for m in man.get("photos", {}).values() if m["status"] == "ok"), key=lambda m: -m["bytes"])
    print("largest main outputs:")
    for m in ok[:5]:
        print("  %s %.0f KB %dx%d" % (m["key"], m["bytes"] / 1024, m["width"], m["height"]))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("stages", nargs="*", default=["plan", "download", "resize", "manifest", "verify"])
    ap.add_argument("--out", default=crawl.DEFAULT_OUT)
    ap.add_argument("--workers", type=int, default=4, help="parallel downloads (max 4)")
    ap.add_argument("--delay", type=float, default=0.3, help="seconds between requests per connection")
    ap.add_argument("--force-resize", action="store_true")
    ap.add_argument("--verify-n", type=int, default=10)
    ap.add_argument("--seed", type=int, default=None)
    args = ap.parse_args()
    args.workers = max(1, min(args.workers, 4))
    if args.seed is None:
        args.seed = random.randrange(1 << 30)
    P = Paths(args.out)
    for st in args.stages:
        if st == "plan":
            run_plan(P)
        elif st == "download":
            run_download(P, args)
        elif st == "resize":
            run_resize(P, args)
        elif st == "manifest":
            run_manifest(P)
        elif st == "verify":
            run_verify(P, args)
            report(P)
        elif st == "report":
            report(P)
        else:
            sys.exit("unknown stage " + st)


if __name__ == "__main__":
    main()
