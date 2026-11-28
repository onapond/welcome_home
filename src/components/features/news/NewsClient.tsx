"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookHeart, HandHeart, Megaphone, Newspaper, Pin, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CARD_BORDER, EmptyState, MoreButton, chipStyle, fmtDate } from "./shared";

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  pinned: boolean;
  /** Small copy of the first photo (thumb ?? src), or null when the item has no photos. */
  thumb: string | null;
}

const PAGE_SIZE = 15;
const ALL = "전체";

export const CATEGORY_ICON: Record<string, { Icon: LucideIcon; color: string }> = {
  공지: { Icon: Megaphone, color: "var(--color-primary)" },
  소식: { Icon: Newspaper, color: "var(--color-primary-light)" },
  간증: { Icon: BookHeart, color: "var(--color-primary-pale)" },
  새가족: { Icon: UserPlus, color: "var(--color-primary-light)" },
  중보기도: { Icon: HandHeart, color: "var(--color-primary-pale)" },
};

const noSubscribe = () => () => {};
const readCategory = () => new URLSearchParams(window.location.search).get("category");

export default function NewsClient({ items, categories }: { items: NewsItem[]; categories: string[] }) {
  // ?category=… picks the chip (old 새가족소개 / 중보기도 list links land here) and is kept on reload.
  // Read without an effect: the static HTML renders 「전체」, the client then reads the URL.
  const urlCat = useSyncExternalStore(noSubscribe, readCategory, () => null);
  const [picked, setPicked] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const cat = picked ?? (urlCat && categories.includes(urlCat) ? urlCat : ALL);

  function pick(c: string) {
    setPicked(c);
    setVisible(PAGE_SIZE);
    const url = new URL(window.location.href);
    if (c === ALL) url.searchParams.delete("category");
    else url.searchParams.set("category", c);
    window.history.replaceState(null, "", url);
  }

  const filtered = useMemo(() => (cat === ALL ? items : items.filter((n) => n.category === cat)), [items, cat]);

  if (items.length === 0) return <EmptyState message="아직 등록된 소식이 없습니다." />;

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap mb-8" role="group" aria-label="분류">
        {[ALL, ...categories].map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={cat === c}
            style={chipStyle(cat === c)}
            onClick={() => pick(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="이 분류에 등록된 소식이 없습니다." />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {filtered.slice(0, visible).map((n) => {
              const { Icon, color } = CATEGORY_ICON[n.category] ?? CATEGORY_ICON["공지"];
              return (
                <li key={n.id}>
                  <Link
                    href={`/news/${n.id}`}
                    className="group flex items-start gap-4 rounded-2xl p-5 transition-shadow hover:shadow-md"
                    style={{ backgroundColor: "var(--color-white)", border: CARD_BORDER }}
                  >
                    {n.thumb ? (
                      // Decorative: the link is already named by the title next to it.
                      <span
                        className="shrink-0 relative w-20 h-16 sm:w-24 sm:h-[4.5rem] rounded-xl overflow-hidden mt-0.5"
                        style={{ backgroundColor: "var(--color-bg-warm)" }}
                      >
                        <Image src={n.thumb} alt="" fill sizes="96px" loading="lazy" className="object-cover" />
                      </span>
                    ) : (
                      <span
                        className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl mt-0.5"
                        style={{ backgroundColor: "var(--color-bg-warm)" }}
                      >
                        <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.75} aria-hidden="true" />
                      </span>
                    )}
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold" style={{ color }}>
                          {n.category}
                        </span>
                        {n.pinned && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: "var(--color-bg-warm)", color: "var(--color-primary)" }}
                          >
                            <Pin className="w-3 h-3" aria-hidden="true" />
                            고정
                          </span>
                        )}
                      </span>
                      <span className="block text-sm font-semibold leading-snug group-hover:underline underline-offset-2" style={{ color: "var(--color-dark)" }}>
                        {n.title}
                      </span>
                      <span className="block text-xs mt-1.5" style={{ color: "var(--color-dark-soft)" }}>
                        {fmtDate(n.date)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <MoreButton shown={Math.min(visible, filtered.length)} total={filtered.length} onClick={() => setVisible((v) => v + PAGE_SIZE)} />
        </>
      )}
    </div>
  );
}
