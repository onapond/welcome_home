"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import VideoCard, { type VideoItem } from "./VideoCard";
import { EmptyState, MoreButton } from "@/components/features/news/shared";

const PAGE_SIZE = 12;

export default function PraiseClient({ items }: { items: VideoItem[] }) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => [p.title, p.person].some((v) => v?.toLowerCase().includes(q)));
  }, [items, query]);

  if (items.length === 0) return <EmptyState message="아직 등록된 찬양 영상이 없습니다." />;

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
          aria-label="찬양 검색"
          placeholder="제목, 찬양대 검색"
          className="w-full rounded-full pl-11 pr-5 py-3 text-sm outline-none focus:ring-2"
          style={{ backgroundColor: "var(--color-white)", border: "1px solid rgba(43,58,140,0.15)", color: "var(--color-dark)" }}
        />
      </div>
      {filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.slice(0, visible).map((p) => (
              <VideoCard key={p.id} item={p} />
            ))}
          </div>
          <MoreButton shown={Math.min(visible, filtered.length)} total={filtered.length} onClick={() => setVisible((v) => v + PAGE_SIZE)} />
        </>
      ) : (
        <EmptyState message="검색 결과가 없습니다." />
      )}
    </div>
  );
}
