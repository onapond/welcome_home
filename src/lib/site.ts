// ──────────────────────────────────────────
// 사이트 전역 상수
// ──────────────────────────────────────────

/**
 * 사이트 정규 URL (canonical / OG / sitemap / robots / JSON-LD 공용)
 *
 * 1. NEXT_PUBLIC_SITE_URL — chungpa21.org 도메인을 Vercel로 옮긴 뒤 등록한다.
 * 2. VERCEL_PROJECT_PRODUCTION_URL — Vercel이 빌드 때 자동으로 넣는 운영 주소
 *    (예: welcomehome-seven.vercel.app, https:// 없이 온다). 미리보기 배포에서도
 *    운영 주소를 가리키므로 canonical이 미리보기 주소로 새지 않는다.
 * 3. 둘 다 없으면(내 컴퓨터 빌드) http://localhost:3000
 *
 * 빈 문자열이 들어오면 metadataBase의 new URL("")이 빌드를 깨뜨리므로
 * ?? 가 아니라 truthy 검사로 폴백한다.
 */
const clean = (v: string | undefined) => v?.trim().replace(/\/+$/, "") || undefined;

const configured = clean(process.env.NEXT_PUBLIC_SITE_URL);
const vercelProduction = clean(process.env.VERCEL_PROJECT_PRODUCTION_URL);

export const SITE_URL =
  configured ??
  (vercelProduction ? `https://${vercelProduction.replace(/^https?:\/\//, "")}` : "http://localhost:3000");

/** "/visit" → "https://…/visit"; https:// 주소는 그대로 */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}
