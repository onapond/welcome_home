import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Inbox } from "lucide-react";

/** "YYYY-MM-DD" -> "YYYY.MM.DD" (string based, no timezone surprises) */
export function fmtDate(d: string): string {
  return d.replace(/-/g, ".");
}

/** First ~120 characters of a Markdown body as plain text (page descriptions). */
export function plainExcerpt(md: string): string {
  return md.replace(/[#>*_`\[\]()!-]/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
}

export interface NavTab {
  href: string;
  label: string;
}

export const NEWS_TABS: NavTab[] = [
  { href: "/news", label: "공지·소식" },
  { href: "/news/bulletin", label: "주보" },
  { href: "/news/gallery", label: "갤러리" },
  { href: "/news/videos", label: "영상" },
];

export const SERMON_TABS: NavTab[] = [
  { href: "/sermons", label: "설교" },
  { href: "/sermons/praise", label: "찬양" },
];

/** Dark page header with title and a sub-navigation row. */
export function PageHero({
  label,
  title,
  description,
  tabs,
  current,
}: {
  label: string;
  title: string;
  description?: string;
  tabs: NavTab[];
  current: string;
}) {
  return (
    <section style={{ backgroundColor: "var(--color-primary)" }} aria-label={`${title} 머리글`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32">
        <p
          className="text-xs font-semibold uppercase tracking-[5px] mb-3"
          style={{ color: "var(--color-secondary)" }}
        >
          {label}
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold" style={{ color: "var(--color-white)" }}>
          {title}
        </h1>
        {description && (
          <p className="text-sm mt-3 max-w-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            {description}
          </p>
        )}
        <nav aria-label={`${label} 하위 메뉴`} className="mt-8 flex gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const active = t.href === current;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className="px-5 py-3 text-sm font-semibold whitespace-nowrap rounded-t-lg"
                style={
                  active
                    ? { backgroundColor: "var(--color-bg)", color: "var(--color-primary)" }
                    : { color: "rgba(255,255,255,0.75)" }
                }
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}

export function EmptyState({ message, children }: { message: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <Inbox className="w-8 h-8" style={{ color: "rgba(43,58,140,0.25)" }} strokeWidth={1.5} aria-hidden="true" />
      <p className="text-sm" style={{ color: "var(--color-dark-soft)" }}>
        {message}
      </p>
      {children}
    </div>
  );
}

/** Chip style shared by the filter rows. */
export function chipStyle(active: boolean): CSSProperties {
  return {
    padding: "0.4rem 1rem",
    borderRadius: "9999px",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    backgroundColor: active ? "var(--color-primary)" : "transparent",
    color: active ? "white" : "var(--color-dark-soft)",
    border: active ? "1px solid transparent" : "1px solid rgba(43,58,140,0.15)",
  };
}

export function MoreButton({ shown, total, onClick }: { shown: number; total: number; onClick: () => void }) {
  if (shown >= total) return null;
  return (
    <div className="flex justify-center mt-10">
      <button
        type="button"
        onClick={onClick}
        className="px-8 py-3 rounded-full text-sm font-semibold"
        style={{
          backgroundColor: "var(--color-white)",
          color: "var(--color-primary)",
          border: "1px solid rgba(43,58,140,0.2)",
        }}
      >
        더 보기 ({shown}/{total})
      </button>
    </div>
  );
}

export const CARD_BORDER = "1px solid rgba(43,58,140,0.07)";
