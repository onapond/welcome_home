import { z } from "zod";
import { isMediaPath, isPdfPath } from "@/lib/media";

// ─── Korean error messages ───────────────────────────────────────────────────
//
// Staff read these messages in the build log, so the common cases get plain
// Korean wording; anything else falls back to zod's Korean locale.

const TYPE_NAMES: Record<string, string> = {
  string: "글자로",
  number: "숫자로",
  int: "정수로",
  boolean: "true 또는 false로",
  array: "목록(- 항목)으로",
  object: "「항목: 값」 묶음으로",
};

z.config(z.locales.ko());
z.config({
  customError: (iss) => {
    switch (iss.code) {
      case "invalid_type":
        if (iss.input === undefined) return "필수 항목이 없습니다";
        if (iss.input === null) return "값이 비어 있습니다 (값을 적거나 이 줄을 지워 주세요)";
        return `${TYPE_NAMES[iss.expected] ?? `${iss.expected} 형식으로`} 적어야 합니다`;
      case "too_small":
        if (iss.origin === "string") return "비어 있을 수 없습니다";
        if (iss.origin === "array") return `${iss.minimum}개 이상 있어야 합니다`;
        return undefined;
      case "unrecognized_keys":
        return `알 수 없는 항목 ${iss.keys.map((k) => `'${k}'`).join(", ")} — 오타인지 확인해 주세요`;
      case "invalid_value":
        return `다음 중 하나여야 합니다: ${iss.values.map(String).join(" · ")}`;
      default:
        return undefined;
    }
  },
});

// ─── Primitives ──────────────────────────────────────────────────────────────

/** Required text: surrounding spaces are trimmed and blank is rejected. */
export const text = z.string().trim().min(1);

/** Optional field; a blank YAML value (`key:` → null) counts as "not given". */
export function optional<S extends z.ZodType>(schema: S) {
  return z.preprocess((v) => (v === null ? undefined : v), schema.optional());
}

const optText = optional(text);

/** Rejects repeated values of `key` inside a list (ids become anchors/URLs). */
function uniqueBy<T>(key: (item: T) => string | number, field: string) {
  return (items: T[], ctx: z.RefinementCtx) => {
    const seen = new Set<string | number>();
    items.forEach((item, i) => {
      const k = key(item);
      if (seen.has(k)) {
        ctx.addIssue({ code: "custom", path: [i, field], message: `'${k}'가 이 목록에 두 번 나옵니다 (서로 달라야 합니다)` });
      }
      seen.add(k);
    });
  };
}

export const idString = text.regex(/^[a-z0-9-]+$/, "id는 영문 소문자·숫자·하이픈만 씁니다");

/** Strict list of objects whose `id` must be unique. */
export function idList<S extends z.ZodType<{ id: string }>>(item: S) {
  return z.array(item).superRefine(uniqueBy<z.output<S>>((x) => x.id, "id"));
}

function isRealDate(y: number, m: number, d: number): boolean {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function validDatePart(s: string): boolean {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return isRealDate(y, m, d);
}

// YAML is read with the core schema (see load.ts), so dates arrive as the
// exact text the editor typed — never as a JS Date.
export const isoDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜는 YYYY-MM-DD 형식이어야 합니다 (예: 2026-11-23)")
  .refine(validDatePart, "달력에 없는 날짜입니다");

// Date with optional time, always Korean time (KST). No seconds, no offset.
export const isoDateTime = z
  .string()
  .trim()
  .regex(
    /^\d{4}-\d{2}-\d{2}(T([01]\d|2[0-3]):[0-5]\d)?$/,
    "일시는 YYYY-MM-DD 또는 YYYY-MM-DDTHH:MM(한국 시간, 00:00~23:59) 형식이어야 합니다. 초나 +09:00 같은 시간대는 쓰지 않습니다 (예: 2026-12-24T19:30)",
  )
  .refine(validDatePart, "달력에 없는 날짜입니다");

// Accepts a bare 11-char id or a youtube.com / youtu.be / youtube-nocookie.com
// URL and stores just the id.
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);
const NOCOOKIE_HOSTS = new Set(["youtube-nocookie.com", "www.youtube-nocookie.com"]);

