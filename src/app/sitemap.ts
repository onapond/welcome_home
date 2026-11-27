import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAlbums, getBulletins, getNews, getSermons, getVideos } from "@/lib/content";
import { validateAllContent } from "@/lib/content/validate";

export default function sitemap(): MetadataRoute.Sitemap {
  // sitemap is generated on every build, so this is where every content file
  // (including ones no page shows yet, like events) gets validated.
  validateAllContent();

  // lastModified only on dated posts (sermons, news, videos, albums): their
  // `date` is when the post appeared and they are rarely edited later. List
  // pages and bulletins get none — build time would mark untouched pages as
  // changed, and a wrong value is worse than none.

  const routes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/visit", changeFrequency: "monthly", priority: 0.9 },
    { path: "/visit/service-times", changeFrequency: "monthly", priority: 0.8 },
    { path: "/sermons", changeFrequency: "weekly", priority: 0.8 },
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/sermons/praise", changeFrequency: "monthly", priority: 0.5 },
    { path: "/news", changeFrequency: "weekly", priority: 0.7 },
    { path: "/news/bulletin", changeFrequency: "weekly", priority: 0.6 },
    { path: "/news/gallery", changeFrequency: "monthly", priority: 0.5 },
    { path: "/news/videos", changeFrequency: "monthly", priority: 0.5 },
    { path: "/community", changeFrequency: "monthly", priority: 0.6 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  ];

  const list = routes.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));

  const detail = (base: string, items: { id: string; date?: string }[], priority: number, dated = false) =>
    items.map((i) => ({
      url: `${SITE_URL}${base}/${i.id}`,
      ...(dated && i.date ? { lastModified: `${i.date}T00:00:00+09:00` } : {}),
      changeFrequency: "yearly" as const,
      priority,
    }));

  return [
    ...list,
    ...detail("/sermons", getSermons(), 0.5, true),
    ...detail("/news", getNews(), 0.5, true),
    ...detail("/news/bulletin", getBulletins(), 0.3),
    ...detail("/news/gallery", getAlbums(), 0.3, true),
    ...detail("/news/videos", getVideos(), 0.3, true),
  ];
}
