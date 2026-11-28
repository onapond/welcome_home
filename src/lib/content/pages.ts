import { z } from "zod";
import { ICON_KEYS } from "@/lib/icons";
import { ContentError, loadYaml } from "./load";
import { idList, idString, isoDate, mediaPath, optional, text } from "./schema";
import { fillTokens } from "./tokens";
import { getHistory, getSite, getStaff } from "./index";

// ─── 공통 조각 ───────────────────────────────────────────────────────────────
// 직원이 고치는 파일이므로 모든 객체는 strict(모르는 항목 = 오류), 문구는
// 앞뒤 공백을 지운 뒤 비어 있으면 오류다.

const icon = z.enum(ICON_KEYS);
const link = z.strictObject({ label: text, href: text });
const lines = z.array(text).min(1); // 줄바꿈 단위로 나눠 적는 문구
const meta = z.strictObject({
  title: text,
  description: text,
  ogDescription: optional(text),
});
const hero = z.strictObject({ badge: text, title: text, lines });
const sectionLabel = z.strictObject({ label: text, title: text });
const iconItem = z.strictObject({ icon, title: text, text });

// ─── content/pages/home.yaml ─────────────────────────────────────────────────

export const homeSchema = z.strictObject({
  hero: z.strictObject({
    badge: text,
    headline: text,
    lines,
    primaryCta: link,
    secondaryCta: link,
    // 슬라이드 배경 사진. image를 비우면 「사진 준비 중」 자리표시가 나온다.
    slides: z.array(z.strictObject({ label: text, image: optional(mediaPath) })).min(1),
  }),
  journey: z.strictObject({
    label: text,
    title: text,
    // 표어(site.yaml mottos)와 연도로 짝지어진다.
    nodes: z.array(z.strictObject({ year: z.number().int(), subtitle: text, icon })),
  }),
  newHere: z.strictObject({
    label: text,
    title: text,
    intro: text,
    items: z.array(iconItem),
    cta: link,
    image: z.strictObject({ label: text, src: optional(mediaPath) }),
    badge: z.strictObject({ label: text, text }),
    quote: z.strictObject({ year: z.number().int(), caption: text }),
  }),
  community: z.strictObject({ label: text, title: text, linkLabel: text }),
});

// ─── content/pages/location.yaml ─────────────────────────────────────────────

export const locationSchema = z.strictObject({
  label: text,
  mapButton: text, // 카카오맵 버튼
  naverMapButton: text, // 네이버 지도 버튼
  // 길찾기 상자의 제목과 안내 문구
  directions: z.strictObject({ title: text, text }),
  transport: idList(z.strictObject({ id: idString, icon, label: text, text })),
});

// ─── content/pages/about.yaml ────────────────────────────────────────────────

export const aboutSchema = z.strictObject({
  meta,
  hero,
  vision: z.strictObject({
    label: text,
    title: text,
    intro: text,
    items: z.array(iconItem),
  }),
  pastor: z.strictObject({
    label: text,
    roleLine: text,
    photo: optional(mediaPath),
    bioLabel: text,
    bio: text,
    career: z.array(z.strictObject({ label: text, value: text })),
    quote: z.strictObject({ text, by: text }),
  }),
  history: z.strictObject({
    label: text,
    title: text,
    allLabel: text,
  }),
  beliefs: z.strictObject({
    label: text,
    title: text,
    intro: text,
    items: z.array(z.strictObject({ title: text, text })),
  }),
  staff: sectionLabel,
});

// ─── content/pages/community.yaml ────────────────────────────────────────────

export const GROUP_COLORS = ["primary", "secondary", "accent", "primary-light"] as const;

export const communitySchema = z.strictObject({
  meta,
  hero,
  groups: idList(
    z.strictObject({
      id: idString,
      label: text,
      title: text,
      subtitle: text,
      summary: text, // 홈 카드용 한 줄 소개
      tag: text, // 홈 카드 우하단 배지
      showOnHome: z.boolean().default(true),
      description: text,
      tags: z.array(text).default([]),
      color: z.enum(GROUP_COLORS).default("primary"),
      image: optional(mediaPath),
      logo: optional(mediaPath), // 부서 로고(투명 배경 PNG · SVG) — 이름 옆 · 홈 카드 사진 위에 나온다
      details: z.array(z.strictObject({ label: text, value: text })).default([]),
      showSnsLinks: z.boolean().default(false), // site.yaml의 인스타그램 · 유튜브 버튼
    }),
  ),
  cta: z.strictObject({
    label: text,
    title: text,
    text,
    primary: link,
    secondary: link,
  }),
});

// ─── content/pages/visit.yaml ────────────────────────────────────────────────

export const visitSchema = z.strictObject({
  meta,
  hero,
  faq: z.strictObject({
    label: text,
    title: text,
    items: z.array(z.strictObject({ question: text, answer: text })),
  }),
  // 「처음 오시면 이렇게 진행돼요」 단계 안내(선택). 비우면 이 섹션이 나오지 않는다.
  steps: optional(
    z.strictObject({
      label: text,
      title: text,
      items: z.array(iconItem).min(1),
    }),
  ),
  services: sectionLabel,
  reservation: z.strictObject({
    label: text,
    title: text,
    intro: text,
    successMessage: text,
    submitLabel: text,
  }),
});

// ─── content/pages/service-times.yaml ────────────────────────────────────────

export const serviceTimesSchema = z.strictObject({
  meta,
  hero,
  regular: sectionLabel,
  special: sectionLabel,
  cta: z.strictObject({
    title: text,
    lines,
    primary: link,
    secondary: link,
  }),
});

