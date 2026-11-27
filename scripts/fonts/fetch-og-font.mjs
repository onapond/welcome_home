// node scripts/fonts/fetch-og-font.mjs
//
// Font for the share preview image (src/app/opengraph-image.tsx). next/og
// (satori) cannot read woff2, and the full Noto Serif KR Bold TTF is 14 MB,
// so this fetches a Bold subset with just the characters a preview can need:
// the 2,350 Hangul syllables of KS X 1001 (everyday Korean), printable ASCII
// and common punctuation. Google Fonts' `text=` parameter makes the subset;
// long texts are split into a few requests, so the result is several small
// fonts that the image loads together as one family.
//
// Each TTF is repacked as WOFF 1.0 (zlib per table, no glyph changes) to
// keep the repo small. The files are read only at build time; they are not
// served to visitors.
//
// Writes:
//   src/assets/og/noto-serif-kr-700-<n>.woff
//   src/assets/og/chars.txt   every character covered (the image checks its text against it)
//   src/assets/og/OFL.txt     SIL Open Font License (google/fonts)
// Re-run only to change the character set. Commit the output.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = path.join(repo, "src/assets/og");
const OFL_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifkr/OFL.txt";
// Google returns the whole 14 MB font when `text=` is too long; 500
// characters per request stays well under that limit.
const CHUNK = 500;

function charset() {
  const out = [];
  for (let cp = 0x20; cp <= 0x7e; cp++) out.push(String.fromCodePoint(cp));
  out.push(..."·‘’“”–—…~「」『』《》〈〉※");
  // KS X 1001 Hangul block: lead bytes B0-C8, trail bytes A1-FE (EUC-KR).
  const dec = new TextDecoder("euc-kr", { fatal: true });
  for (let a = 0xb0; a <= 0xc8; a++) for (let b = 0xa1; b <= 0xfe; b++) out.push(dec.decode(new Uint8Array([a, b])));
  return [...new Set(out)];
}

async function get(url) {
  // No browser User-Agent: Google Fonts then answers with TrueType files.
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res;
}

const align4 = (n) => (n + 3) & ~3;

/** Repack a TTF/OTF (sfnt) as WOFF 1.0. Table data is copied byte for byte. */
function sfntToWoff(sfnt) {
  const flavor = sfnt.readUInt32BE(0);
  const numTables = sfnt.readUInt16BE(4);
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const o = 12 + 16 * i;
    const offset = sfnt.readUInt32BE(o + 8);
    const length = sfnt.readUInt32BE(o + 12);
    const data = sfnt.subarray(offset, offset + length);
    const packed = deflateSync(data, { level: 9 });
    tables.push({
      tag: sfnt.subarray(o, o + 4),
      checksum: sfnt.readUInt32BE(o + 4),
      length,
      data: packed.length < length ? packed : data,
    });
  }
  let offset = 44 + 20 * numTables;
  const dir = Buffer.alloc(20 * numTables);
  tables.forEach((t, i) => {
    t.offset = offset;
    t.tag.copy(dir, 20 * i);
    dir.writeUInt32BE(offset, 20 * i + 4);
    dir.writeUInt32BE(t.data.length, 20 * i + 8);
    dir.writeUInt32BE(t.length, 20 * i + 12);
    dir.writeUInt32BE(t.checksum, 20 * i + 16);
    offset = align4(offset + t.data.length);
  });
  const total = offset;
  const out = Buffer.alloc(total);
  out.write("wOFF", 0, "latin1");
  out.writeUInt32BE(flavor, 4);
  out.writeUInt32BE(total, 8);
  out.writeUInt16BE(numTables, 12);
  out.writeUInt32BE(12 + 16 * numTables + tables.reduce((s, t) => s + align4(t.length), 0), 16);
  out.writeUInt16BE(1, 20); // WOFF major version (font version fields are informational)
  dir.copy(out, 44);
  for (const t of tables) t.data.copy(out, t.offset);
  return out;
}

const chars = charset();
const chunks = [];
for (let i = 0; i < chars.length; i += CHUNK) chunks.push(chars.slice(i, i + CHUNK).join(""));

const files = [];
for (const [i, text] of chunks.entries()) {
  const css = await (
    await get(`https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@700&text=${encodeURIComponent(text)}`)
  ).text();
  const url = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)\s*format\('truetype'\)/)?.[1];
  if (!url) throw new Error(`No TrueType URL in the Google Fonts answer:\n${css}`);
  const ttf = Buffer.from(await (await get(url)).arrayBuffer());
  if (ttf.readUInt32BE(0) !== 0x00010000) throw new Error(`Not a TrueType file: ${url}`);
  if (ttf.length > 2_000_000) throw new Error(`Subset ${i} is ${ttf.length} bytes — Google returned the full font`);
  files.push({ name: `noto-serif-kr-700-${i}.woff`, data: sfntToWoff(ttf), ttf: ttf.length });
}

await mkdir(OUT_DIR, { recursive: true });
for (const name of await readdir(OUT_DIR)) {
  if (/^noto-serif-kr-700-\d+\.woff$/.test(name)) await rm(path.join(OUT_DIR, name));
}
for (const f of files) await writeFile(path.join(OUT_DIR, f.name), f.data);
await writeFile(path.join(OUT_DIR, "chars.txt"), chars.join(""));
await writeFile(path.join(OUT_DIR, "OFL.txt"), await (await get(OFL_URL)).text());

const woff = files.reduce((s, f) => s + f.data.length, 0);
const ttf = files.reduce((s, f) => s + f.ttf, 0);
console.log(
  `OG font: ${chars.length} characters in ${files.length} files, ${(ttf / 1024).toFixed(0)} KiB TTF → ${(woff / 1024).toFixed(0)} KiB WOFF → ${path.relative(repo, OUT_DIR)}`,
);
