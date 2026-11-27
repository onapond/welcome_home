import { getAlbums, getBulletins, getNews, getSermons, getVideos } from "@/lib/content";

// ──────────────────────────────────────────
// Old chungpa21.org addresses (/modu/…asp?…) → pages on this site.
// Posts are matched by the `legacy: { board, seq, url }` the migration wrote
// into each content file, so a post keeps its old link after the DNS switch.
// ──────────────────────────────────────────

export interface LegacyTarget {
  /** Always a path on this site (starts with a single "/"), never another host. */
  to: string;
  /** 308 when the old page has a definite new home; 302 for a best guess. */
  permanent: boolean;
}

interface Board {
  list: string;
  /** Detail page for a migrated post, or null when the board has none here. */
  detail: ((id: string) => string) | null;
}

const BOARDS = new Map<string, Board>(Object.entries({
  media_1: { list: "/sermons", detail: (id: string) => `/sermons/${id}` }, // 주일예배
  media_2: { list: "/sermons", detail: (id: string) => `/sermons/${id}` }, // 금요예배
  media_3: { list: "/sermons/praise", detail: null }, // 찬양 — list only (videos open on YouTube)
  s_board_1: { list: "/news/gallery", detail: (id: string) => `/news/gallery/${id}` }, // 청파앨범
  s_board_2: { list: "/visit", detail: null }, // 새가족소개 — not migrated
  s_board_3: { list: "/news/videos", detail: (id: string) => `/news/videos/${id}` }, // 특별영상
  s_board_4: { list: "/contact", detail: null }, // 중보기도 — not migrated; requests now go through the form
  s_board_5: { list: "/news", detail: null }, // 교회 일정 — kept in content/events, no page yet
  s_board_6: { list: "/news", detail: (id: string) => `/news/${id}` }, // 교회소식
} satisfies Record<string, Board>));

// document_view.asp?uotc=… (menu pages)
const DOCUMENTS = new Map<string, string>([
  ["33018", "/about"], // 소개 및 비전
  ["33021", "/visit/service-times"], // 예배시간
  ["33020", "/visit#location"], // 오시는길
  ["33019", "/contact"], // 온라인헌금 — no giving page yet
]);

// Other old menu pages, by lower-cased path after /modu/.
const PAGES = new Map<string, string>([
  ["history/history_main.asp", "/about#history"],
  ["info/steward/steward_prepare.asp", "/about#staff"],
  ["worship/worship_view.asp", "/visit/service-times"],
  ["schedule/_html/index.asp", "/news"],
  ["privacy/privacy.asp", "/privacy"],
]);

interface Index {
  /** "media_1:228" → "/sermons/2019-03-03" */
  posts: Map<string, string>;
  /** "2025-10-1" (year-month-week) → first bulletin of that week */
  weeks: Map<string, string>;
}

let cached: Index | null = null;

function buildIndex(): Index {
  const posts = new Map<string, string>();
  for (const item of [...getSermons(), ...getAlbums(), ...getVideos(), ...getNews()]) {
    const detail = item.legacy && BOARDS.get(item.legacy.board)?.detail;
    if (item.legacy && detail) posts.set(`${item.legacy.board}:${item.legacy.seq}`, detail(item.id));
  }

  // Several bulletins (e.g. three PDFs in one week) share one old weekly URL:
  // it goes to the first of them by id, whose page sits beside the others.
  const weeks = new Map<string, string>();
  const bulletins = [...getBulletins()].sort((a, b) => a.id.localeCompare(b.id));
  for (const b of bulletins) {
    const key = bulletinWeekKey(b);
    if (key && !weeks.has(key)) weeks.set(key, `/news/bulletin/${b.id}`);
  }
  return { posts, weeks };
}

const index = (): Index => (cached ??= buildIndex());

/**
 * A `legacy.url` read against the old site, so a host-less "/modu/…" works
 * too. A value that is not a URL at all is skipped (that one bulletin has no
 * old link) instead of breaking the lookup for every other post.
 */
