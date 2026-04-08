// ─── Shared ──────────────────────────────────────────────────────────────────

export interface SanityImageAsset {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

export interface SanityFileAsset {
  _type: "file";
  asset: { _ref: string; _type: "reference" };
}

// ─── Sermon ──────────────────────────────────────────────────────────────────

export interface Sermon {
  _id: string;
  _type: "sermon";
  title: string;
  date: string; // "YYYY-MM-DD"
  preacher: string;
  scripture: string;
  series?: { _id: string; title: string };
  youtubeId?: string;
  thumbnail?: SanityImageAsset & { url?: string };
  summary?: string;
}

export interface SermonSeries {
  _id: string;
  _type: "sermonSeries";
  title: string;
  description?: string;
  thumbnail?: SanityImageAsset & { url?: string };
  startDate?: string;
  endDate?: string;
}

// ─── Event ───────────────────────────────────────────────────────────────────

export type EventCategory = "worship" | "education" | "event" | "mission" | "etc";

export interface ChurchEvent {
  _id: string;
  _type: "event";
  title: string;
  category: EventCategory;
  date: string; // ISO datetime
  endDate?: string;
  location?: string;
  description?: unknown[]; // Portable Text
  imageUrl?: string;
  registrationUrl?: string;
}

// ─── Bulletin ────────────────────────────────────────────────────────────────

export interface Bulletin {
  _id: string;
  _type: "bulletin";
  date: string;
  pdfUrl?: string;
  announcements?: unknown[]; // Portable Text
}

// ─── Post ────────────────────────────────────────────────────────────────────

export type PostCategory = "notice" | "news" | "testimony";

export interface Post {
  _id: string;
  _type: "post";
  title: string;
  slug: { current: string };
  category: PostCategory;
  date: string;
  featured?: boolean;
  body?: unknown[]; // Portable Text
  images?: Array<SanityImageAsset & { url?: string }>;
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

export type GalleryCategory = "worship" | "event" | "retreat" | "mission" | "etc";

export interface GalleryItem {
  image: SanityImageAsset & { url: string };
  caption?: string;
}

export interface Gallery {
  _id: string;
  _type: "gallery";
  title: string;
  date: string;
  category: GalleryCategory;
  description?: string;
  images: GalleryItem[];
}
