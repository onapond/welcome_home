import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos are resized and thumbnailed at upload time (R2), so next/image
    // only renders <img> tags: no Vercel image-optimization quota is used and
    // any https / R2 host works without editing this file.
    unoptimized: true,
  },
  // API routes read content YAML at request time (church phone, inquiry
  // types, page tokens). Make sure those files ship inside the functions.
  outputFileTracingIncludes: {
    "/api/**/*": ["./content/site.yaml", "./content/pages/*.yaml"],
    // Old-site redirects (src/app/modu) look posts up by their `legacy` field.
    "/modu/**/*": [
      "./content/sermons/*.md",
      "./content/albums/*.md",
      "./content/videos/*.md",
      "./content/news/*.md",
      "./content/bulletins/*.md",
    ],
  },
  // Font files in /public/fonts live in a content-versioned folder
  // (scripts/fonts/fetch-noto-serif-kr.mjs): a changed file gets a new URL,
  // so the old URL can be cached for a year without revalidation.
  async headers() {
    return [
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
