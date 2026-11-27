"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { CARD_BORDER, EmptyState, MoreButton, chipStyle, fmtDate } from "@/components/features/news/shared";

export interface BulletinItem {
  id: string;
  date: string;
  title: string;
  hasPdf: boolean;
}

const PAGE_SIZE = 20;
const ALL = "전체";

export default function BulletinClient({ items }: { items: BulletinItem[] }) {
  const [year, setYear] = useState(ALL);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const years = useMemo(() => Array.from(new Set(items.map((b) => b.date.slice(0, 4)))), [items]);
  const filtered = useMemo(() => (year === ALL ? items : items.filter((b) => b.date.startsWith(year))), [items, year]);

  if (items.length === 0) return <EmptyState message="아직 등록된 주보가 없습니다." />;

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
      <ul className="flex flex-col gap-3">
        {filtered.slice(0, visible).map((b) => (
          <li key={b.id}>
            <Link
              href={`/news/bulletin/${b.id}`}
              className="flex items-center justify-between gap-4 rounded-xl px-5 py-4 transition-shadow hover:shadow-md"
              style={{ backgroundColor: "var(--color-white)", border: CARD_BORDER }}
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg" style={{ backgroundColor: "var(--color-bg-warm)" }}>
                  <FileText className="w-4 h-4" style={{ color: "var(--color-primary)" }} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium truncate" style={{ color: "var(--color-dark)" }}>
                    {b.title}
                  </span>
                  <span className="block text-xs" style={{ color: "var(--color-dark-soft)" }}>
                    {fmtDate(b.date)}
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-2 shrink-0 text-xs" style={{ color: "var(--color-dark-soft)" }}>
                {b.hasPdf ? "PDF" : "준비 중"}
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <MoreButton shown={Math.min(visible, filtered.length)} total={filtered.length} onClick={() => setVisible((v) => v + PAGE_SIZE)} />
    </div>
  );
}
