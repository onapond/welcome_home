import { z } from "zod";
import { ICON_KEYS } from "@/lib/icons";
import { fullAddress, latestMotto } from "@/lib/site-summary";
import { ContentError, loadYaml } from "./load";
import { mediaPath, type Service, type Site } from "./schema";
import { getHistory, getSite, getStaff } from "./index";

// ─── 공통 조각 ───────────────────────────────────────────────────────────────

const icon = z.enum(ICON_KEYS);
const link = z.object({ label: z.string(), href: z.string() });
const lines = z.array(z.string()).min(1); // 줄바꿈 단위로 나눠 적는 문구
const meta = z.object({
  title: z.string(),
  description: z.string(),
  ogDescription: z.string().optional(),
});
const hero = z.object({ badge: z.string(), title: z.string(), lines });
const sectionLabel = z.object({ label: z.string(), title: z.string() });

// ─── content/pages/home.yaml ─────────────────────────────────────────────────

export const homeSchema = z.object({
  hero: z.object({
    badge: z.string(),
    headline: z.string(),
    lines,
    primaryCta: link,
    secondaryCta: link,
    // 슬라이드 배경 사진. image를 비우면 「사진 준비 중」 자리표시가 나온다.
    slides: z.array(z.object({ label: z.string(), image: mediaPath.optional() })).min(1),
  }),
  journey: z.object({
    label: z.string(),
    title: z.string(),
    // 표어(site.yaml mottos)와 연도로 짝지어진다.
    nodes: z.array(z.object({ year: z.number().int(), subtitle: z.string(), icon })),
  }),
  newHere: z.object({
    label: z.string(),
    title: z.string(),
    intro: z.string(),
    items: z.array(z.object({ icon, title: z.string(), text: z.string() })),
    cta: link,
    image: z.object({ label: z.string(), src: mediaPath.optional() }),
    badge: z.object({ label: z.string(), text: z.string() }),
    quote: z.object({ year: z.number().int(), caption: z.string() }),
  }),
  community: z.object({ label: z.string(), title: z.string(), linkLabel: z.string() }),
});

// ─── content/pages/location.yaml ─────────────────────────────────────────────

export const locationSchema = z.object({
  label: z.string(),
  mapButton: z.string(),
  transport: z.array(z.object({ id: z.string(), icon, label: z.string(), text: z.string() })),
});

// ─── content/pages/about.yaml ────────────────────────────────────────────────

export const aboutSchema = z.object({
  meta,
  hero,
  vision: z.object({
    label: z.string(),
    title: z.string(),
    intro: z.string(),
    items: z.array(z.object({ icon, title: z.string(), text: z.string() })),
  }),
  pastor: z.object({
    label: z.string(),
    roleLine: z.string(),
    photo: mediaPath.optional(),
    bioLabel: z.string(),
    bio: z.string(),
    career: z.array(z.object({ label: z.string(), value: z.string() })),
    quote: z.object({ text: z.string(), by: z.string() }),
  }),
  history: z.object({
    label: z.string(),
    title: z.string(),
    allLabel: z.string(),
  }),
  beliefs: z.object({
    label: z.string(),
    title: z.string(),
    intro: z.string(),
    items: z.array(z.object({ title: z.string(), text: z.string() })),
  }),
  staff: sectionLabel,
});

// ─── content/pages/community.yaml ────────────────────────────────────────────

export const GROUP_COLORS = ["primary", "secondary", "accent", "primary-light"] as const;

export const communitySchema = z.object({
  meta,
  hero,
  groups: z.array(
    z.object({
      id: z.string().regex(/^[a-z0-9-]+$/, "id는 영문 소문자·숫자·하이픈만 씁니다"),
      label: z.string(),
      title: z.string(),
      subtitle: z.string(),
      summary: z.string(), // 홈 카드용 한 줄 소개
      tag: z.string(), // 홈 카드 우하단 배지
      showOnHome: z.boolean().default(true),
      description: z.string(),
      tags: z.array(z.string()).default([]),
      color: z.enum(GROUP_COLORS).default("primary"),
      image: mediaPath.optional(),
      details: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
      showSnsLinks: z.boolean().default(false), // site.yaml의 인스타그램 · 유튜브 버튼
    }),
  ),
  cta: z.object({
    label: z.string(),
    title: z.string(),
    text: z.string(),
    primary: link,
    secondary: link,
  }),
});

// ─── content/pages/visit.yaml ────────────────────────────────────────────────

