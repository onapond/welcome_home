import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

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
    { path: "/news", changeFrequency: "weekly", priority: 0.7 },
    { path: "/community", changeFrequency: "monthly", priority: 0.6 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
