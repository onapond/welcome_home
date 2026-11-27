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
 * Resolve a media path from content files to a URL.
 * - "/images/logo.png"          → served from /public as-is
 * - "https://…"                 → used as-is
 * - "albums/2024-05-12/001.webp" → MEDIA_BASE_URL + "/albums/2024-05-12/001.webp"
 */
export function mediaUrl(src: string): string {
  if (src.startsWith("/") || src.startsWith("https://")) return src;
  return `${MEDIA_BASE_URL}/${src.split("/").map(encodeURIComponent).join("/")}`;
}

/**
 * Thumbnail convention: every photo "dir/name.webp" has "dir/thumb/name.webp"
 * generated at upload time, so list pages never load full-size images.
 */
export function thumbUrl(src: string): string {
  if (src.startsWith("/") || src.startsWith("https://")) return src;
  const i = src.lastIndexOf("/");
  return mediaUrl(i === -1 ? `thumb/${src}` : `${src.slice(0, i)}/thumb/${src.slice(i + 1)}`);
}

export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
