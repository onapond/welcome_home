import { z } from "zod";
import { ICON_KEYS } from "@/lib/icons";
import { ContentError, loadYaml } from "./load";
import { idList, idString, mediaPath, optional, text, type Site } from "./schema";
import { fullAddress, latestMotto } from "./site-format";
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
  mapButton: text,
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
  form: z.strictObject({
    label: text,
    title: text,
    successTitle: text,
    successText: text,
    inquiryTypes: z.array(text).min(1),
  }),
});

export type HomePage = z.infer<typeof homeSchema>;
export type LocationInfo = z.infer<typeof locationSchema>;
export type AboutPage = z.infer<typeof aboutSchema>;
export type CommunityPage = z.infer<typeof communitySchema>;
export type VisitPage = z.infer<typeof visitSchema>;
export type ServiceTimesPage = z.infer<typeof serviceTimesSchema>;
export type ContactPage = z.infer<typeof contactSchema>;
export type CommunityGroup = CommunityPage["groups"][number];

// ─── {{자리표시}} 치환 ───────────────────────────────────────────────────────
//
// 페이지 파일의 문구 안에서 교회 정보를 {{ }}로 부를 수 있다. 정보가 바뀌어도
// 한 곳(site.yaml)만 고치면 모든 문구가 따라온다. 직원용 목록은
// content/README.md 「자리표시」 절에 있다 — 여기를 바꾸면 그 표도 고친다.
//
//   {{name}} {{nameEn}} {{denomination}} {{pastor}} {{founded}} {{vision}}
//   {{description}} {{phone}} {{fax}} {{email}}
//   {{address}} (도로명 (상세))  {{address.road}}  {{address.detail}}
//   {{sns.youtube}}  {{sns.instagram}}
//   {{service.<예배 id>.<name|short|day|time|place|audience>}}
//   {{motto.latest.<year|text|keyword>}}  {{motto.<연도>}}
//   {{transport.<교통편 id>}}  (location.yaml 교통편 — location.yaml 안에서는 못 씀)
//
// 모르는 이름이나 값이 비어 있는 항목을 부르면 파일 · 위치와 함께 빌드가 멈춘다.

type Ctx = { site: Site; transport: Record<string, string> | null };
type Resolved = { value: string } | { problem: string };

const SITE_TOKENS = [
  "name",
  "nameEn",
  "denomination",
  "pastor",
  "founded",
  "vision",
  "description",
  "phone",
  "fax",
  "email",
] as const;
const SERVICE_FIELDS = ["name", "short", "day", "time", "place", "audience"] as const;
const MOTTO_FIELDS = ["year", "text", "keyword"] as const;

const UNKNOWN: Resolved = { problem: "알 수 없는 자리표시입니다 (content/README.md의 자리표시 목록 참고)" };

function has<T extends string>(list: readonly T[], v: string | undefined): v is T {
  return v !== undefined && (list as readonly string[]).includes(v);
}

function present(v: string | number | undefined, where: string): Resolved {
  return v === undefined || v === "" ? { problem: `${where} 값이 비어 있습니다` } : { value: String(v) };
}

