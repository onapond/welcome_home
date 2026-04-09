import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
const dataset = (process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production").trim();
const apiVersion = (process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01").trim();

const VALID_PROJECT_ID = /^[a-z0-9][a-z0-9-]*$/.test(projectId ?? "");

if (!VALID_PROJECT_ID) {
  console.warn(
    "[sanity/client] NEXT_PUBLIC_SANITY_PROJECT_ID is not set or invalid. " +
      "Copy .env.local.example to .env.local and fill in your Sanity project details."
  );
}

const clientConfig = {
  projectId: VALID_PROJECT_ID ? projectId! : "placeholder00",
  dataset,
  apiVersion,
};

/** Read-only client for public data (used in Server Components & SSG) */
export const sanityClient = createClient({
  ...clientConfig,
  useCdn: true,
});

/** Preview client — bypasses CDN to show draft content */
export const previewClient = createClient({
  ...clientConfig,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "previewDrafts",
});

/** Write client — used only in server actions / seed scripts */
export const writeClient = createClient({
  ...clientConfig,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

export { dataset, apiVersion };
