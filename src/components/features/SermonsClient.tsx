"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import VideoCard, { type VideoItem } from "@/components/features/sermons/VideoCard";
import { EmptyState, MoreButton, chipStyle } from "@/components/features/news/shared";

const PAGE_SIZE = 12;
const ALL = "전체";

interface Props {
  items: VideoItem[];
  kinds: string[];
  series: string[];
}

export default function SermonsClient({ items, kinds, series }: Props) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState(ALL);
  const [seriesSel, setSeriesSel] = useState(ALL);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((s) => {
      if (kind !== ALL && s.kind !== kind) return false;
      if (seriesSel !== ALL && s.series !== seriesSel) return false;
      if (!q) return true;
      return [s.title, s.person, s.scripture].some((v) => v?.toLowerCase().includes(q));
    });
  }, [items, query, kind, seriesSel]);

  function reset() {
    setQuery("");
    setKind(ALL);
    setSeriesSel(ALL);
    setVisible(PAGE_SIZE);
  }

  if (items.length === 0) {
    return <EmptyState message="아직 등록된 설교가 없습니다." />;
  }

  const label = "text-xs font-semibold mr-1";

  return (
    <div>
      <div className="relative max-w-lg mb-8">
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
          aria-label="설교 검색"
          placeholder="제목, 본문, 설교자 검색"
          className="w-full rounded-full pl-11 pr-5 py-3 text-sm outline-none focus:ring-2"
          style={{ backgroundColor: "var(--color-white)", border: "1px solid rgba(43,58,140,0.15)", color: "var(--color-dark)" }}
        />
      </div>

      <div className="flex flex-col gap-3 mb-8">
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="예배 종류">
          <span className={label} style={{ color: "var(--color-dark-soft)" }}>예배</span>
          {[ALL, ...kinds].map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              style={chipStyle(kind === k)}
              onClick={() => {
                setKind(k);
                setVisible(PAGE_SIZE);
              }}
            >
              {k}
            </button>
          ))}
        </div>
        {series.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="series-select" className={label} style={{ color: "var(--color-dark-soft)" }}>
              시리즈
            </label>
            <select
              id="series-select"
              value={seriesSel}
              onChange={(e) => {
                setSeriesSel(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              className="rounded-full px-4 py-2 text-sm"
              style={{ backgroundColor: "var(--color-white)", border: "1px solid rgba(43,58,140,0.15)", color: "var(--color-dark)" }}
            >
              <option value={ALL}>{ALL}</option>
              {series.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <p className="text-xs mb-6" style={{ color: "var(--color-dark-soft)" }} role="status">
        총 <strong style={{ color: "var(--color-primary)" }}>{filtered.length}</strong>개의 설교
      </p>

      {filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.slice(0, visible).map((s) => (
              <VideoCard key={s.id} item={s} />
            ))}
          </div>
          <MoreButton shown={Math.min(visible, filtered.length)} total={filtered.length} onClick={() => setVisible((v) => v + PAGE_SIZE)} />
        </>
      ) : (
        <EmptyState message="조건에 맞는 설교가 없습니다.">
          <button type="button" onClick={reset} className="text-xs font-semibold underline underline-offset-2" style={{ color: "var(--color-primary)" }}>
            필터 초기화
          </button>
        </EmptyState>
      )}
    </div>
  );
}
