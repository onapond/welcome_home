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
const pagePdfOk = (b, text) => {
  if (!b.pdf) return true;
  const href = mediaUrl(b.pdf);
  if (!text.includes(`href="${href}"`)) return false;
  return !href.startsWith("/") || fs.existsSync(path.join("public", href));
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
          && (week.length === 1 || week.every((x) => text.includes(`href="/news/bulletin/${x.id}"`)));
      }
    }
    if (!ok) { bad++; if (bad < 8) console.log("BAD", name, i.id, i.legacy.url, t); }
  }
}
console.log("checked", n, "bad", bad, byStatus);
if (bad) process.exitCode = 1;
