// ──────────────────────────────────────────
// Sanity Document Base
// ──────────────────────────────────────────
export interface SanityDocument {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
}

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
  caption?: string;
}

export interface SanitySlug {
  _type: "slug";
  current: string;
}

// ──────────────────────────────────────────
// Sermon (설교)
// ──────────────────────────────────────────
export interface Sermon extends SanityDocument {
  _type: "sermon";
  title: string;
  slug: SanitySlug;
  date: string;             // ISO date string
  preacher: string;         // 설교자
  bibleReference: string;   // 성경 본문 (예: "요한복음 3:16")
  series?: string;          // 시리즈명
  youtubeUrl?: string;      // YouTube 링크
  thumbnailUrl?: string;    // 썸네일 URL
  summary?: string;         // 요약
}

// ──────────────────────────────────────────
// Event (교회 일정)
// ──────────────────────────────────────────
export type EventCategory =
  | "worship"     // 예배
  | "education"   // 교육
  | "mission"     // 선교
  | "fellowship"  // 친교
  | "other";      // 기타

export interface ChurchEvent extends SanityDocument {
  _type: "event";
  title: string;
  slug: SanitySlug;
  startDate: string;        // ISO datetime string
  endDate?: string;         // ISO datetime string
  allDay: boolean;
  location?: string;        // 장소
  category: EventCategory;
  description?: string;
  image?: SanityImage;
  isRecurring: boolean;
}

// ──────────────────────────────────────────
// Post (공지사항 / 소식)
// ──────────────────────────────────────────
export type PostCategory =
  | "announcement"  // 공지사항
  | "news"          // 소식
  | "bulletin"      // 주보
  | "newsletter";   // 뉴스레터

export interface Post extends SanityDocument {
  _type: "post";
  title: string;
  slug: SanitySlug;
  publishedAt: string;      // ISO date string
  category: PostCategory;
  excerpt?: string;         // 요약
  body: unknown[];          // Portable Text blocks
  thumbnail?: SanityImage;
  isPinned: boolean;        // 상단 고정
}

// ──────────────────────────────────────────
// Gallery (갤러리)
// ──────────────────────────────────────────
export interface GalleryItem extends SanityDocument {
  _type: "gallery";
  title: string;
  slug: SanitySlug;
  date: string;             // ISO date string
  images: SanityImage[];
  description?: string;
  album?: string;           // 앨범명
}

// ──────────────────────────────────────────
// Navigation & UI Helpers
// ──────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface ServiceTime {
  name: string;             // 예배명 (예: "주일 1부 예배")
  time: string;             // 시간 (예: "9:30 AM")
  location?: string;        // 장소 (예: "본당")
  dayOfWeek: number;        // 0=일, 1=월 ... 6=토
}
