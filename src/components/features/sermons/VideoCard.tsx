import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, Calendar, Play, User } from "lucide-react";
import { CARD_BORDER, fmtDate } from "@/components/features/news/shared";

export interface VideoItem {
  id: string;
  /** internal path, external https URL, or null for a non-clickable card */
  href: string | null;
  title: string;
  date: string;
  /** small badge on the thumbnail (kind / team) */
  badge?: string;
  scripture?: string;
  person?: string;
  /** YouTube thumbnail URL; null when the item has no video */
  thumb: string | null;
  series?: string;
  kind?: string;
}

function Wrapper({ href, title, children }: { href: string | null; title: string; children: ReactNode }) {
  const cls = "flex flex-col flex-1";
  if (!href) return <div className={cls}>{children}</div>;
  if (href.startsWith("https://")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`${title} 유튜브에서 보기`}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} aria-label={`${title} 보기`}>
      {children}
    </Link>
  );
}

export default function VideoCard({ item }: { item: VideoItem }) {
  return (
    <article
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{ backgroundColor: "var(--color-white)", border: CARD_BORDER }}
    >
      <Wrapper href={item.href} title={item.title}>
        <div
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: "16/9",
            background: "linear-gradient(160deg, var(--color-primary-light) 0%, var(--color-dark) 100%)",
          }}
        >
          {item.thumb ? (
            // eslint-disable-next-line @next/next/no-img-element -- external YouTube thumbnail
            <img
              src={item.thumb}
              alt=""
              width={480}
              height={360}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <span
              className="absolute inset-0 flex items-center justify-center font-serif px-4 text-center leading-relaxed"
              style={{ color: "rgba(255,255,255,0.35)", fontSize: "clamp(0.8rem, 2vw, 1rem)" }}
            >
              {item.scripture ?? "영상 없음"}
            </span>
          )}
          {item.thumb && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: "rgba(26,30,44,0.55)" }}
              >
                <Play className="w-5 h-5 text-white fill-white" style={{ marginLeft: "2px" }} aria-hidden="true" />
              </div>
            </div>
          )}
          {item.badge && (
            <span
              className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: "var(--color-white)", color: "var(--color-primary)" }}
            >
              {item.badge}
            </span>
          )}
        </div>
        <div className="flex flex-col flex-1 p-5 gap-3">
          <h3 className="font-serif text-sm font-bold leading-snug line-clamp-2" style={{ color: "var(--color-dark)" }}>
            {item.title}
          </h3>
          <div className="flex flex-col gap-1.5 mt-auto text-xs" style={{ color: "var(--color-dark-soft)" }}>
            {item.scripture && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-primary)" }} strokeWidth={1.75} aria-hidden="true" />
                {item.scripture}
              </span>
            )}
            <span className="flex items-center justify-between gap-2">
              {item.person ? (
                <span className="flex items-center gap-1.5 min-w-0">
                  <User className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <span className="truncate">{item.person}</span>
                </span>
              ) : (
                <span />
              )}
              <span className="flex items-center gap-1.5 shrink-0">
                <Calendar className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                {fmtDate(item.date)}
              </span>
            </span>
          </div>
        </div>
      </Wrapper>
    </article>
  );
}
