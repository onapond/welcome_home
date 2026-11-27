// ──────────────────────────────────────────
// 사이트 메뉴 — Header · MobileNav · Footer가 함께 쓰는 단일 상수.
// 메뉴 구조는 라우트와 함께 움직이는 구조 정보라 코드에 둔다.
// ──────────────────────────────────────────

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: readonly NavChild[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "교회소개", href: "/about" },
  { label: "예배안내", href: "/visit/service-times" },
  { label: "새가족", href: "/visit" },
  { label: "공동체", href: "/community" },
  {
    label: "설교",
    href: "/sermons",
    children: [
      { label: "설교", href: "/sermons" },
      { label: "찬양", href: "/sermons/praise" },
    ],
  },
  {
    label: "소식",
    href: "/news",
    children: [
      { label: "소식 & 공지", href: "/news" },
      { label: "주보", href: "/news/bulletin" },
      { label: "갤러리", href: "/news/gallery" },
    ],
  },
  { label: "문의", href: "/contact" },
];

/** 머리글 · 모바일 메뉴의 강조 버튼 */
export const NAV_CTA: NavChild = { label: "처음 오시나요?", href: "/visit#reservation" };


export interface FooterLinkGroup {
  title: string;
  links: readonly NavChild[];
}

const FOOTER_WORSHIP_LINKS: FooterLinkGroup = {
  title: "예배",
  links: [
    { label: "새가족 안내", href: "/visit" },
    { label: "방문 예약", href: "/visit#reservation" },
    { label: "오시는 길", href: "/visit#location" },
    { label: "예배 시간", href: "/visit/service-times" },
  ],
};

const FOOTER_MEDIA_LINKS: FooterLinkGroup = {
  title: "미디어",
  links: [
    { label: "설교 아카이브", href: "/sermons" },
    { label: "찬양", href: "/sermons/praise" },
    { label: "소식 & 공지", href: "/news" },
    { label: "주보", href: "/news/bulletin" },
    { label: "갤러리", href: "/news/gallery" },
    { label: "문의하기", href: "/contact" },
    { label: "교회소개", href: "/about" },
  ],
};

/**
 * 바닥글 링크 묶음. 「공동체」 칸은 content/pages/community.yaml의 groups에서
 * 만든 링크(SiteSummary.communityLinks)를 받는다 — 부서 이름·id를 바꾸면 따라온다.
 */
export function footerLinkGroups(communityLinks: readonly NavChild[]): readonly FooterLinkGroup[] {
  return [FOOTER_WORSHIP_LINKS, { title: "공동체", links: communityLinks }, FOOTER_MEDIA_LINKS];
}
