import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAlbums, getBulletins, getNews, getSermons } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

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
    { path: "/community", changeFrequency: "monthly", priority: 0.6 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  ];

  const list = routes.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  const detail = (base: string, items: { id: string; date: string }[], priority: number) =>
    items.map((i) => ({
      url: `${SITE_URL}${base}/${i.id}`,
      lastModified: new Date(i.date),
      changeFrequency: "yearly" as const,
      priority,
    }));

  return [
    ...list,
    ...detail("/sermons", getSermons(), 0.5),
    ...detail("/news", getNews(), 0.5),
    ...detail("/news/bulletin", getBulletins(), 0.3),
    ...detail("/news/gallery", getAlbums(), 0.3),
  ];
}