export function parseYoutubeId(input: string): string | null {
  const s = input.trim();
  if (YOUTUBE_ID.test(s)) return s;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.toLowerCase();
  const seg = u.pathname.split("/").filter(Boolean);
  let id: string | null | undefined = null;
  if (host === "youtu.be" && seg.length === 1) id = seg[0];
  else if (YOUTUBE_HOSTS.has(host)) {
    if (seg.length === 1 && seg[0] === "watch") id = u.searchParams.get("v");
    else if (seg.length === 2 && ["embed", "shorts", "live", "v"].includes(seg[0])) id = seg[1];
  } else if (NOCOOKIE_HOSTS.has(host) && seg.length === 2 && seg[0] === "embed") id = seg[1];
  return id && YOUTUBE_ID.test(id) ? id : null;
}

export const youtubeId = z.preprocess(
  (v) => (typeof v === "string" ? (parseYoutubeId(v) ?? v) : v),
  z
    .string()
    .regex(YOUTUBE_ID, "유튜브 주소(youtube.com · youtu.be) 또는 영상 ID(11자)가 올바르지 않습니다"),
);

// Media key in the photo store (R2), e.g. "albums/2024-05-12-sports/001.webp",
// a site path under /public, e.g. "/images/logo.png", or an https:// URL.
export const mediaPath = text.refine(
  isMediaPath,
  "사진·파일 경로는 보관소 경로(예: albums/2026-11-23/001.webp), / 로 시작하는 사이트 경로, https:// 주소 중 하나여야 합니다 (http:// · // 는 쓸 수 없습니다)",
);

export const pdfPath = mediaPath.refine(isPdfPath, "주보 파일은 .pdf 로 끝나는 PDF 경로여야 합니다");

// Where an item came from on the old site — used for redirects and re-imports.
export const legacySource = optional(
  z.strictObject({
    board: text,
    seq: z.union([text, z.number()]).transform(String),
    url: optText,
  }),
);

// ─── Site (content/site.yaml) ────────────────────────────────────────────────

export const SERVICE_ICONS = ["sun", "moon", "heart", "sunrise", "users", "music"] as const;

export const serviceSchema = z.strictObject({
  id: idString,
  name: text,
  short: optText, // label for the compact home bar
  day: text, // "매주 일요일"
  time: text, // "오전 11:00"
  place: optText,
  audience: optText,
  icon: z.enum(SERVICE_ICONS),
  description: optText,
  details: z.array(text).default([]),
  featured: z.boolean().default(false),
  showOnHome: z.boolean().default(true),
});

const httpsUrl = z.url({ protocol: /^https$/, error: "https:// 로 시작하는 주소여야 합니다" });

export const siteSchema = z.strictObject({
  name: text,
  nameEn: text,
  denomination: text,
  pastor: text,
  founded: z.number().int(),
  vision: text,
  description: text,
  address: z.strictObject({
    road: text,
    detail: optText,
    mapQuery: text,
  }),
  phone: text,
  fax: optText,
  email: optional(z.email({ error: "이메일 형식이 올바르지 않습니다" })),
  sns: z.strictObject({
    youtube: optional(httpsUrl),
    instagram: optional(httpsUrl),
  }),
  mottos: z
    .array(z.strictObject({ year: z.number().int(), text, keyword: text }))
    .superRefine(uniqueBy((m) => m.year, "year")),
  services: idList(serviceSchema).min(1),
  specialServices: z
    .array(z.strictObject({ name: text, schedule: text, description: optText }))
    .default([]),
});

// ─── Collections (one .md file per item; id = file name) ────────────────────

export const SERMON_KINDS = ["주일예배", "수요예배", "금요기도회", "새벽기도", "특별예배"] as const;

export const sermonSchema = z.strictObject({
  title: text,
  date: isoDate,
  kind: z.enum(SERMON_KINDS).default("주일예배"),
  preacher: optText,
  scripture: optText,
  series: optText,
  youtube: optional(youtubeId),
  legacy: legacySource,
});

export const praiseSchema = z.strictObject({
  title: text,
  date: isoDate,
  team: optText, // 찬양대·팀 이름
  youtube: optional(youtubeId),
  legacy: legacySource,
});

export const NEWS_CATEGORIES = ["공지", "소식", "간증"] as const;

/** A news photo: either just a path, or { src, alt } with a description. */
export const newsImageSchema = z
  .union([mediaPath, z.strictObject({ src: mediaPath, alt: optText })])
  .transform((v) => (typeof v === "string" ? { src: v, alt: "" } : { src: v.src, alt: v.alt ?? "" }));

