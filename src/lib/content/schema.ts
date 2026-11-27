import { z } from "zod";

// ─── Primitives ──────────────────────────────────────────────────────────────

// YAML parses unquoted `2026-11-23` into a Date. Normalize both forms to
// "YYYY-MM-DD" so the rest of the app only ever sees strings.
const toIsoDate = (v: unknown) =>
  v instanceof Date && !Number.isNaN(v.getTime()) ? v.toISOString().slice(0, 10) : v;

export const isoDate = z.preprocess(
  toIsoDate,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜는 YYYY-MM-DD 형식이어야 합니다 (예: 2026-11-23)"),
);

// Date with optional time: "2026-12-24" or "2026-12-24T19:30" (KST implied).
const toIsoDateTime = (v: unknown) =>
  v instanceof Date && !Number.isNaN(v.getTime()) ? v.toISOString().slice(0, 16) : v;

export const isoDateTime = z.preprocess(
  toIsoDateTime,
  z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/,
      "일시는 YYYY-MM-DD 또는 YYYY-MM-DDTHH:MM 형식이어야 합니다 (예: 2026-12-24T19:30)",
    ),
);

// Accepts a bare id or any common YouTube URL and stores the 11-char id.
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
export const youtubeId = z.preprocess((v) => {
  if (typeof v !== "string") return v;
  const s = v.trim();
  if (YOUTUBE_ID.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : s;
}, z.string().regex(YOUTUBE_ID, "유튜브 주소 또는 영상 ID(11자)가 올바르지 않습니다"));

// Media key in the photo store (R2), e.g. "albums/2024-05-12-체육대회/001.webp",
// or a site-relative path under /public, e.g. "/images/logo.png".
export const mediaPath = z
  .string()
  .min(1)
  .refine((s) => !/^https?:\/\//.test(s) || s.startsWith("https://"), "외부 주소는 https만 허용합니다");

// Where an item came from on the old site — used for redirects and re-imports.
export const legacySource = z
  .object({
    board: z.string(),
    seq: z.union([z.string(), z.number()]).transform(String),
    url: z.string().optional(),
  })
  .optional();

// ─── Site (content/site.yaml) ────────────────────────────────────────────────

export const SERVICE_ICONS = ["sun", "moon", "heart", "sunrise", "users", "music"] as const;

export const serviceSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "id는 영문 소문자·숫자·하이픈만 씁니다"),
  name: z.string(),
  short: z.string().optional(), // label for the compact home bar
  day: z.string(), // "매주 일요일"
  time: z.string(), // "오전 11:00"
  place: z.string().optional(),
  audience: z.string().optional(),
  icon: z.enum(SERVICE_ICONS),
  description: z.string().optional(),
  details: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  showOnHome: z.boolean().default(true),
});

export const siteSchema = z.object({
  name: z.string(),
  nameEn: z.string(),
  denomination: z.string(),
  pastor: z.string(),
  founded: z.number().int(),
  vision: z.string(),
  description: z.string(),
  address: z.object({
    road: z.string(),
    detail: z.string().optional(),
    mapQuery: z.string(),
  }),
  phone: z.string(),
  fax: z.string().optional(),
  email: z.string().email().optional(),
  sns: z.object({
    youtube: z.string().url().optional(),
    instagram: z.string().url().optional(),
  }),
  mottos: z.array(z.object({ year: z.number().int(), text: z.string(), keyword: z.string() })),
  services: z.array(serviceSchema).min(1),
  specialServices: z
    .array(z.object({ name: z.string(), schedule: z.string(), description: z.string().optional() }))
    .default([]),
});

// ─── Collections (one .md file per item; id = file name) ────────────────────

export const SERMON_KINDS = ["주일예배", "수요예배", "금요기도회", "새벽기도", "특별예배"] as const;

export const sermonSchema = z.object({
  title: z.string(),
  date: isoDate,
  kind: z.enum(SERMON_KINDS).default("주일예배"),
  preacher: z.string().optional(),
  scripture: z.string().optional(),
  series: z.string().optional(),
  youtube: youtubeId.optional(),
  legacy: legacySource,
});

export const praiseSchema = z.object({
  title: z.string(),
  date: isoDate,
  team: z.string().optional(), // 찬양대·팀 이름
  youtube: youtubeId.optional(),
  legacy: legacySource,
});

export const NEWS_CATEGORIES = ["공지", "소식", "간증"] as const;

export const newsSchema = z.object({
  title: z.string(),
  date: isoDate,
  category: z.enum(NEWS_CATEGORIES).default("공지"),
  pinned: z.boolean().default(false),
  images: z.array(mediaPath).default([]),
  legacy: legacySource,
});

export const EVENT_CATEGORIES = ["예배", "교육", "행사", "선교", "기타"] as const;

export const eventSchema = z.object({
  title: z.string(),
  start: isoDateTime,
  end: isoDateTime.optional(),
  category: z.enum(EVENT_CATEGORIES).default("행사"),
  location: z.string().optional(),
  registrationUrl: z.string().url().optional(),
  image: mediaPath.optional(),
});

export const bulletinSchema = z.object({
  date: isoDate,
  title: z.string().optional(),
  pdf: mediaPath.optional(),
  legacy: legacySource,
});

export const ALBUM_CATEGORIES = ["예배", "행사", "수련회", "선교", "교육", "기타"] as const;

export const photoSchema = z.object({
  src: mediaPath,
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  caption: z.string().optional(),
});

export const albumSchema = z.object({
  title: z.string(),
  date: isoDate,
  category: z.enum(ALBUM_CATEGORIES).default("기타"),
  cover: mediaPath.optional(), // defaults to the first photo
  photos: z.array(photoSchema).min(1, "사진이 한 장 이상 있어야 합니다"),
  legacy: legacySource,
});

// ─── Lists (single .yaml file each) ──────────────────────────────────────────

export const historySchema = z.array(
  z.object({
    // "1962", "1962-08", or "1962-08-08" — the old site has all three precisions.
    date: z.preprocess(
      (v) => (typeof v === "number" ? String(v) : toIsoDate(v)),
      z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, "연혁 날짜는 YYYY, YYYY-MM, YYYY-MM-DD 중 하나입니다"),
    ),
    text: z.string(),
    highlight: z.boolean().default(false),
  }),
);

export const staffSchema = z.array(
  z.object({
    name: z.string(),
    role: z.string(), // "담임목사", "부목사", "전도사" …
    group: z.string().optional(), // "교역자", "장로" …
    photo: mediaPath.optional(),
    bio: z.string().optional(),
    // Contact stays off the page unless explicitly published.
    email: z.string().email().optional(),
    phone: z.string().optional(),
    publishContact: z.boolean().default(false),
  }),
);

// ─── Inferred types ──────────────────────────────────────────────────────────

type WithBody<T> = T & { id: string; body: string };

export type Site = z.infer<typeof siteSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Sermon = WithBody<z.infer<typeof sermonSchema>>;
export type Praise = WithBody<z.infer<typeof praiseSchema>>;
export type News = WithBody<z.infer<typeof newsSchema>>;
export type ChurchEvent = WithBody<z.infer<typeof eventSchema>>;
export type Bulletin = WithBody<z.infer<typeof bulletinSchema>>;
export type Album = WithBody<z.infer<typeof albumSchema>>;
export type Photo = z.infer<typeof photoSchema>;
export type HistoryEntry = z.infer<typeof historySchema>[number];
export type StaffMember = z.infer<typeof staffSchema>[number];