function resolveToken(token: string, ctx: Ctx): Resolved {
  const { site } = ctx;
  const parts = token.split(".");
  const [head, a, b] = parts;

  switch (head) {
    case "address":
      if (parts.length === 1) return { value: fullAddress(site.address) };
      if (parts.length === 2 && (a === "road" || a === "detail")) {
        return present(site.address[a], `site.yaml의 address.${a}`);
      }
      return UNKNOWN;
    case "sns":
      if (parts.length === 2 && (a === "youtube" || a === "instagram")) {
        return present(site.sns[a], `site.yaml의 sns.${a}`);
      }
      return UNKNOWN;
    case "service": {
      if (parts.length !== 3 || !has(SERVICE_FIELDS, b)) return UNKNOWN;
      const svc = site.services.find((s) => s.id === a);
      if (!svc) return { problem: `site.yaml에 id가 '${a}'인 예배가 없습니다` };
      return present(svc[b], `site.yaml 예배 '${a}'의 ${b}`);
    }
    case "motto": {
      if (parts.length === 3 && a === "latest" && has(MOTTO_FIELDS, b)) {
        const m = latestMotto(site);
        return m ? present(m[b], "site.yaml의 mottos") : { problem: "site.yaml에 표어(mottos)가 없습니다" };
      }
      if (parts.length === 2 && /^\d{4}$/.test(a)) {
        const m = site.mottos.find((x) => String(x.year) === a);
        return m ? { value: m.text } : { problem: `site.yaml에 ${a}년 표어가 없습니다` };
      }
      return UNKNOWN;
    }
    case "transport": {
      if (parts.length !== 2) return UNKNOWN;
      if (!ctx.transport) return { problem: "location.yaml 안에서는 {{transport.…}}를 쓸 수 없습니다" };
      const t = ctx.transport[a];
      return t === undefined ? { problem: `location.yaml에 id가 '${a}'인 교통편이 없습니다` } : { value: t };
    }
    default:
      if (parts.length === 1 && has(SITE_TOKENS, head)) return present(site[head], `site.yaml의 ${head}`);
      return UNKNOWN;
  }
}

function fillDeep<T>(value: T, ctx: Ctx, file: string, problems: string[], path = ""): T {
  if (typeof value === "string") {
    return value.replace(/\{\{\s*([^}]*?)\s*\}\}/g, (whole, token: string) => {
      const out = resolveToken(token, ctx);
      if ("problem" in out) {
        problems.push(`${file} → ${path || "(문구)"}: ${whole} — ${out.problem}`);
        return whole;
      }
      return out.value;
    }) as T;
  }
  if (Array.isArray(value)) {
    return value.map((v, i) => fillDeep(v, ctx, file, problems, `${path}.${i}`.replace(/^\./, ""))) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, fillDeep(v, ctx, file, problems, path ? `${path}.${k}` : k)]),
    ) as T;
  }
  return value;
}

/** Validate content/pages/<name>.yaml, then substitute {{ }} tokens. */
function loadPage<S extends z.ZodType>(
  name: string,
  schema: S,
  transport: Record<string, string> | null,
): z.output<S> {
  const raw = loadYaml(`pages/${name}.yaml`, schema);
  const problems: string[] = [];
  const out = fillDeep(raw, { site: getSite(), transport }, `content/pages/${name}.yaml`, problems);
  if (problems.length) throw new ContentError(problems);
  return out;
}

// ─── Getters ─────────────────────────────────────────────────────────────────

/** location.yaml — its strings go through the same substitution (without transport tokens). */
export const getLocationInfo = (): LocationInfo => loadPage("location", locationSchema, null);

function transportMap(): Record<string, string> {
  return Object.fromEntries(getLocationInfo().transport.map((t) => [t.id, t.text]));
}

const page = <S extends z.ZodType>(name: string, schema: S) => (): z.output<S> =>
  loadPage(name, schema, transportMap());

export const getHomePage: () => HomePage = page("home", homeSchema);
export const getAboutPage: () => AboutPage = page("about", aboutSchema);
export const getCommunityPage: () => CommunityPage = page("community", communitySchema);
export const getVisitPage: () => VisitPage = page("visit", visitSchema);
export const getServiceTimesPage: () => ServiceTimesPage = page("service-times", serviceTimesSchema);
export const getContactPage: () => ContactPage = page("contact", contactSchema);

/** Every page getter — used by validateAllContent(). */
export const PAGE_GETTERS = {
  location: getLocationInfo,
  home: getHomePage,
  about: getAboutPage,
  community: getCommunityPage,
  visit: getVisitPage,
  "service-times": getServiceTimesPage,
  contact: getContactPage,
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
