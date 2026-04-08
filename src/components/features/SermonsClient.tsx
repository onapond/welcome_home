"use client";

import { useState, useMemo } from "react";
import { Search, Play, X, ChevronLeft, ChevronRight, BookOpen, User, Calendar } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Sermon } from "@/lib/sanity/types";

// "YYYY-MM-DD" → "YYYY.MM.DD"
function fmtDate(d: string) {
  return d?.replace(/-/g, ".") ?? "";
}

const SORT_OPTIONS = ["최신순", "오래된 순"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];
const PAGE_SIZE = 6;

// ─── Sermon Card ─────────────────────────────────────────────────────────────

function SermonCard({ sermon, onPlay }: { sermon: Sermon; onPlay: (s: Sermon) => void }) {
  const seriesLabel = sermon.series?.title ?? "설교";

  return (
    <article
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{
        backgroundColor: "var(--color-white)",
        border: "1px solid rgba(43,58,140,0.07)",
      }}
    >
      {/* Thumbnail */}
      <button
        className="relative w-full flex-shrink-0 overflow-hidden focus:outline-none"
        style={{ aspectRatio: "16/9", backgroundColor: "var(--color-primary)" }}
        onClick={() => onPlay(sermon)}
        aria-label={`${sermon.title} 재생`}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, var(--color-primary-light) 0%, var(--color-dark) 100%)",
          }}
        />
        <span
          className="absolute inset-0 flex items-center justify-center font-serif px-4 text-center leading-relaxed"
          style={{ color: "rgba(255,255,255,0.18)", fontSize: "clamp(0.7rem, 2vw, 0.9rem)" }}
        >
          {sermon.scripture}
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 group-hover:scale-110"
            style={{ backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)" }}
          >
            <Play className="w-5 h-5 text-white fill-white" style={{ marginLeft: "2px" }} />
          </div>
        </div>
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: "var(--color-accent)", color: "var(--color-dark)" }}
        >
          {seriesLabel}
        </span>
      </button>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3
          className="font-serif text-sm font-bold leading-snug line-clamp-2"
          style={{ color: "var(--color-dark)" }}
        >
          {sermon.title}
        </h3>
        <div className="flex flex-col gap-1.5 mt-auto">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--color-primary)" }} strokeWidth={1.75} />
            <span className="text-xs" style={{ color: "var(--color-dark-soft)" }}>{sermon.scripture}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--color-dark-soft)" }} strokeWidth={1.75} />
              <span className="text-xs" style={{ color: "var(--color-dark-soft)" }}>{sermon.preacher}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--color-dark-soft)" }} strokeWidth={1.75} />
              <span className="text-xs" style={{ color: "var(--color-dark-soft)" }}>{fmtDate(sermon.date)}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Sermon Modal ─────────────────────────────────────────────────────────────