export function oldSiteUrl(value: string): URL | null {
  try {
    return new URL(value, "http://www.chungpa21.org/");
  } catch {
    return null;
  }
}

/**
 * The old weekly page a bulletin came from, as "year-month-week", or null.
 * The redirect and the bulletin page's 「이 주의 주보」 group by this same key.
 */
export function bulletinWeekKey(b: { legacy?: { url?: string } }): string | null {
  const url = b.legacy?.url ? oldSiteUrl(b.legacy.url) : null;
  return (url && weekKey(url.searchParams)) || null;
}

/** Query values by lower-cased name (old IIS links mix case), trimmed. */
function params(search: URLSearchParams): (name: string) => string | undefined {
  const map = new Map<string, string>();
  for (const [k, v] of search) {
    const key = k.toLowerCase();
    if (!map.has(key)) map.set(key, v.trim());
  }
  return (name) => map.get(name);
}

/** A positive whole number without leading zeros, or undefined. */
function num(v: string | undefined): string | undefined {
  return v && /^\d{1,9}$/.test(v) && Number(v) > 0 ? String(Number(v)) : undefined;
}

function weekKey(search: URLSearchParams): string | undefined {
  const get = params(search);
  const y = num(get("select_year"));
  const m = num(get("select_month"));
  const w = num(get("select_week"));
  return y && m && w ? `${y}-${m}-${w}` : undefined;
}

function boardPost(board: string | undefined, seq: string | undefined, fallback: string): LegacyTarget {
  const b = board ? BOARDS.get(board) : undefined;
  if (!board || !b) return { to: fallback, permanent: false };
  if (!b.detail) return { to: b.list, permanent: true };
  const hit = seq && index().posts.get(`${board}:${seq}`);
  return hit ? { to: hit, permanent: true } : { to: b.list, permanent: false };
}

function boardList(board: string | undefined, fallback: string): LegacyTarget {
  const b = board ? BOARDS.get(board) : undefined;
  return b ? { to: b.list, permanent: true } : { to: fallback, permanent: false };
}

/**
 * Where an old-site request should go. `pathname` is the full request path
 * (starting with /modu/); anything not recognised goes home with a 302.
 */
export function legacyTarget(pathname: string, search: URLSearchParams): LegacyTarget {
  const path = pathname.replace(/^\/modu\//i, "").replace(/\/+$/, "").toLowerCase();
  const get = params(search);
  const sBoard = num(get("board_seq")) && `s_board_${num(get("board_seq"))}`;
  const mBoard = num(get("board_idx")) && `media_${num(get("board_idx"))}`;

  switch (path) {
    case "s_board/read.asp":
      return boardPost(sBoard, num(get("seq")), "/news");
    case "s_board/list.asp":
      return boardList(sBoard, "/news");
    case "media_board/read.asp":
      return boardPost(mBoard, num(get("seq")), "/sermons");
    case "media_board/list.asp":
      return boardList(mBoard, "/sermons");
    case "weekly/weekly_v2.asp":
    case "weekly/weekly_detail_v2.asp": {
      // No week at all = the old bulletin list page (a fixed home); a partial
      // or unreadable week is a broken link, so only a short-lived guess.
      const key = weekKey(search);
      const asked = ["select_year", "select_month", "select_week"].some((k) => get(k) !== undefined);
      if (!key) return { to: "/news/bulletin", permanent: !asked };
      const hit = index().weeks.get(key);
      return hit ? { to: hit, permanent: true } : { to: "/news/bulletin", permanent: false };
    }
    case "document/document_view.asp": {
      const to = DOCUMENTS.get(num(get("uotc")) ?? "");
      return to ? { to, permanent: true } : { to: "/about", permanent: false };
    }
  }
  const page = PAGES.get(path);
  return page ? { to: page, permanent: true } : { to: "/", permanent: false };
}
