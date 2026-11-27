// Resize / verify helper for photos.py. Uses the repo's existing `sharp` (no new deps).
//
//   node resize.mjs resize <jobs.json> <results.json>
//     jobs: [{id, in, main, thumb}] -> results: {id: {ok, srcSha256, width, height, bytes, thumbWidth, thumbHeight, thumbBytes} | {ok:false, error}}
//     srcSha256 = sha256 of the exact bytes the outputs were made from (photos.py ties resume to it).
//     On failure both outputs are removed, so a half pair never stays in out/.
//     main  = long edge <= 1600 px, webp q80; thumb = long edge <= 480 px, webp q80.
//     EXIF orientation is applied first (rotate()), then all metadata is dropped (sharp's default:
//     no withMetadata/keepMetadata -> EXIF, XMP, IPTC, ICC are not written; colours converted to sRGB).
//     Never upscales (withoutEnlargement). Animated GIFs: first frame only.
//
//   node resize.mjs verify <list.json> <results.json>
//     list: [{id, original, main, thumb}] -> per id: metadata of the outputs + expected sizes and sha256 of the original.
//
// sharp is resolved from this file's location, then from $SHARP_BASE (a directory whose
// node_modules contains sharp; photos.py sets it when running from a git worktree without node_modules).
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";

const MAIN = 1600;
const THUMB = 480;
const QUALITY = 80;

function loadSharp() {
  const bases = [import.meta.url];
  if (process.env.SHARP_BASE) bases.push(pathToFileURL(path.join(process.env.SHARP_BASE, "noop.js")).href);
  let last;
  for (const b of bases) {
    try {
      return createRequire(b)("sharp");
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

const sharp = loadSharp();
sharp.cache(false);

async function pool(items, n, fn) {
  let i = 0;
  const workers = Array.from({ length: n }, async () => {
    while (i < items.length) {
      const it = items[i++];
      await fn(it);
    }
  });
  await Promise.all(workers);
}

async function writeWebp(src, dest, edge) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const tmp = dest + ".tmp";
  const info = await sharp(src, { failOn: "none", animated: false })
    .rotate()
    .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(tmp);
  fs.renameSync(tmp, dest);
  return info;
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

function rmIfThere(f) {
  for (const p of [f, f + ".tmp"]) fs.rmSync(p, { force: true });
}

async function doResize(jobsFile, outFile) {
  const jobs = JSON.parse(fs.readFileSync(jobsFile, "utf8"));
  const res = {};
  let done = 0;
  await pool(jobs, 4, async (j) => {
    try {
      const src = fs.readFileSync(j.in); // read once: both outputs and the hash come from the same bytes
      const m = await writeWebp(src, j.main, MAIN);
      const t = await writeWebp(src, j.thumb, THUMB);
      res[j.id] = { ok: true, srcSha256: sha256(src), width: m.width, height: m.height, bytes: m.size, thumbWidth: t.width, thumbHeight: t.height, thumbBytes: t.size };
    } catch (e) {
      rmIfThere(j.main);
      rmIfThere(j.thumb);
      res[j.id] = { ok: false, error: String(e && e.message ? e.message : e) };
    }
    done++;
    if (done % 250 === 0) console.error(`resize ${done}/${jobs.length}`);
  });
  fs.writeFileSync(outFile, JSON.stringify(res));
  console.error(`resize done ${done}/${jobs.length}`);
}

// true if the EXIF block (sharp's `exif` buffer: "Exif\0\0" + TIFF) has a GPS IFD pointer (tag 0x8825) in IFD0
function hasGps(buf) {
  if (!buf || buf.length < 14) return false;
  let t = buf.subarray(buf.toString("latin1", 0, 4) === "Exif" ? 6 : 0);
  const le = t.toString("latin1", 0, 2) === "II";
  const u16 = (o) => (le ? t.readUInt16LE(o) : t.readUInt16BE(o));
  const u32 = (o) => (le ? t.readUInt32LE(o) : t.readUInt32BE(o));
  try {
    const ifd = u32(4);
    const n = u16(ifd);
    for (let i = 0; i < n; i++) if (u16(ifd + 2 + i * 12) === 0x8825) return true;
  } catch {
    return false;
  }
  return false;
}

function meta(m) {
  return {
    gps: hasGps(m.exif),
    format: m.format,
    width: m.width,
    height: m.height,
    orientation: m.orientation ?? null,
    exif: m.exif ? m.exif.length : 0,
    xmp: m.xmp ? m.xmp.length : 0,
    iptc: m.iptc ? m.iptc.length : 0,
    icc: m.icc ? m.icc.length : 0,
  };
}

async function doVerify(listFile, outFile) {
  const list = JSON.parse(fs.readFileSync(listFile, "utf8"));
  const res = {};
  await pool(list, 4, async (it) => {
    const r = {};
    try {
      if (it.original) {
        const buf = fs.readFileSync(it.original);
        r.originalSha256 = sha256(buf);
        const o = await sharp(buf, { failOn: "none", animated: false }).metadata();
        r.original = meta(o);
        // display size after EXIF orientation (5..8 swap width/height)
        const swap = (o.orientation ?? 1) >= 5;
        const w = swap ? o.height : o.width;
        const h = swap ? o.width : o.height;
        r.displayed = { width: w, height: h };
      }
      r.main = meta(await sharp(it.main).metadata());
      if (it.thumb) r.thumb = meta(await sharp(it.thumb).metadata());
    } catch (e) {
      r.error = String(e && e.message ? e.message : e);
    }
    res[it.id] = r;
  });
  fs.writeFileSync(outFile, JSON.stringify(res));
}

const [mode, a, b] = process.argv.slice(2);
if (mode === "resize") await doResize(a, b);
else if (mode === "verify") await doVerify(a, b);
else {
  console.error("usage: node resize.mjs resize|verify <in.json> <out.json>");
  process.exit(2);
}
