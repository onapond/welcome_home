// Helpers for scripts/fonts/fetch-noto-serif-kr.mjs and fetch-pretendard.mjs:
// check a downloaded font set, give it a content-versioned folder and swap it
// in without ever leaving the site with a CSS file that points at missing font files.
//
// Layout (fontRoot = public/fonts/noto-serif-kr or public/fonts/pretendard):
//   <fontRoot>/<version>/*.woff2 + OFL.txt   version = short sha256 of the set
// The URL changes whenever any file changes, so /fonts/* can be cached
// forever (next.config.ts) and a returning visitor never mixes a new CSS with
// old font files.
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export const VERSION_RE = /^[0-9a-f]{12}$/;
export const STAGING_PREFIX = ".staging-";

/** Short sha256 over every file in the set (sorted names + contents). */
export async function hashFontSet(dir) {
  const names = (await readdir(dir)).filter((n) => !n.startsWith(".")).sort();
  const h = createHash("sha256");
  for (const name of names) {
    h.update(`${name}\0`);
    h.update(createHash("sha256").update(await readFile(path.join(dir, name))).digest("hex"));
    h.update("\n");
  }
  return h.digest("hex").slice(0, 12);
}

/**
 * Throws unless `dir` holds exactly `fileNames` (all valid woff2) plus an
 * OFL.txt with the SIL Open Font License 1.1 text.
 */
export async function validateFontSet(dir, fileNames) {
  const want = new Set([...fileNames, "OFL.txt"]);
  const have = (await readdir(dir)).filter((n) => !n.startsWith("."));
  const extra = have.filter((n) => !want.has(n));
  const missing = [...want].filter((n) => !have.includes(n));
  if (extra.length || missing.length) {
    throw new Error(`Font set mismatch in ${dir}: missing [${missing.join(", ")}] extra [${extra.join(", ")}]`);
  }
  for (const name of fileNames) {
    if (!name.endsWith(".woff2")) throw new Error(`Not a .woff2 name: ${name}`);
    const buf = await readFile(path.join(dir, name));
    if (buf.length < 48 || buf.subarray(0, 4).toString("latin1") !== "wOF2") {
      throw new Error(`Not a woff2 file: ${name}`);
    }
  }
  const ofl = await readFile(path.join(dir, "OFL.txt"), "utf8");
  if (!/SIL OPEN FONT LICENSE Version 1\.1/.test(ofl) || !/Copyright/.test(ofl)) {
    throw new Error("OFL.txt does not look like the SIL Open Font License 1.1 with a copyright line");
  }
}

/** A fresh staging folder inside fontRoot (same disk, so the final rename is atomic). */
export async function makeStaging(fontRoot) {
  await mkdir(fontRoot, { recursive: true });
  const dir = path.join(fontRoot, `${STAGING_PREFIX}${randomBytes(4).toString("hex")}`);
  await mkdir(dir);
  return dir;
}

/**
 * Move a validated staging folder to <fontRoot>/<version>. If that version
 * is already installed (same content), the staging copy is dropped.
 * Returns the version.
 */
export async function installFontSet(staging, fontRoot) {
  const version = await hashFontSet(staging);
  const target = path.join(fontRoot, version);
  const exists = await stat(target).then(
    () => true,
    () => false,
  );
  if (exists) {
    if ((await hashFontSet(target)) !== version) throw new Error(`${target} exists with different content`);
    await rm(staging, { recursive: true, force: true });
  } else {
    await rename(staging, target);
  }
  return version;
}

/** Write a file via a temp file + rename, so a reader never sees half of it. */
export async function writeFileAtomic(file, content) {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${randomBytes(4).toString("hex")}.tmp`;
  await writeFile(tmp, content);
  await rename(tmp, file);
}

/** Remove every version folder (and leftover staging folder) except `keep`. */
export async function pruneFontVersions(fontRoot, keep) {
  const removed = [];
  for (const name of await readdir(fontRoot)) {
    if (name === keep) continue;
    if (VERSION_RE.test(name) || name.startsWith(STAGING_PREFIX)) {
      await rm(path.join(fontRoot, name), { recursive: true, force: true });
      removed.push(name);
    }
  }
  return removed;
}
