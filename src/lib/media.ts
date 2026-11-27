// ──────────────────────────────────────────
// Media URLs (photos in Cloudflare R2, small files in /public)
// ──────────────────────────────────────────

/**
 * Base URL of the photo store. Set NEXT_PUBLIC_MEDIA_BASE_URL to the R2 public
 * domain (e.g. https://media.chungpa21.org) once the bucket is connected.
 * Until then media keys resolve under /media in /public so local placeholders work.
 */
const configured = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim().replace(/\/+$/, "");
export const MEDIA_BASE_URL = configured || "/media";

/**
 * Allowed media path forms in content files:
 * - "albums/2024-05-12/001.webp" — key in the photo store (no "..", no scheme)
 * - "/images/logo.png"          — site path served from /public (not "//")
 * - "https://…"                 — absolute https URL
 * Protocol-relative "//host", "http://", and any other scheme are rejected.
 */
export function isMediaPath(src: string): boolean {
  if (!src || src.includes("\\")) return false;
  if (src.startsWith("//")) return false;
  if (src.startsWith("https://")) {
    try {
      const u = new URL(src);
      return u.protocol === "https:" && u.hostname.length > 0;
    } catch {
      return false;
    }
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(src)) return false; // http:, data:, javascript: …
  const path = src.startsWith("/") ? src.slice(1) : src;
  return path.split("/").every((seg) => seg !== ".." && seg !== ".");
}

/** A media path whose file part ends in .pdf (query/hash ignored). */
export function isPdfPath(src: string): boolean {
  const file = src.startsWith("https://") ? new URL(src).pathname : src.split(/[?#]/)[0];
  return /\.pdf$/i.test(file);
}

const isSitePath = (src: string) => src.startsWith("/") && !src.startsWith("//");

/**
 * Resolve a media path from content files to a URL.
 * - "/images/logo.png"          → served from /public as-is
 * - "https://…"                 → used as-is
 * - "albums/2024-05-12/001.webp" → MEDIA_BASE_URL + "/albums/2024-05-12/001.webp"
 * Anything else (e.g. "//host/x" from a Markdown body) is treated as a store
 * key, so it can never point at another site.
 */
export function mediaUrl(src: string): string {
  if (isSitePath(src) || src.startsWith("https://")) return src;
  const key = src.replace(/^\/+/, "");
  return `${MEDIA_BASE_URL}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

/**
 * Thumbnail convention: every photo "dir/name.webp" has "dir/thumb/name.webp"
 * generated at upload time, so list pages never load full-size images.
 */
export function thumbUrl(src: string): string {
  if (isSitePath(src) || src.startsWith("https://")) return src;
  const key = src.replace(/^\/+/, "");
  const i = key.lastIndexOf("/");
  return mediaUrl(i === -1 ? `thumb/${key}` : `${key.slice(0, i)}/thumb/${key.slice(i + 1)}`);
}

export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
