import type { ImageRef } from "@/lib/media";
import { loadCollection, loadYaml } from "./load";
import {
  albumSchema,
  bulletinSchema,
  eventSchema,
  historySchema,
  newsSchema,
  praiseSchema,
  sermonSchema,
  siteSchema,
  staffSchema,
  videoPostSchema,
  type Album,
  type Bulletin,
  type ChurchEvent,
  type HistoryEntry,
  type News,
  type Praise,
  type Sermon,
  type Site,
  type StaffMember,
  type VideoPost,
} from "./schema";

export * from "./schema";
export { ContentError } from "./load";

// ─── Single files ────────────────────────────────────────────────────────────

export const getSite = (): Site => loadYaml("site.yaml", siteSchema);
export const getHistory = (): HistoryEntry[] => loadYaml("history.yaml", historySchema);
export const getStaff = (): StaffMember[] => loadYaml("staff.yaml", staffSchema);

// ─── Collections (newest first) ──────────────────────────────────────────────

export const getSermons = (): Sermon[] => loadCollection("sermons", sermonSchema, (s) => s.date, ["praise"]);
export const getPraise = (): Praise[] => loadCollection("praise", praiseSchema, (p) => p.date);
export const getBulletins = (): Bulletin[] => loadCollection("bulletins", bulletinSchema, (b) => b.date);
export const getAlbums = (): Album[] => loadCollection("albums", albumSchema, (a) => a.date);
export const getEvents = (): ChurchEvent[] => loadCollection("events", eventSchema, (e) => e.start);
export const getVideos = (): VideoPost[] => loadCollection("videos", videoPostSchema, (v) => v.date);

/** Pinned items first, then newest. */
export function getNews(): News[] {
  const all = loadCollection("news", newsSchema, (n) => n.date, ["bulletin", "gallery", "videos", "calendar"]);
  return [...all.filter((n) => n.pinned), ...all.filter((n) => !n.pinned)];
}

/**
 * An album's cover: `cover:` when given, else the first photo. A cover written
 * as a bare path that is one of the album's photos borrows that photo's `thumb`.
 */
export function albumCover(a: Album): ImageRef {
  const cover = a.cover ?? a.photos[0];
  if (cover.thumb) return cover;
  const same = a.photos.find((p) => p.src === cover.src);
  return same?.thumb ? { src: cover.src, thumb: same.thumb } : { src: cover.src };
}

export const findById = <T extends { id: string }>(items: T[], id: string): T | undefined =>
  items.find((i) => i.id === id);

/** Events that have not ended yet, soonest first. `today` is "YYYY-MM-DD" (KST). */
export function getUpcomingEvents(today: string): ChurchEvent[] {
  return getEvents()
    .filter((e) => (e.end ?? e.start).slice(0, 10) >= today)
    .reverse();
}
