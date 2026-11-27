// node scripts/fonts/fetch-pretendard.mjs
//
// Vendors Pretendard (body font) into the repo so pages never load a font
// from a CDN. Source: the official "dynamic subset" build of Pretendard
// Variable on jsDelivr (pinned release), the same split Google Fonts uses for
// Korean — browsers fetch only the slices a page actually shows.
//
// Variable, not static: the site sets 400 / 500 / 600 / 700 on body text, and
// one variable slice (~33 KB) is smaller than the four static slices a page
// would otherwise need (~12 KB each).
//
// Writes:
//   public/fonts/pretendard/<version>/*.woff2   one file per unicode-range subset
//   public/fonts/pretendard/<version>/OFL.txt   SIL Open Font License (upstream LICENSE)
//   src/app/fonts/pretendard.css                @font-face rules pointing at /fonts/.../<version>/
//   src/app/fonts/pretendard.ts                 preload URL used by src/app/layout.tsx
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
const FONT_DIR = path.join(repo, "public/fonts/pretendard");
const CSS_FILE = path.join(repo, "src/app/fonts/pretendard.css");
const TS_FILE = path.join(repo, "src/app/fonts/pretendard.ts");
const PUBLIC_PREFIX = "/fonts/pretendard";

const RELEASE = "1.3.9";
const BASE = `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v${RELEASE}`;
const CSS_URL = `${BASE}/dist/web/variable/pretendardvariable-dynamic-subset.css`;
const LICENSE_URL = `${BASE}/LICENSE`;
// Weights the site uses (font-normal/medium/semibold/bold). The file is
// variable, so this only narrows the declared range; the bytes are the same.
const WEIGHT_RANGE = "400 700";

// The subset preloaded on every page: the one holding the most characters of
// this text (menu, headings and buttons every visitor sees first).
const PRELOAD_SAMPLE =
  "청파중앙교회 교회소개 예배안내 새가족 공동체 설교 찬양 소식 공지 주보 갤러리 영상 문의 처음 오시나요 " +
  "주일예배 수요예배 금요기도회 새벽기도 오시는 길 방문 예약 자세히 보기 서울특별시 용산구 청파로 대한예수교 장로회";

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res;
}

/** "U+ac00-ac0b, U+ac0d" → [[0xac00, 0xac0b], [0xac0d, 0xac0d]] */
function parseRange(range) {
  return range.split(",").map((part) => {
    const [a, b] = part.trim().replace(/^U\+/i, "").split("-");
    return [parseInt(a, 16), parseInt(b ?? a, 16)];
  });
}

const upstreamCss = await (await get(CSS_URL)).text();

const faces = [];
for (const m of upstreamCss.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
  const body = m[1];
  const src = body.match(/url\(([^)]+\.woff2)\)/)?.[1];
  const range = body.match(/unicode-range:\s*([^;]+);/)?.[1].trim();
  const index = src?.match(/\.subset\.(\d+)\.woff2$/)?.[1];
  if (!src || !range || !index) throw new Error(`Unexpected @font-face block:\n${body}`);
  faces.push({
    url: new URL(src, CSS_URL).href,
    name: `pretendard-${index.padStart(3, "0")}.woff2`,
    range,
  });
}
if (faces.length === 0) throw new Error("No @font-face blocks in the Pretendard CSS");
if (new Set(faces.map((f) => f.name)).size !== faces.length) throw new Error("Duplicate subset file names");

const sample = [...new Set(PRELOAD_SAMPLE.replace(/\s/g, ""))].map((c) => c.codePointAt(0));
const covered = (f) => {
  const ranges = parseRange(f.range);
  return sample.filter((cp) => ranges.some(([a, b]) => cp >= a && cp <= b)).length;
};
const preload = faces.reduce((best, f) => (covered(f) > covered(best) ? f : best));

const staging = await makeStaging(FONT_DIR);
let version;
let total = 0;
try {
  const queue = [...faces];
  async function worker() {
    for (let f = queue.shift(); f; f = queue.shift()) {
      const buf = Buffer.from(await (await get(f.url)).arrayBuffer());
      if (buf.subarray(0, 4).toString("latin1") !== "wOF2") throw new Error(`Not a woff2 file: ${f.url}`);
      await writeFile(path.join(staging, f.name), buf);
      total += buf.length;
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker));
  await writeFile(path.join(staging, "OFL.txt"), await (await get(LICENSE_URL)).text());

  await validateFontSet(staging, faces.map((f) => f.name));
  version = await installFontSet(staging, FONT_DIR);
} catch (err) {
  await rm(staging, { recursive: true, force: true });
  throw err;
}

const base = `${PUBLIC_PREFIX}/${version}`;
const css = [
  `/* Pretendard Variable ${RELEASE} (SIL Open Font License 1.1 — public${base}/OFL.txt)`,
  "   Generated by scripts/fonts/fetch-pretendard.mjs from the official dynamic-subset build. Do not edit by hand.",
  "   One file per unicode-range subset: browsers fetch only the slices a page uses. */",
  ...faces.map(
    (f) =>
      `@font-face{font-family:"Pretendard Variable";font-style:normal;font-weight:${WEIGHT_RANGE};font-display:swap;` +
      `src:url(${base}/${f.name}) format("woff2-variations");unicode-range:${f.range}}`,
  ),
  "",
].join("\n");
const ts = [
  "// Generated by scripts/fonts/fetch-pretendard.mjs. Do not edit by hand.",
  "// Same version folder as the @font-face rules in ./pretendard.css.",
  `export const PRETENDARD_PRELOAD = "${base}/${preload.name}";`,
  "",
].join("\n");
// New files are in place before the CSS points at them; the old set is
// removed last, so no step leaves the CSS referring to missing files.
await writeFileAtomic(CSS_FILE, css);
await writeFileAtomic(TS_FILE, ts);
const removed = await pruneFontVersions(FONT_DIR, version);

console.log(
  `Pretendard ${RELEASE}: ${faces.length} files, ${(total / 1024 / 1024).toFixed(2)} MiB → ${path.relative(repo, path.join(FONT_DIR, version))}` +
    `, preload ${preload.name} (${covered(preload)}/${sample.length} sample characters)` +
    (removed.length ? ` (removed old: ${removed.join(", ")})` : " (unchanged or first install)"),
);
