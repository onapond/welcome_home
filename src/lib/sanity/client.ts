import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01";

if (!projectId) {
  console.warn(
    "[sanity/client] NEXT_PUBLIC_SANITY_PROJECT_ID is not set. " +
      "Copy .env.local.example to .env.local and fill in your Sanity project details."
  );
}

/** Read-only client for public data (used in Server Components & SSG) */
export const sanityClient = createClient({
  projectId: projectId ?? "placeholder",
  dataset,
  apiVersion,
  useCdn: true, // cached CDN — fastest for public reads
});

/** Preview client — bypasses CDN to show draft content */
export const previewClient = createClient({
  projectId: projectId ?? "placeholder",
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "previewDrafts",
});

/** Write client — used only in server actions / seed scripts */
export const writeClient = createClient({
  projectId: projectId ?? "placeholder",
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

export { dataset, apiVersion };
