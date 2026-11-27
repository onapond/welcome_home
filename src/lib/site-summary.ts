// ──────────────────────────────────────────
// 클라이언트 컴포넌트(머리글·바닥글·오류 화면)가 쓰는 교회 정보 요약.
// 파일을 읽는 getSite()는 서버에서만 쓸 수 있으므로, 루트 layout이
// 필요한 값만 골라 SiteProvider로 내려 준다.
// ──────────────────────────────────────────

import type { Site } from "@/lib/content/schema";

export interface SiteSummary {
  name: string;
  nameEn: string;
  denomination: string;
  vision: string;
  latestMotto: string;
  address: string;
  phone: string;
  phoneHref: string;
  fax?: string;
  email?: string;
  youtube?: string;
  instagram?: string;
}

/** "02-714-0041~3" → "tel:027140041" (대표번호의 첫 번호만 사용) */
export function telHref(phone: string): string {
  const first = phone.split(/[~,/]/)[0] ?? phone;
  return `tel:${first.replace(/[^\d+]/g, "")}`;
}

/** "도로명 (상세)" 한 줄 주소 */
export function fullAddress(address: Site["address"]): string {
  return address.detail ? `${address.road} (${address.detail})` : address.road;
}

/** 카카오맵 검색 주소 */
export function kakaoMapUrl(address: Site["address"]): string {
  return `https://map.kakao.com/?q=${encodeURIComponent(address.mapQuery)}`;
}

export function latestMotto(site: Site): Site["mottos"][number] | undefined {
  return [...site.mottos].sort((a, b) => b.year - a.year)[0];
}

export function buildSiteSummary(site: Site): SiteSummary {
  return {
    name: site.name,
    nameEn: site.nameEn,
    denomination: site.denomination,
    vision: site.vision,
    latestMotto: latestMotto(site)?.text ?? "",
    address: site.address.road,
    phone: site.phone,
    phoneHref: telHref(site.phone),
    fax: site.fax,
    email: site.email,
    youtube: site.sns.youtube,
    instagram: site.sns.instagram,
  };
}
