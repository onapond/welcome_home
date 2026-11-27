"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Images } from "lucide-react";
import { CARD_BORDER, EmptyState, MoreButton, chipStyle, fmtDate } from "@/components/features/news/shared";

export interface AlbumItem {
  id: string;
  title: string;
  date: string;
  category: string;
  cover: string;
  count: number;
}

const PAGE_SIZE = 24;
const ALL = "전체";

export default function GalleryClient({ items }: { items: AlbumItem[] }) {
  const [year, setYear] = useState(ALL);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const years = useMemo(() => Array.from(new Set(items.map((a) => a.date.slice(0, 4)))), [items]);
  const filtered = useMemo(() => (year === ALL ? items : items.filter((a) => a.date.startsWith(year))), [items, year]);

  if (items.length === 0) return <EmptyState message="아직 등록된 앨범이 없습니다." />;

  return (
    <div>
      {years.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap mb-8" role="group" aria-label="연도">
          {[ALL, ...years].map((y) => (
            <button
              key={y}
              type="button"
              aria-pressed={year === y}
              style={chipStyle(year === y)}
              onClick={() => {
                setYear(y);
                setVisible(PAGE_SIZE);
              }}
            >
              {y === ALL ? y : `${y}년`}
            </button>
          ))}
        </div>
      )}
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.slice(0, visible).map((a) => (
          <li key={a.id}>
            <Link
              href={`/news/gallery/${a.id}`}
              className="group block rounded-xl overflow-hidden transition-shadow hover:shadow-md"
              style={{ backgroundColor: "var(--color-white)", border: CARD_BORDER }}
            >
              <span className="block relative" style={{ aspectRatio: "4/3", backgroundColor: "var(--color-bg-warm)" }}>
                <Image
                  src={a.cover}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover"
                />
                <span
                  className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                  style={{ backgroundColor: "rgba(26,30,44,0.7)", color: "var(--color-white)" }}
                >
                  <Images className="w-3 h-3" aria-hidden="true" />
                  {a.count}
                </span>
              </span>
              <span className="block p-3">
                <span className="block text-sm font-semibold leading-snug line-clamp-2 group-hover:underline underline-offset-2" style={{ color: "var(--color-dark)" }}>
                  {a.title}
                </span>
                <span className="block text-xs mt-1" style={{ color: "var(--color-dark-soft)" }}>
                  {fmtDate(a.date)} · {a.category}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <MoreButton shown={Math.min(visible, filtered.length)} total={filtered.length} onClick={() => setVisible((v) => v + PAGE_SIZE)} />
    </div>
  );
}
