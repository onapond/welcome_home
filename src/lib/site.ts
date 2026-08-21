// ──────────────────────────────────────────
// 사이트 전역 상수
// ──────────────────────────────────────────

/**
 * 사이트 정규 URL (canonical / OG / sitemap / robots 공용)
 *
 * chungpa21.org 도메인은 아직 Vercel로 이전되지 않았다.
 * 이전 완료 시 Vercel 환경변수 NEXT_PUBLIC_SITE_URL을
 * https://chungpa21.org 로 변경하면 전 구간에 반영된다.
 *
 * 빈 문자열이 들어오면 metadataBase의 new URL("")이 빌드를 깨뜨리므로
 * ?? 가 아니라 truthy 검사로 폴백한다.
 */
const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");

export const SITE_URL = configured || "https://welcomehome-seven.vercel.app";
