// node scripts/fonts/fetch-noto-serif-kr.mjs
//
// Vendors Noto Serif KR into the repo so `next build` never downloads fonts.
// Same source next/font/google uses: the Google Fonts CSS2 API (with a modern
// browser User-Agent so it answers with woff2 + unicode-range subsets) and the
// files on fonts.gstatic.com.
//
// Writes:
//   public/fonts/noto-serif-kr/<version>/*.woff2   one file per unicode-range subset
//   public/fonts/noto-serif-kr/<version>/OFL.txt   SIL Open Font License (google/fonts)
//   src/app/fonts/noto-serif-kr.css                @font-face rules pointing at /fonts/.../<version>/
//   src/app/fonts/noto-serif-kr.ts                 preload URL used by src/app/layout.tsx
// <version> is a short sha256 of the whole set (scripts/fonts/font-set.mjs),
// so font URLs change whenever a file changes and can be cached as immutable.
//
// Safe to re-run: everything is downloaded and checked in a staging folder
// first; the old set is removed only after the new set and the CSS are in
// place. A failed run leaves the current files untouched. Commit the output.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rm, writeFile } from "node:fs/promises";
import {
  installFontSet,
  makeStaging,
  pruneFontVersions,
  validateFontSet,
  writeFileAtomic,
} from "./font-set.mjs";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const FONT_DIR = path.join(repo, "public/fonts/noto-serif-kr");
const CSS_FILE = path.join(repo, "src/app/fonts/noto-serif-kr.css");
const TS_FILE = path.join(repo, "src/app/fonts/noto-serif-kr.ts");
// Subset preloaded on every page (same one next/font preloaded before).
const PRELOAD_FILE = "noto-serif-kr-latin.woff2";
const PUBLIC_PREFIX = "/fonts/noto-serif-kr";

// Weights the site sets on serif text: 700 (h1-h3, font-serif font-bold),
// 600 (footer h3 labels), 400 (font-serif without a weight). Noto Serif KR is
// a variable font: Google serves the same file per subset for every weight, so
// asking for the range gives one @font-face per subset ("font-weight: 400 700")
// instead of one per subset per weight (the CSS is 1/4 the size, files are
// unchanged). Widen the range if a new serif weight is used.
const WEIGHT_RANGE = "400..700";
const CSS_URL = `https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@${WEIGHT_RANGE}&display=swap`;
const OFL_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifkr/OFL.txt";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function get(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res;
}

const gfCss = await (await get(CSS_URL)).text();

// Each block: optional "/* subset */" comment, then @font-face { ... }.
const blockRe = /(?:\/\*\s*([^*]+?)\s*\*\/\s*)?@font-face\s*\{([^}]*)\}/g;
const faces = [];
for (const m of gfCss.matchAll(blockRe)) {
  const body = m[2];
  const url = body.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/)?.[1];
  const weight = body.match(/font-weight:\s*([^;]+);/)?.[1].trim();
  const range = body.match(/unicode-range:\s*([^;]+);/)?.[1].trim();
  if (!url || !weight || !range) throw new Error(`Unexpected @font-face block:\n${body}`);
  faces.push({ subset: m[1], url, weight, range });
}
if (faces.length === 0) throw new Error("No @font-face blocks in the Google Fonts response");

// Name files by subset: named ones (latin, latin-ext, ...) keep their name,
// the numbered Korean slices use the index in the gstatic file name.
const names = new Map();
for (const f of faces) {
  if (names.has(f.url)) continue;
  let label;
  if (f.subset) label = f.subset.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  else {
    const idx = f.url.match(/\.(\d+)\.woff2$/)?.[1];
    if (!idx) throw new Error(`Cannot name subset file: ${f.url}`);
    label = idx.padStart(3, "0");
  }
  const name = `noto-serif-kr-${label}.woff2`;
  if ([...names.values()].includes(name)) throw new Error(`Duplicate file name ${name}`);
  names.set(f.url, name);
}

if (![...names.values()].includes(PRELOAD_FILE)) throw new Error(`Google Fonts response has no ${PRELOAD_FILE}`);

const staging = await makeStaging(FONT_DIR);
let version;
let total = 0;
try {
  const queue = [...names.entries()];
  async function worker() {
    for (let item = queue.shift(); item; item = queue.shift()) {
      const [url, name] = item;
      const buf = Buffer.from(await (await get(url)).arrayBuffer());
      if (buf.subarray(0, 4).toString("latin1") !== "wOF2") throw new Error(`Not a woff2 file: ${url}`);
      await writeFile(path.join(staging, name), buf);
      total += buf.length;
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker));
  await writeFile(path.join(staging, "OFL.txt"), await (await get(OFL_URL)).text());

  await validateFontSet(staging, [...names.values()]);
  version = await installFontSet(staging, FONT_DIR);
} catch (err) {
  await rm(staging, { recursive: true, force: true });
  throw err;
}

const base = `${PUBLIC_PREFIX}/${version}`;
const gfVersion = faces[0].url.match(/\/notoserifkr\/(v\d+)\//)?.[1] ?? "unknown";
const css = [
  `/* Noto Serif KR (SIL Open Font License 1.1 — public${base}/OFL.txt)`,
  `   Generated by scripts/fonts/fetch-noto-serif-kr.mjs from Google Fonts (${gfVersion}). Do not edit by hand.`,
  "   One file per unicode-range subset: browsers fetch only the slices a page uses. */",
  ...faces.map(
    (f) =>
      `@font-face{font-family:"Noto Serif KR";font-style:normal;font-weight:${f.weight};font-display:swap;` +
      `src:url(${base}/${names.get(f.url)}) format("woff2");unicode-range:${f.range}}`,
  ),
  "",
].join("\n");
const ts = [
  "// Generated by scripts/fonts/fetch-noto-serif-kr.mjs. Do not edit by hand.",
  "// Same version folder as the @font-face rules in ./noto-serif-kr.css.",
  `export const NOTO_SERIF_KR_PRELOAD = "${base}/${PRELOAD_FILE}";`,
  "",
].join("\n");
// New files are in place before the CSS points at them; the old set is
// removed last, so no step leaves the CSS referring to missing files.
await writeFileAtomic(CSS_FILE, css);
await writeFileAtomic(TS_FILE, ts);
const removed = await pruneFontVersions(FONT_DIR, version);

console.log(
  `Noto Serif KR ${gfVersion}: ${faces.length} @font-face rules, ${names.size} files, ${(total / 1024 / 1024).toFixed(2)} MiB → ${path.relative(repo, path.join(FONT_DIR, version))}` +
    (removed.length ? ` (removed old: ${removed.join(", ")})` : " (unchanged or first install)"),
);
