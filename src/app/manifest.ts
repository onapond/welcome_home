import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";

// Web app manifest (홈 화면에 추가). Icons are src/app/icon.png (512, transparent)
// and src/app/apple-icon.png (180, white background).
export default function manifest(): MetadataRoute.Manifest {
  const site = getSite();
  return {
    name: `${site.name} (${site.nameEn})`,
    short_name: site.name,
    description: site.description,
    lang: "ko",
    start_url: "/",
    display: "browser",
    theme_color: "#2B3A8C",
    background_color: "#FFFFFF",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