export const visitSchema = z.object({
  meta,
  hero,
  faq: z.object({
    label: z.string(),
    title: z.string(),
    items: z.array(z.object({ question: z.string(), answer: z.string() })),
  }),
  services: sectionLabel,
  reservation: z.object({
    label: z.string(),
    title: z.string(),
    intro: z.string(),
    successMessage: z.string(),
    submitLabel: z.string(),
  }),
});

// ─── content/pages/service-times.yaml ────────────────────────────────────────

export const serviceTimesSchema = z.object({
  meta,
  hero,
  regular: sectionLabel,
  special: sectionLabel,
  cta: z.object({
    title: z.string(),
    lines,
    primary: link,
    secondary: link,
  }),
});

// ─── content/pages/contact.yaml ──────────────────────────────────────────────

export const contactSchema = z.object({
  meta,
  hero,
  info: z.object({
    label: z.string(),
    title: z.string(),
    officeHoursLabel: z.string(),
    officeHours: z.string(),
  }),
  form: z.object({
    label: z.string(),
    title: z.string(),
    successTitle: z.string(),
    successText: z.string(),
    inquiryTypes: z.array(z.string()).min(1),
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
// 한 곳(site.yaml)만 고치면 모든 문구가 따라온다.
//
//   {{phone}} {{fax}} {{email}} {{name}} {{pastor}} {{denomination}} {{founded}}
//   {{address}}            도로명 (상세)
//   {{address.road}}       {{sns.youtube}}  {{sns.instagram}}
//   {{service.sunday.time}} 예배 id.항목(name day time place audience)
//   {{motto.latest.text}}  {{motto.latest.year}}   가장 최근 표어
//   {{motto.2024}}         해당 연도 표어
//   {{transport.subway}}   location.yaml 교통편 id

type Ctx = { site: Site; transport: Record<string, string>; file: string };

function resolveToken(token: string, ctx: Ctx): string | undefined {
  const { site } = ctx;
  const parts = token.split(".");

  if (token === "address") return fullAddress(site.address);

  if (parts[0] === "service" && parts.length === 3) {
    const svc = site.services.find((s: Service) => s.id === parts[1]);
    const value = svc?.[parts[2] as keyof Service];
    return typeof value === "string" ? value : undefined;
  }
  if (parts[0] === "motto" && parts.length >= 2) {
    if (parts[1] === "latest") {
      const m = latestMotto(site);
      return m && parts[2] ? String(m[parts[2] as "year" | "text" | "keyword"]) : undefined;
    }
    return site.mottos.find((m) => String(m.year) === parts[1])?.text;
  }
  if (parts[0] === "transport" && parts.length === 2) return ctx.transport[parts[1]];

  let cur: unknown = site;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) cur = (cur as Record<string, unknown>)[p];
    else return undefined;
  }
  return typeof cur === "string" || typeof cur === "number" ? String(cur) : undefined;
}

function fillDeep<T>(value: T, ctx: Ctx, problems: string[], path = ""): T {
  if (typeof value === "string") {
    return value.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (whole, token: string) => {
      const out = resolveToken(token, ctx);
      if (out === undefined) {
        problems.push(`${ctx.file} → ${path || "(문구)"}: 알 수 없는 자리표시 ${whole}`);
        return whole;
      }
      return out;
    }) as T;
  }
  if (Array.isArray(value)) {
    return value.map((v, i) => fillDeep(v, ctx, problems, `${path}[${i}]`)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, fillDeep(v, ctx, problems, path ? `${path}.${k}` : k)]),
    ) as T;
  }
  return value;
}

function transportMap(): Record<string, string> {
  const loc = loadYaml("pages/location.yaml", locationSchema);
  return Object.fromEntries(loc.transport.map((t) => [t.id, t.text]));
}

function loadPage<S extends z.ZodType>(name: string, schema: S): z.output<S> {
  const raw = loadYaml(`pages/${name}.yaml`, schema);
  const problems: string[] = [];
  const out = fillDeep(raw, { site: getSite(), transport: transportMap(), file: `content/pages/${name}.yaml` }, problems);
  if (problems.length) throw new ContentError(problems);
  return out;
}

// ─── Getters ─────────────────────────────────────────────────────────────────

export const getHomePage = (): HomePage => loadPage("home", homeSchema);
export const getAboutPage = (): AboutPage => loadPage("about", aboutSchema);
export const getCommunityPage = (): CommunityPage => loadPage("community", communitySchema);
export const getVisitPage = (): VisitPage => loadPage("visit", visitSchema);
export const getServiceTimesPage = (): ServiceTimesPage => loadPage("service-times", serviceTimesSchema);
export const getContactPage = (): ContactPage => loadPage("contact", contactSchema);
export const getLocationInfo = (): LocationInfo => loadYaml("pages/location.yaml", locationSchema);

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
