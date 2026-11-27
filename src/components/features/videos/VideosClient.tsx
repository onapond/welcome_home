"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import VideoCard, { type VideoItem } from "@/components/features/sermons/VideoCard";
import { EmptyState, MoreButton, chipStyle } from "@/components/features/news/shared";

const PAGE_SIZE = 12;
const ALL = "전체";

/** Special video list: title search + year filter, like the praise and gallery lists. */
export default function VideosClient({ items }: { items: VideoItem[] }) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState(ALL);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const years = useMemo(() => Array.from(new Set(items.map((v) => v.date.slice(0, 4)))), [items]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (v) => (year === ALL || v.date.startsWith(year)) && (!q || v.title.toLowerCase().includes(q)),
    );
  }, [items, query, year]);

  if (items.length === 0) return <EmptyState message="아직 등록된 영상이 없습니다." />;

  return (
    <div>
      <div className="relative max-w-lg mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: "var(--color-dark-soft)" }}
          strokeWidth={2}
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE_SIZE);
          }}
          aria-label="영상 검색"
          placeholder="제목 검색"
          className="w-full rounded-full pl-11 pr-5 py-3 text-sm outline-none focus:ring-2"
          style={{ backgroundColor: "var(--color-white)", border: "1px solid rgba(43,58,140,0.15)", color: "var(--color-dark)" }}
        />
      </div>
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
      {filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.slice(0, visible).map((v) => (
              <VideoCard key={v.id} item={v} />
            ))}
          </div>
          <MoreButton shown={Math.min(visible, filtered.length)} total={filtered.length} onClick={() => setVisible((n) => n + PAGE_SIZE)} />
        </>
      ) : (
        <EmptyState message="검색 결과가 없습니다." />
      )}
    </div>
  );
}
