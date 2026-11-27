// /rss.xml — 소식 · 설교 · 영상 최신 50건 (빌드 때 한 번 만든다).
import { plainExcerpt } from "@/components/features/news/shared";
import { getNews, getSermons, getSite, getVideos } from "@/lib/content";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

const LIMIT = 50;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** "2026-04-05" → RFC 822 date at 00:00 KST */
function rfc822(date: string): string {
  return new Date(`${date}T00:00:00+09:00`).toUTCString();
}

interface FeedItem {
  title: string;
  path: string;
  date: string;
  category: string;
  description: string;
}

export function GET() {
  const site = getSite();
  const items: FeedItem[] = [
    ...getNews().map((n) => ({
      title: n.title,
      path: `/news/${n.id}`,
      date: n.date,
      category: n.category,
      description: plainExcerpt(n.body),
    })),
    ...getSermons().map((s) => ({
      title: s.title,
      path: `/sermons/${s.id}`,
      date: s.date,
      category: "설교",
      description: [s.kind, s.scripture, s.preacher].filter(Boolean).join(" · "),
    })),
    ...getVideos().map((v) => ({
      title: v.title,
      path: `/news/videos/${v.id}`,
      date: v.date,
      category: "영상",
      description: plainExcerpt(v.body),
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date) || a.path.localeCompare(b.path))
    .slice(0, LIMIT);

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `<title>${esc(site.name)}</title>`,
    `<link>${esc(SITE_URL)}</link>`,
    `<description>${esc(site.description)}</description>`,
    "<language>ko</language>",
    `<atom:link href="${esc(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml"/>`,
    ...(items[0] ? [`<lastBuildDate>${rfc822(items[0].date)}</lastBuildDate>`] : []),
    ...items.map((i) =>
      [
        "<item>",
        `<title>${esc(i.title)}</title>`,
        `<link>${esc(absoluteUrl(i.path))}</link>`,
        `<guid isPermaLink="true">${esc(absoluteUrl(i.path))}</guid>`,
        `<pubDate>${rfc822(i.date)}</pubDate>`,
        `<category>${esc(i.category)}</category>`,
        ...(i.description ? [`<description>${esc(i.description)}</description>`] : []),
        "</item>",
      ].join(""),
    ),
    "</channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
