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
 * Store keys and site paths are file names only: "?", "#" and "%" are
 * rejected, so the path is percent-encoded exactly once by mediaUrl() and a
 * Markdown body (which arrives already encoded) can be decoded back to the key.
 *
 * Returns a Korean message for the editor, or null when the path is fine.
 */
export function mediaPathProblem(src: string): string | null {
  const GENERIC =
    "사진·파일 경로는 보관소 경로(예: albums/2026-11-23/001.webp), / 로 시작하는 사이트 경로, https:// 주소 중 하나여야 합니다 (http:// · // 는 쓸 수 없습니다)";
  if (!src || src.includes("\\")) return GENERIC;
  if (src.startsWith("//")) return GENERIC;
  if (src.startsWith("https://")) {
    try {
      const u = new URL(src);
      return u.protocol === "https:" && u.hostname.length > 0 ? null : GENERIC;
    } catch {
      return "https:// 주소가 올바르지 않습니다 (주소 전체를 복사해 붙여 주세요)";
    }
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(src)) return GENERIC; // http:, data:, javascript: …
  if (/[?#]/.test(src)) {
    return "보관소 경로 · / 로 시작하는 경로에는 ? 나 # 를 붙이지 않습니다. 파일 경로만 적습니다 (예: bulletins/2026-11-23.pdf)";
  }
  if (src.includes("%")) {
    return "경로에 % 를 쓰지 않습니다. 한글 · 공백이 든 파일 이름도 그대로 적습니다 (예: news/예배.webp)";
  }
  const path = src.startsWith("/") ? src.slice(1) : src;
  return path.split("/").every((seg) => seg !== ".." && seg !== ".") ? null : GENERIC;
}

export function isMediaPath(src: string): boolean {
  return mediaPathProblem(src) === null;
}

/** A media path whose file part ends in .pdf (query/hash ignored). Never throws. */
export function isPdfPath(src: string): boolean {
  let file: string;
  if (src.startsWith("https://")) {
    try {
      file = new URL(src).pathname;
    } catch {
      return false;
    }
  } else {
    file = src.split(/[?#]/)[0];
  }
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
 * Markdown bodies reach the renderer already percent-encoded (the Markdown
 * parser normalizes every image destination), so "news/예배.webp" arrives as
 * "news/%EC%98%88…". Decode store keys and site paths back to the key the
 * editor typed, so body and front matter produce the identical URL. Returns
 * null when the destination cannot be decoded.
 */
export function decodeMarkdownSrc(src: string): string | null {
  if (src.startsWith("https://")) return src;
  try {
    return decodeURIComponent(src);
  } catch {
    return null;
  }
}

/** URL for an image destination inside a Markdown body. */
export function markdownMediaUrl(src: string): string {
  return mediaUrl(decodeMarkdownSrc(src) ?? src);
}

/**
 * True when the file is served by the church itself: a site path under
 * /public, a store key, or an https URL under MEDIA_BASE_URL. Only these may
 * be embedded (e.g. the bulletin PDF iframe); other https files get a link.
 */
export function isOwnMedia(src: string): boolean {
  if (!src.startsWith("https://")) return true;
  return MEDIA_BASE_URL.startsWith("https://") && src.startsWith(`${MEDIA_BASE_URL}/`);
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
