import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAlbums, getBulletins, getNews, getSermons, getVideos } from "@/lib/content";
import { validateAllContent } from "@/lib/content/validate";

export default function sitemap(): MetadataRoute.Sitemap {
  // sitemap is generated on every build, so this is where every content file
  // (including ones no page shows yet, like events) gets validated.
  validateAllContent();

  // No lastModified anywhere. A post's `date` is when it was published, not when
  // its file last changed (a later video or body fix keeps the same date), and
  // content files carry no separate "updated" field. List pages, home and
  // bulletins get none either — build time would mark untouched pages as
  // changed. A wrong lastmod is worse than none (crawlers learn to ignore it).
  // If an `updated:` front-matter field is added later, emit it here only for
  // posts that have it.

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
    { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  ];

  const list = routes.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));

  const detail = (base: string, items: { id: string }[], priority: number) =>
    items.map((i) => ({
      url: `${SITE_URL}${base}/${i.id}`,
      changeFrequency: "yearly" as const,
      priority,
    }));

  return [
    ...list,
    ...detail("/sermons", getSermons(), 0.5),
    ...detail("/news", getNews(), 0.5),
    ...detail("/news/bulletin", getBulletins(), 0.3),
    ...detail("/news/gallery", getAlbums(), 0.3),
    ...detail("/news/videos", getVideos(), 0.3),
  ];
}