export const newsSchema = z.strictObject({
  title: text,
  date: isoDate,
  category: z.enum(NEWS_CATEGORIES).default("공지"),
  pinned: z.boolean().default(false),
  images: z.array(newsImageSchema).default([]),
  legacy: legacySource,
});

export const EVENT_CATEGORIES = ["예배", "교육", "행사", "선교", "기타"] as const;

export const eventSchema = z
  .strictObject({
    title: text,
    start: isoDateTime,
    end: optional(isoDateTime),
    category: z.enum(EVENT_CATEGORIES).default("행사"),
    location: optText,
    registrationUrl: optional(httpsUrl),
    image: optional(mediaPath),
  })
  .superRefine((e, ctx) => {
    if (!e.end) return;
    // Both with time → compare exactly; otherwise compare the dates.
    const bothTimed = e.start.length > 10 && e.end.length > 10;
    const a = bothTimed ? e.start : e.start.slice(0, 10);
    const b = bothTimed ? e.end : e.end.slice(0, 10);
    if (b < a) ctx.addIssue({ code: "custom", path: ["end"], message: "끝나는 일시가 시작 일시보다 앞섭니다" });
  });

export const bulletinSchema = z.strictObject({
  date: isoDate,
  title: optText,
  pdf: optional(pdfPath),
  legacy: legacySource,
});

export const ALBUM_CATEGORIES = ["예배", "행사", "수련회", "선교", "교육", "기타"] as const;

export const photoSchema = z.strictObject({
  src: mediaPath,
  width: optional(z.number().int().positive()),
  height: optional(z.number().int().positive()),
  caption: optText,
});

export const albumSchema = z.strictObject({
  title: text,
  date: isoDate,
  category: z.enum(ALBUM_CATEGORIES).default("기타"),
  cover: optional(mediaPath), // defaults to the first photo
  photos: z.array(photoSchema).min(1, "사진이 한 장 이상 있어야 합니다"),
  legacy: legacySource,
});

// ─── Lists (single .yaml file each) ──────────────────────────────────────────

export const historySchema = z.array(
  z.strictObject({
    // "1962", "1962-08", or "1962-08-08" — the old site has all three precisions.
    date: z.preprocess(
      (v) => (typeof v === "number" ? String(v) : v),
      z
        .string()
        .trim()
        .regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, "연혁 날짜는 YYYY, YYYY-MM, YYYY-MM-DD 중 하나입니다")
        .refine((s) => {
          const [y, m = 1, d = 1] = s.split("-").map(Number);
          return isRealDate(y, m, d);
        }, "달력에 없는 날짜입니다"),
    ),
    text,
    highlight: z.boolean().default(false),
  }),
);

const CONTACT_PRIVACY =
  "publishContact: true 가 없으면 연락처를 적을 수 없습니다. 이 파일은 공개 저장소에 올라가므로 본인이 공개에 동의한 연락처만 적고, 아니면 이 줄을 지워 주세요";

export const staffSchema = z.array(
  z
    .strictObject({
      name: text,
      role: text, // "담임목사", "부목사", "전도사" …
      group: optText, // "교역자", "장로" …
      photo: optional(mediaPath),
      bio: optText,
      // The repo is public: contact may only be written when it is published.
      email: optional(z.email({ error: "이메일 형식이 올바르지 않습니다" })),
      phone: optText,
      publishContact: z.boolean().default(false),
    })
    .superRefine((p, ctx) => {
      if (p.publishContact) return;
      if (p.email) ctx.addIssue({ code: "custom", path: ["email"], message: CONTACT_PRIVACY });
      if (p.phone) ctx.addIssue({ code: "custom", path: ["phone"], message: CONTACT_PRIVACY });
    }),
);

// ─── Inferred types ──────────────────────────────────────────────────────────

type WithBody<T> = T & { id: string; body: string };

export type Site = z.infer<typeof siteSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Sermon = WithBody<z.infer<typeof sermonSchema>>;
export type Praise = WithBody<z.infer<typeof praiseSchema>>;
export type News = WithBody<z.infer<typeof newsSchema>>;
export type NewsImage = z.infer<typeof newsImageSchema>;
export type ChurchEvent = WithBody<z.infer<typeof eventSchema>>;
export type Bulletin = WithBody<z.infer<typeof bulletinSchema>>;
export type Album = WithBody<z.infer<typeof albumSchema>>;
export type Photo = z.infer<typeof photoSchema>;
export type HistoryEntry = z.infer<typeof historySchema>[number];
export type StaffMember = z.infer<typeof staffSchema>[number];
