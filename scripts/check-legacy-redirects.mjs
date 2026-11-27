// node scripts/check-legacy-redirects.mjs — after `npm run build`.
// Every content file with a `legacy.url` must redirect (308) to its own page,
// and that page must exist in the build (.next/server/app). Bulletins of one
// old week share a link: it must land on the first of them, and every page of
// that week must link all its siblings and its own PDF (a local PDF must exist
// in public/). Exits 1 on a miss.
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(repo);
const { createJiti } = await import(createRequire(repo + "/").resolve("jiti"));
const jiti = createJiti(import.meta.url, { alias: { "@": path.join(repo, "src") } });
const { legacyTarget, oldSiteUrl, bulletinWeekKey } = await jiti.import(path.join(repo, "src/lib/legacy-redirect.ts"));
const { mediaUrl } = await jiti.import(path.join(repo, "src/lib/media.ts"));
const c = await jiti.import(path.join(repo, "src/lib/content/index.ts"));
const all = [
  ["sermons", c.getSermons(), (i) => `/sermons/${i.id}`],
  ["praise", c.getPraise(), () => "/sermons/praise"],
  ["albums", c.getAlbums(), (i) => `/news/gallery/${i.id}`],
  ["videos", c.getVideos(), (i) => `/news/videos/${i.id}`],
  ["news", c.getNews(), (i) => `/news/${i.id}`],
  ["events", c.getEvents(), () => "/news"],
  ["bulletins", c.getBulletins(), null],
];
// pages that exist after build
const built = new Set();
const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (f.name.endsWith(".html")) built.add("/" + path.relative(".next/server/app", p).replace(/\.html$/, "").replace(/^index$/, "")); } };
walk(".next/server/app");
let bad = 0, n = 0; const byStatus = {};
// old week key -> its bulletins by id (the same grouping the redirect and the page use)
const weeks = new Map();
for (const b of [...c.getBulletins()].sort((x, y) => x.id.localeCompare(y.id))) {
  const key = bulletinWeekKey(b);
  if (key) weeks.set(key, [...(weeks.get(key) ?? []), b]);
}
const html = (page) => (built.has(page) ? fs.readFileSync(`.next/server/app${page}.html`, "utf8") : "");
// Every href in a page, with character references decoded (&amp; &#x27; …) —
// the address a browser follows. A local href maps to a regular file under
// public/ (each segment decoded on its own, so an encoded "/" never becomes a
// path separator).
const NAMED = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" };
const decode = (v) => v.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, r) =>
  r[0] !== "#" ? (NAMED[r.toLowerCase()] ?? m)
    : String.fromCodePoint(r[1] === "x" || r[1] === "X" ? parseInt(r.slice(2), 16) : Number(r.slice(1))));
const hrefs = (text) => new Set([...text.matchAll(/\shref="([^"]*)"/g)].map((m) => decode(m[1])));
const localFile = (href) => {
  try {
    const segs = href.split("?")[0].split("/").slice(1).map(decodeURIComponent);
    if (segs.some((s) => !s || s === "." || s === ".." || s.includes("/") || s.includes("\\"))) return false;
    return fs.statSync(path.join("public", ...segs)).isFile();
  } catch {
    return false;
  }
};
const pagePdfOk = (b, text) => {
  if (!b.pdf) return true;
  const href = mediaUrl(b.pdf);
  if (!hrefs(text).has(href)) return false;
  return !href.startsWith("/") || localFile(href);
};
for (const [name, items, expect] of all) {
  for (const i of items) {
    if (!i.legacy?.url) continue;
    n++;
    const u = oldSiteUrl(i.legacy.url);
    const t = legacyTarget(u.pathname, u.searchParams);
    const k = `${name}:${t.permanent ? 308 : 302}`; byStatus[k] = (byStatus[k] || 0) + 1;
    const page = t.to.split("#")[0];
    let ok = t.permanent && built.has(page);
    if (expect) ok = ok && t.to === expect(i);
    else {
      // A week with several bulletins shares one old link: the page it lands
      // on must be one of them and must link to every one of them.
      const week = weeks.get(bulletinWeekKey(i)) ?? [i];
      ok = ok && t.to === `/news/bulletin/${week[0].id}`;
      for (const b of week) {
        const text = html(`/news/bulletin/${b.id}`);
        ok = ok && !!text && pagePdfOk(b, text)
          && (week.length === 1 || week.every((x) => hrefs(text).has(`/news/bulletin/${x.id}`)));
      }
    }
    if (!ok) { bad++; if (bad < 8) console.log("BAD", name, i.id, i.legacy.url, t); }
  }
}
console.log("checked", n, "bad", bad, byStatus);
if (bad) process.exitCode = 1;
