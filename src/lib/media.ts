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
 * No form may hold whitespace, separators, control or format (invisible)
 * characters (Unicode Z, Cc, Cf — a browser strips some of them, so the URL it
 * opens would differ from the text that was checked); the error names the
 * character as U+XXXX. "{" and "}" are rejected too: {{token}} substitution
 * never applies to media paths, so a path stays exactly the text checked here.
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
  const blank = /[\s\p{Z}\p{Cc}\p{Cf}]/u.exec(src);
  if (blank) {
    const code = (blank[0].codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, "0");
    return `경로에 공백 · 탭 · 줄바꿈이나 보이지 않는 글자(U+${code})를 쓸 수 없습니다. 파일 이름의 공백은 하이픈(-)으로 바꾸고, 앞뒤 빈칸은 지웁니다 (예: news/주일-예배.webp)`;
  }
  if (/[{}]/.test(src)) {
    return "사진 · 파일 경로에는 자리표시({{ }})를 쓸 수 없습니다. { · } 없이 실제 파일 이름을 그대로 적어 주세요 (예: news/주일-예배.webp)";
  }
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
  if (/[?#%]/.test(src)) {
    return "보관소 경로 · / 로 시작하는 경로에는 ? · # · % 를 쓸 수 없습니다. 파일 이름에서 이 글자를 빼고 필요하면 하이픈(-)을 씁니다 (예: news/주일-예배.webp, bulletins/2026-11-23.pdf)";
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
 * URL for an image destination inside a Markdown body. Bodies reach the
 * renderer already percent-encoded (the Markdown parser normalizes every image
 * destination), so "news/예배.webp" arrives as "news/%EC%98%88…". The written
 * destination was checked to hold no "%" (lib/content/body.ts), so decoding
 * gives back exactly the key the editor typed and body and front matter
 * produce the identical URL.
 */
export function markdownMediaUrl(src: string): string {
  if (src.startsWith("https://")) return src;
  let key = src;
  try {
    key = decodeURIComponent(src);
  } catch {
    // unreachable for checked content; keep the parser's form
  }
  return mediaUrl(key);
}

/**
 * True when a (validated) media path may be embedded, e.g. the bulletin PDF
 * iframe: only store keys and "/" site paths. Every https:// URL — even one
 * under MEDIA_BASE_URL — gets a plain link, so no origin comparison is needed.
 */
export function isEmbeddableMedia(src: string): boolean {
  return !src.startsWith("https://");
}

/**
 * A photo with an optional smaller copy for lists. Content files name the
 * small copy explicitly (`thumb:`); it is never derived from the file name,
 * because photos staff upload by hand have no small copy.
 */
export interface ImageRef {
  src: string;
  thumb?: string;
}

/** URL for grids, cards and lists: the small copy when given, else the photo itself. */
export function thumbUrl(img: ImageRef): string {
  return mediaUrl(img.thumb ?? img.src);
}

// ─── Video (sermons · praise · videos) ─────────────────────────────────────────────────

/** A parsed `video:` field (lib/content/schema.ts). */
export type Video = { provider: "youtube"; id: string } | { provider: "vimeo"; id: string; hash?: string };

export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/** iframe src: youtube-nocookie for YouTube, player.vimeo.com with dnt=1 for Vimeo. */
export function videoEmbedUrl(v: Video): string {
  if (v.provider === "youtube") return `https://www.youtube-nocookie.com/embed/${v.id}`;
  return `https://player.vimeo.com/video/${v.id}?dnt=1${v.hash ? `&h=${v.hash}` : ""}`;
}

/** iframe `allow` attribute for each provider. */
export function videoEmbedAllow(v: Video): string {
  return v.provider === "youtube"
    ? "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    : "autoplay; fullscreen; picture-in-picture";
}

/** Public page of the video (opened in a new tab). */
export function videoWatchUrl(v: Video): string {
  if (v.provider === "youtube") return `https://www.youtube.com/watch?v=${v.id}`;
  return `https://vimeo.com/${v.id}${v.hash ? `/${v.hash}` : ""}`;
}

/**
 * Cover image for a video: the content's `thumbnail:` when given, else the
 * YouTube still. Vimeo has no static thumbnail URL without an API call, so a
 * Vimeo video without `thumbnail:` gets null (cards draw a placeholder).
 * `size: "card"` uses the thumbnail's small copy (`thumb`) when there is one;
 * `"full"` (share previews) always uses the main photo.
 */
export function videoThumb(
  v: Video | undefined,
  thumbnail?: ImageRef,
  size: "card" | "full" = "card",
): string | null {
  if (thumbnail) return size === "card" ? thumbUrl(thumbnail) : mediaUrl(thumbnail.src);
  if (!v) return null;
  return v.provider === "youtube" ? youtubeThumb(v.id) : null;
}