function SermonModal({ sermon, onClose }: { sermon: Sermon; onClose: () => void }) {
  const seriesLabel = sermon.series?.title ?? "설교";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{ backgroundColor: "var(--color-dark)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video area */}
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          {sermon.youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${sermon.youtubeId}?autoplay=1`}
              title={sermon.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              style={{
                background: "linear-gradient(160deg, var(--color-primary-light) 0%, var(--color-dark) 100%)",
              }}
            >
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              >
                <Play className="w-7 h-7 text-white fill-white" style={{ marginLeft: "3px" }} />
              </div>
              <div className="text-center px-6">
                <p className="text-sm font-semibold text-white mb-1">{sermon.title}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  유튜브 영상 연동 예정 — Sanity CMS에서 YouTube ID를 등록하면 재생됩니다
                </p>
              </div>
              <a
                href="https://www.youtube.com/channel/UC7Fk-mpsIQlgykLK4lW3t7g"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-full text-xs font-semibold text-white transition-all duration-200 hover:brightness-110"
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                유튜브 채널에서 보기
              </a>
            </div>
          )}
          <button
            className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full z-10 hover:brightness-125"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
            aria-label="닫기"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Info */}
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="font-serif text-sm font-bold text-white leading-snug">{sermon.title}</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              {sermon.scripture}&nbsp;·&nbsp;{sermon.preacher}&nbsp;·&nbsp;{fmtDate(sermon.date)}
            </p>
          </div>
          <span
            className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: "var(--color-accent)", color: "var(--color-dark)" }}
          >
            {seriesLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

interface Props {
  sermons: Sermon[];
}

export default function SermonsClient({ sermons }: Props) {
  const allSeriesTitles = ["전체", ...Array.from(new Set(sermons.map((s) => s.series?.title ?? "기타")))];
  const allPreachers = ["전체", ...Array.from(new Set(sermons.map((s) => s.preacher)))];

  const [query, setQuery] = useState("");
  const [activeSeries, setActiveSeries] = useState("전체");
  const [activePreacher, setActivePreacher] = useState("전체");
  const [sort, setSort] = useState<SortOption>("최신순");
  const [page, setPage] = useState(1);
  const [playing, setPlaying] = useState<Sermon | null>(null);

  const filtered = useMemo(() => {
    let list = sermons;
    if (activeSeries !== "전체") list = list.filter((s) => (s.series?.title ?? "기타") === activeSeries);
    if (activePreacher !== "전체") list = list.filter((s) => s.preacher === activePreacher);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.scripture.toLowerCase().includes(q) ||
          s.preacher.toLowerCase().includes(q)
      );
    }
    return sort === "최신순" ? [...list] : [...list].reverse();
  }, [sermons, query, activeSeries, activePreacher, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function resetFilters() {
    setQuery(""); setActiveSeries("전체"); setActivePreacher("전체");
    setSort("최신순"); setPage(1);
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.4rem 1rem",
    borderRadius: "9999px",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: active ? "var(--color-primary)" : "transparent",
    color: active ? "white" : "var(--color-dark-soft)",
    border: active ? "1px solid transparent" : "1px solid rgba(43,58,140,0.15)",
  });

  return (
    <>
      <main>
        {/* ── Header + Search ── */}
        <section className="py-16 lg:py-20" style={{ backgroundColor: "var(--color-bg)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader label="말씀" title="설교 아카이브" align="center" className="mb-8" />
            <div className="relative max-w-lg mx-auto">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "var(--color-dark-soft)" }}
                strokeWidth={2}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="제목, 본문, 설교자 검색"
                className="w-full rounded-full pl-11 pr-5 py-3 text-sm outline-none transition-all duration-200 focus:ring-2"
                style={{
                  backgroundColor: "var(--color-white)",
                  border: "1px solid rgba(43,58,140,0.15)",
                  color: "var(--color-dark)",
                }}
              />
            </div>
          </div>
        </section>

        {/* ── Filters ── */}
        <section
          className="sticky top-0 z-30 border-b"
          style={{ backgroundColor: "var(--color-white)", borderColor: "rgba(43,58,140,0.08)" }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-widest mr-1" style={{ color: "var(--color-dark-soft)" }}>정렬</span>
              {SORT_OPTIONS.map((opt) => (
                <button key={opt} style={tabStyle(sort === opt)} onClick={() => { setSort(opt); setPage(1); }}>{opt}</button>
              ))}
            </div>
            {allSeriesTitles.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-widest mr-1" style={{ color: "var(--color-dark-soft)" }}>시리즈</span>
                {allSeriesTitles.map((s) => (
                  <button key={s} style={tabStyle(activeSeries === s)} onClick={() => { setActiveSeries(s); setPage(1); }}>{s}</button>
                ))}
              </div>
            )}
            {allPreachers.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-widest mr-1" style={{ color: "var(--color-dark-soft)" }}>설교자</span>
                {allPreachers.map((p) => (
                  <button key={p} style={tabStyle(activePreacher === p)} onClick={() => { setActivePreacher(p); setPage(1); }}>{p}</button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Grid ── */}
        <section className="py-14 lg:py-20" style={{ backgroundColor: "var(--color-bg)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs mb-6" style={{ color: "var(--color-dark-soft)" }}>
              총 <strong style={{ color: "var(--color-primary)" }}>{filtered.length}</strong>개의 설교
            </p>

            {paginated.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginated.map((sermon) => (
                  <SermonCard key={sermon._id} sermon={sermon} onPlay={setPlaying} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Search className="w-8 h-8" style={{ color: "rgba(43,58,140,0.2)" }} />
                <p className="text-sm" style={{ color: "var(--color-dark-soft)" }}>검색 결과가 없습니다.</p>
                <button
                  className="text-xs font-semibold underline underline-offset-2"
                  style={{ color: "var(--color-primary)" }}
                  onClick={resetFilters}
                >
                  필터 초기화
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  className="flex items-center justify-center w-9 h-9 rounded-full disabled:opacity-30"
                  style={{ backgroundColor: "var(--color-white)", border: "1px solid rgba(43,58,140,0.15)" }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="이전 페이지"
                >
                  <ChevronLeft className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold"
                    style={n === currentPage
                      ? { backgroundColor: "var(--color-primary)", color: "white", border: "1px solid transparent" }
                      : { backgroundColor: "var(--color-white)", color: "var(--color-dark-soft)", border: "1px solid rgba(43,58,140,0.15)" }
                    }
                    onClick={() => setPage(n)}
                    aria-current={n === currentPage ? "page" : undefined}
                  >
                    {n}
                  </button>
                ))}
                <button
                  className="flex items-center justify-center w-9 h-9 rounded-full disabled:opacity-30"
                  style={{ backgroundColor: "var(--color-white)", border: "1px solid rgba(43,58,140,0.15)" }}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="다음 페이지"
                >
                  <ChevronRight className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {playing && <SermonModal sermon={playing} onClose={() => setPlaying(null)} />}
    </>
  );
}
