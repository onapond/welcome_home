import { sanityClient } from "./client";
import type { Sermon, SermonSeries, ChurchEvent, Bulletin, Post, Gallery } from "./types";

/** Sanity가 미설정일 때 빈 결과를 반환하는 safe fetch 래퍼 */
async function safeFetch<T>(query: string, params: Record<string, unknown> = {}, fallback: T): Promise<T> {
  try {
    const result = await sanityClient.fetch<T>(query, params);
    return result ?? fallback;
  } catch {
    // Sanity 미설정(projectId 없음) 또는 네트워크 오류 시 fallback 반환
    return fallback;
  }
}

// ─── Sermon ──────────────────────────────────────────────────────────────────

const SERMON_FIELDS = `
  _id, title, date, preacher, scripture, youtubeId, summary,
  "series": series->{ _id, title },
  "thumbnail": thumbnail{ ..., "url": asset->url }
`;

/** 최신 설교 N개 */
export async function getLatestSermons(limit = 5): Promise<Sermon[]> {
  return safeFetch(
    `*[_type == "sermon"] | order(date desc) [0...$limit] { ${SERMON_FIELDS} }`,
    { limit: limit - 1 },
    []
  );
}

/** 전체 설교 (아카이브) */
export async function getAllSermons(): Promise<Sermon[]> {
  return safeFetch(
    `*[_type == "sermon"] | order(date desc) { ${SERMON_FIELDS} }`,
    {},
    []
  );
}

/** 특정 시리즈 설교 */
export async function getSermonsBySeries(seriesId: string): Promise<Sermon[]> {
  return safeFetch(
    `*[_type == "sermon" && series._ref == $seriesId] | order(date desc) { ${SERMON_FIELDS} }`,
    { seriesId },
    []
  );
}

/** 전체 설교 시리즈 */
export async function getAllSermonSeries(): Promise<SermonSeries[]> {
  return safeFetch(
    `*[_type == "sermonSeries"] | order(startDate desc) {
      _id, title, description, startDate, endDate,
      "thumbnail": thumbnail{ ..., "url": asset->url }
    }`,
    {},
    []
  );
}

// ─── Event ───────────────────────────────────────────────────────────────────

/** 다가오는 행사 N개 */
export async function getUpcomingEvents(limit = 5): Promise<ChurchEvent[]> {
  return safeFetch(
    `*[_type == "event" && date >= now()] | order(date asc) [0...$limit] {
      _id, title, category, date, endDate, location, registrationUrl,
      "imageUrl": image.asset->url
    }`,
    { limit: limit - 1 },
    []
  );
}

/** 전체 행사 */
export async function getAllEvents(): Promise<ChurchEvent[]> {
  return safeFetch(
    `*[_type == "event"] | order(date desc) {
      _id, title, category, date, endDate, location, registrationUrl,
      "imageUrl": image.asset->url
    }`,
    {},
    []
  );
}

// ─── Bulletin ────────────────────────────────────────────────────────────────

/** 최신 주보 1개 */
export async function getLatestBulletin(): Promise<Bulletin | null> {
  return safeFetch(
    `*[_type == "bulletin"] | order(date desc) [0] {
      _id, date, announcements,
      "pdfUrl": pdfFile.asset->url
    }`,
    {},
    null
  );
}

/** 주보 목록 */
export async function getAllBulletins(): Promise<Bulletin[]> {
  return safeFetch(
    `*[_type == "bulletin"] | order(date desc) {
      _id, date,
      "pdfUrl": pdfFile.asset->url
    }`,
    {},
    []
  );
}

// ─── Post ────────────────────────────────────────────────────────────────────

/** 전체 게시글 */
export async function getAllPosts(category?: string): Promise<Post[]> {
  const query = category
    ? `*[_type == "post" && category == $category] | order(date desc) { _id, title, slug, category, date, featured }`
    : `*[_type == "post"] | order(date desc) { _id, title, slug, category, date, featured }`;
  return safeFetch(query, category ? { category } : {}, []);
}

/** 게시글 단건 by slug */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  return safeFetch(
    `*[_type == "post" && slug.current == $slug][0] {
      _id, title, slug, category, date, featured, body,
      "images": images[]{ ..., "url": asset->url }
    }`,
    { slug },
    null
  );
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

/** 갤러리 목록 */
export async function getAllGalleries(): Promise<Gallery[]> {
  return safeFetch(
    `*[_type == "gallery"] | order(date desc) {
      _id, title, date, category, description,
      "images": images[]{
        caption,
        "image": image{ ..., "url": asset->url }
      }
    }`,
    {},
    []
  );
}