// ─── content/pages/contact.yaml ──────────────────────────────────────────────

export const contactSchema = z.strictObject({
  meta,
  hero,
  info: z.strictObject({
    label: text,
    title: text,
    officeHoursLabel: text,
    officeHours: text,
  }),
  // 온라인 헌금 안내(선택) — 옛 사이트 「온라인헌금」 쪽. 없으면 칸을 그리지 않는다.
  giving: optional(
    z.strictObject({
      label: text,
      bank: text,
      account: text,
      howTo: text, // 입금자명 적는 법
      codes: z.array(z.strictObject({ name: text, code: text })).default([]),
    }),
  ),
  form: z.strictObject({
    label: text,
    title: text,
    successTitle: text,
    successText: text,
    inquiryTypes: z.array(text).min(1),
  }),
});

// ─── content/pages/privacy.yaml ──────────────────────────────────────────────

export const privacySchema = z.strictObject({
  meta,
  title: text,
  intro: text,
  // 조항 — 문단(paragraphs)과 목록(items) 중 하나 이상
  sections: z
    .array(
      z
        .strictObject({
          title: text,
          paragraphs: z.array(text).default([]),
          items: z.array(text).default([]),
        })
        .refine((s) => s.paragraphs.length + s.items.length > 0, "paragraphs 또는 items 중 하나는 있어야 합니다"),
    )
    .min(1),
  effectiveDate: isoDate,
  // 방문 신청 · 문의 양식의 동의 문구
  consent: z.strictObject({
    visit: text,
    contact: text,
    linkLabel: text,
  }),
});

export type PrivacyPage = z.infer<typeof privacySchema>;
export type HomePage = z.infer<typeof homeSchema>;
export type LocationInfo = z.infer<typeof locationSchema>;
export type AboutPage = z.infer<typeof aboutSchema>;
export type CommunityPage = z.infer<typeof communitySchema>;
export type VisitPage = z.infer<typeof visitSchema>;
export type ServiceTimesPage = z.infer<typeof serviceTimesSchema>;
export type ContactPage = z.infer<typeof contactSchema>;
export type CommunityGroup = CommunityPage["groups"][number];

/** Validate content/pages/<name>.yaml, then substitute {{ }} tokens. */
function loadPage<S extends z.ZodType>(
  name: string,
  schema: S,
  transport: ReadonlyMap<string, string> | null,
): z.output<S> {
  const raw = loadYaml(`pages/${name}.yaml`, schema);
  const problems: string[] = [];
  const out = fillTokens(raw, { site: getSite(), transport }, `content/pages/${name}.yaml`, problems);
  if (problems.length) throw new ContentError(problems);
  return out;
}

// ─── Getters ─────────────────────────────────────────────────────────────────

/** location.yaml — its strings go through the same substitution (without transport tokens). */
export const getLocationInfo = (): LocationInfo => loadPage("location", locationSchema, null);

/** 교통편 id → 문구 (다른 페이지 파일의 {{transport.<id>}}). */
export function transportMap(): ReadonlyMap<string, string> {
  return new Map(getLocationInfo().transport.map((t) => [t.id, t.text]));
}

const page = <S extends z.ZodType>(name: string, schema: S) => (): z.output<S> =>
  loadPage(name, schema, transportMap());

export const getHomePage: () => HomePage = page("home", homeSchema);
export const getAboutPage: () => AboutPage = page("about", aboutSchema);
export const getCommunityPage: () => CommunityPage = page("community", communitySchema);
export const getVisitPage: () => VisitPage = page("visit", visitSchema);
export const getServiceTimesPage: () => ServiceTimesPage = page("service-times", serviceTimesSchema);
export const getContactPage: () => ContactPage = page("contact", contactSchema);
export const getPrivacyPage: () => PrivacyPage = page("privacy", privacySchema);

/** Every page getter — used by validateAllContent(). */
export const PAGE_GETTERS = {
  location: getLocationInfo,
  home: getHomePage,
  about: getAboutPage,
  community: getCommunityPage,
  visit: getVisitPage,
  "service-times": getServiceTimesPage,
  contact: getContactPage,
  privacy: getPrivacyPage,
} as const;

// ─── 연혁 · 교역자 보조 ──────────────────────────────────────────────────────

export { getHistory, getStaff };

/** "1962" → "1962", "1962-08" → "1962.08", "1962-08-08" → "1962.08.08" */
export function formatHistoryDate(date: string): string {
  return date.replaceAll("-", ".");
}

export interface HistoryDecade {
  decade: number; // 1960, 1970 …
  label: string; // "1960년대"
  entries: { date: string; text: string; highlight: boolean }[];
}

/** 연혁을 10년 단위로 묶는다. 최근 연대가 먼저, 연대 안에서는 오래된 순. */
export function groupHistoryByDecade(
  history: ReturnType<typeof getHistory>,
): HistoryDecade[] {
  const map = new Map<number, HistoryDecade>();
  for (const e of history) {
    const decade = Math.floor(Number(e.date.slice(0, 4)) / 10) * 10;
    if (!map.has(decade)) map.set(decade, { decade, label: `${decade}년대`, entries: [] });
    map.get(decade)!.entries.push(e);
  }
  const decades = [...map.values()].sort((a, b) => b.decade - a.decade);
  for (const d of decades) d.entries.sort((a, b) => a.date.localeCompare(b.date));
  return decades;
}
