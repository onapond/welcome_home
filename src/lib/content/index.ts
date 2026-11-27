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
  type Album,
  type Bulletin,
  type ChurchEvent,
  type HistoryEntry,
  type News,
  type Praise,
  type Sermon,
  type Site,
  type StaffMember,
} from "./schema";

export * from "./schema";
export { ContentError } from "./load";

// ─── Single files ────────────────────────────────────────────────────────────

export const getSite = (): Site => loadYaml("site.yaml", siteSchema);
export const getHistory = (): HistoryEntry[] => loadYaml("history.yaml", historySchema);
export const getStaff = (): StaffMember[] => loadYaml("staff.yaml", staffSchema);

// ─── Collections (newest first) ──────────────────────────────────────────────

export const getSermons = (): Sermon[] => loadCollection("sermons", sermonSchema, (s) => s.date);
export const getPraise = (): Praise[] => loadCollection("praise", praiseSchema, (p) => p.date);
export const getBulletins = (): Bulletin[] => loadCollection("bulletins", bulletinSchema, (b) => b.date);
export const getAlbums = (): Album[] => loadCollection("albums", albumSchema, (a) => a.date);
export const getEvents = (): ChurchEvent[] => loadCollection("events", eventSchema, (e) => e.start);

/** Pinned items first, then newest. */
export function getNews(): News[] {
  const all = loadCollection("news", newsSchema, (n) => n.date);
  return [...all.filter((n) => n.pinned), ...all.filter((n) => !n.pinned)];
}

export const findById = <T extends { id: string }>(items: T[], id: string): T | undefined =>
  items.find((i) => i.id === id);

/** Events that have not ended yet, soonest first. `today` is "YYYY-MM-DD" (KST). */
export function getUpcomingEvents(today: string): ChurchEvent[] {
  return getEvents()
    .filter((e) => (e.end ?? e.start).slice(0, 10) >= today)
    .reverse();
}
