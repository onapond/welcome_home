// node scripts/check-legacy-redirects.mjs — after `npm run build`.
// Every content file with a `legacy.url` must redirect (308) to its own page,
// and that page must exist in the build (.next/server/app). Exits 1 on a miss.
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(repo);
const { createJiti } = await import(createRequire(repo + "/").resolve("jiti"));
const jiti = createJiti(import.meta.url, { alias: { "@": path.join(repo, "src") } });
const { legacyTarget } = await jiti.import(path.join(repo, "src/lib/legacy-redirect.ts"));
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
for (const [name, items, expect] of all) {
  for (const i of items) {
    if (!i.legacy?.url) continue;
    n++;
    const u = new URL(i.legacy.url.replace(/^http:\/\/www\./i, "https://"));
    const t = legacyTarget(u.pathname, u.searchParams);
    const k = `${name}:${t.permanent ? 308 : 302}`; byStatus[k] = (byStatus[k] || 0) + 1;
    const page = t.to.split("#")[0];
    let ok = t.permanent && built.has(page);
    if (expect) ok = ok && t.to === expect(i);
    else ok = ok && t.to.startsWith("/news/bulletin/") && c.getBulletins().some((b) => `/news/bulletin/${b.id}` === t.to && b.legacy?.url === i.legacy.url);
    if (!ok) { bad++; if (bad < 8) console.log("BAD", name, i.id, i.legacy.url, t); }
  }
}
console.log("checked", n, "bad", bad, byStatus);
if (bad) process.exitCode = 1;
