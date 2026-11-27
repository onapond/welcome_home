// ──────────────────────────────────────────
// 클라이언트 컴포넌트(머리글·바닥글·오류 화면)가 쓰는 교회 정보 요약.
// 파일을 읽는 getSite()는 서버에서만 쓸 수 있으므로, 루트 layout이
// 필요한 값만 골라 SiteProvider로 내려 준다.
// (이 파일은 서버 전용이다 — 클라이언트에서는 SiteSummary 타입만 가져다 쓴다.)
// ──────────────────────────────────────────

import type { Site } from "@/lib/content/schema";
import { getCommunityPage } from "@/lib/content/pages";
import { fullAddress, latestMotto } from "@/lib/content/site-format";
import type { NavChild } from "@/lib/nav";

export { fullAddress, latestMotto };

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
  /** 바닥글 「공동체」 링크 — 검증된 community.yaml groups에서 만든다. */
  communityLinks: NavChild[];
}

/** "02-714-0041~3" → "tel:027140041" (대표번호의 첫 번호만 사용) */
export function telHref(phone: string): string {
  const first = phone.split(/[~,/]/)[0] ?? phone;
  return `tel:${first.replace(/[^\d+]/g, "")}`;
}

export function buildSiteSummary(
  site: Site,
  groups: { id: string; title: string }[] = getCommunityPage().groups,
): SiteSummary {
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
    communityLinks: groups.map((g) => ({ label: g.title, href: `/community#${g.id}` })),
  };
}
