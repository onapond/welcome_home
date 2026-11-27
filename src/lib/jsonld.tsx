// ──────────────────────────────────────────
// schema.org 구조화 데이터(JSON-LD) — 검색 · AI 검색이 읽는 교회 정보.
// 값은 모두 content/ 파일에서 온다. 확인되지 않은 값(좌표 · 우편번호)은
// site.yaml에 없으면 넣지 않는다.
// ──────────────────────────────────────────

import type { Service, Site } from "@/lib/content/schema";
import { type ImageRef, type Video, videoEmbedUrl, videoThumb } from "@/lib/media";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { kakaoDirectionsUrl, naverMapUrl } from "@/lib/directions";

type Json = Record<string, unknown>;

/** Default share image (src/app/opengraph-image.tsx). */
export const DEFAULT_OG_IMAGE = "/opengraph-image";

export const CHURCH_ID = `${SITE_URL}/#church`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** `<script type="application/ld+json">` with <, > and & escaped so the JSON can never end the tag. */
export function JsonLd({ data }: { data: Json | Json[] }) {
  const html = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: html }} />;
}

// ─── 주소 · 전화 ─────────────────────────────────────────────────────────────

/**
 * "서울특별시 용산구 청파로73길 58" → 시·도 / 시·군·구 / 나머지.
 * 형식이 다르면 도로명 주소 전체를 streetAddress에 둔다.
 */
export function postalAddress(site: Site): Json {
  const tokens = site.address.road.trim().split(/\s+/);
  const split =
    tokens.length >= 3 && /(시|도)$/.test(tokens[0]) && /(시|군|구)$/.test(tokens[1])
      ? { addressRegion: tokens[0], addressLocality: tokens[1], streetAddress: tokens.slice(2).join(" ") }
      : { streetAddress: site.address.road };
  return {
    "@type": "PostalAddress",
    ...split,
    ...(site.address.postalCode ? { postalCode: site.address.postalCode } : {}),
    addressCountry: "KR",
  };
}

/** "02-714-0041~3" → "+82-2-714-0041" (대표번호 묶음의 첫 번호) */
export function internationalPhone(phone: string): string {
  const first = (phone.split(/[~,/]/)[0] ?? phone).trim();
  return /^0\d/.test(first) ? `+82-${first.slice(1)}` : first;
}

// ─── 예배 → Event + Schedule ─────────────────────────────────────────────────

const DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const DAY_URLS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
  (d) => `https://schema.org/${d}`,
);

/** "매주 일요일" → [일], "월요일 ~ 토요일" → [월…토], "매일" → 7일. 못 읽으면 []. */
export function serviceDays(day: string): string[] {
  if (/매일/.test(day)) return DAY_URLS;
  const range = /([일월화수목금토])요일\s*[~\-–]\s*([일월화수목금토])요일/.exec(day);
  if (range) {
    const a = DAYS.indexOf(range[1] as (typeof DAYS)[number]);
    const b = DAYS.indexOf(range[2] as (typeof DAYS)[number]);
    const out: string[] = [];
    for (let i = a; ; i = (i + 1) % 7) {
      out.push(DAY_URLS[i]);
      if (i === b) break;
    }
    return out;
  }
  return [...day.matchAll(/([일월화수목금토])요일/g)].map((m) => DAY_URLS[DAYS.indexOf(m[1] as (typeof DAYS)[number])]);
}

/** "오전 11:00" → "11:00", "오후 7:30" → "19:30". 못 읽으면 null. */
export function serviceStartTime(time: string): string | null {
  const m = /(오전|오후)?\s*(\d{1,2})(?::|시\s*)(\d{2})?/.exec(time);
  if (!m) return null;
  let h = Number(m[2]);
  const min = m[3] ?? "00";
  if (h > 23 || Number(min) > 59) return null;
  if (m[1] === "오후" && h < 12) h += 12;
  if (m[1] === "오전" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}

function serviceEvent(site: Site, s: Service): Json | null {
  const byDay = serviceDays(s.day);
  const startTime = serviceStartTime(s.time);
  if (!byDay.length || !startTime) return null;
  return {
    "@type": "Event",
    name: s.name,
    ...(s.description ? { description: s.description } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventSchedule: {
      "@type": "Schedule",
      byDay,
      startTime,
      repeatFrequency: "P1W",
      scheduleTimezone: "Asia/Seoul",
    },
    location: {
      "@type": "Place",
      name: s.place ? `${site.name} ${s.place}` : site.name,
      address: postalAddress(site),
    },
    organizer: { "@id": CHURCH_ID },
  };
}

// ─── 교회 · 웹사이트 ─────────────────────────────────────────────────────────

/** 홈의 Church — 정기 예배는 Event(eventSchedule)로 단다. */
export function churchJsonLd(site: Site): Json {
  const sameAs = [site.sns.youtube, site.sns.instagram].filter((v): v is string => !!v);
  const events = site.services.map((s) => serviceEvent(site, s)).filter((e): e is Json => !!e);
  return {
    "@context": "https://schema.org",
    "@type": "Church",
    "@id": CHURCH_ID,
    name: site.name,
    alternateName: site.nameEn,
    description: site.description,
    url: SITE_URL,
    logo: absoluteUrl("/images/logo-mark.png"),
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    foundingDate: String(site.founded),
    telephone: internationalPhone(site.phone),
    ...(site.fax ? { faxNumber: internationalPhone(site.fax) } : {}),
    ...(site.email ? { email: site.email } : {}),
    address: postalAddress(site),
    ...(site.geo
      ? { geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng } }
      : {}),
    hasMap: [kakaoDirectionsUrl(site), naverMapUrl(site)],
    ...(sameAs.length ? { sameAs } : {}),
    ...(events.length ? { event: events } : {}),
  };
}

/** 모든 페이지의 WebSite */
export function websiteJsonLd(site: Site): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    alternateName: site.nameEn,
    url: SITE_URL,
    inLanguage: "ko-KR",
    publisher: { "@type": "Church", "@id": CHURCH_ID, name: site.name },
  };
}

// ─── 상세 페이지 ─────────────────────────────────────────────────────────────

/** 홈 › 목록 › 글 — `path`는 /로 시작하는 경로 */
export function breadcrumbJsonLd(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** 설교 · 영상 상세의 VideoObject. 표지가 없으면(비메오) 기본 공유 이미지. */
export function videoJsonLd(v: {
  name: string;
  description?: string;
  date: string;
  video: Video;
  thumbnail?: ImageRef;
}): Json {
  const thumb = videoThumb(v.video, v.thumbnail, "full") ?? DEFAULT_OG_IMAGE;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.name,
    description: v.description || v.name,
    thumbnailUrl: absoluteUrl(thumb),
    uploadDate: `${v.date}T00:00:00+09:00`,
    embedUrl: videoEmbedUrl(v.video),
  };
}

/** 새가족 FAQ */
export function faqJsonLd(items: { question: string; answer: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
}
