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
  },
};

export default nextConfig;
