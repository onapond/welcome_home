import Link from "next/link";
import { Play, ChevronRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Sermon } from "@/lib/sanity/types";

// Sanity 날짜 "YYYY-MM-DD" → "YYYY.MM.DD"
function formatDate(dateStr: string): string {
  return dateStr?.replace(/-/g, ".") ?? "";
}

// 하드코딩 폴백 데이터 (Sanity 미연동 시 표시)
const FALLBACK_SERMONS: Sermon[] = [
  {
    _id: "1",
    _type: "sermon",
    title: "새 하늘과 새 땅",
    scripture: "요한계시록 21:1-8",
    preacher: "김항우 목사",
    date: "2026-04-06",
  },
  {
    _id: "2",
    _type: "sermon",
    title: "두려워하지 말라, 내가 너와 함께 함이라",
    scripture: "이사야 41:10",
    preacher: "김항우 목사",
    date: "2026-03-30",
  },
  {
    _id: "3",
    _type: "sermon",
    title: "주 안에서 항상 기뻐하라",
    scripture: "빌립보서 4:4-7",
    preacher: "김항우 목사",
    date: "2026-03-23",
  },
  {
    _id: "4",
    _type: "sermon",
    title: "일어나 함께 가자",
    scripture: "미가 6:8",
    preacher: "김항우 목사",
    date: "2026-03-16",
  },
  {
    _id: "5",
    _type: "sermon",
    title: "우리가 사랑함은 그가 먼저 사랑하셨음이라",
    scripture: "요한일서 4:19",
    preacher: "김항우 목사",
    date: "2026-03-09",
  },
];

interface Props {
  sermons?: Sermon[];
}

export default function LatestSermonSection({ sermons }: Props) {
  const list = sermons && sermons.length > 0 ? sermons : FALLBACK_SERMONS;
  const latest = list[0];
  const rest = list.slice(1, 5);

  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header Row */}
        <div className="flex items-end justify-between mb-10 lg:mb-12">
          <SectionHeader label="말씀" title="최신 설교" align="left" />
          <Link
            href="/sermons"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium flex-shrink-0 mb-1 transition-colors duration-200"
            style={{ color: "var(--color-primary)" }}
          >
            전체 설교 보기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">

          {/* ── Left: Main Card ── */}
          <Link
            href="/sermons"
            className="group relative flex flex-col justify-end rounded-2xl overflow-hidden min-h-72 lg:min-h-96 transition-transform duration-300 hover:-translate-y-0.5"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {/* Gradient Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(160deg, rgba(61,78,174,0.6) 0%, rgba(26,30,44,0.9) 100%)",
              }}
            />

            {/* Content */}
            <div className="relative z-10 p-7 lg:p-8 flex flex-col gap-4">
              <span
                className="self-start px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
                style={{ backgroundColor: "var(--color-accent)", color: "var(--color-dark)" }}
              >
                최신 설교
              </span>

              <h3 className="font-serif text-2xl font-bold text-white leading-snug">
                {latest.title}
              </h3>

              <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                {latest.scripture}&nbsp;·&nbsp;{latest.preacher}
              </p>

              <div className="flex items-center gap-2 mt-1">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 group-hover:scale-110"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                >
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="text-sm font-medium text-white">설교 듣기</span>
              </div>
            </div>
          </Link>

          {/* ── Right: Sermon List ── */}
          <div className="flex flex-col gap-3">
            {rest.map((sermon) => (
              <Link
                key={sermon._id}
                href="/sermons"
                className="group flex items-center gap-4 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
                style={{ backgroundColor: "var(--color-white)" }}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold leading-snug mb-1 truncate"
                    style={{ color: "var(--color-dark)" }}
                  >
                    {sermon.title}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-dark-soft)" }}>
                    {sermon.scripture}&nbsp;·&nbsp;{formatDate(sermon.date)}
                  </p>
                </div>

                <div
                  className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full"
                  style={{ backgroundColor: "var(--color-bg-warm)" }}
                >
                  <Play
                    className="w-4 h-4"
                    style={{ color: "var(--color-primary)" }}
                    fill="currentColor"
                  />
                </div>
              </Link>
            ))}

            {/* Mobile: 전체 설교 보기 */}
            <Link
              href="/sermons"
              className="sm:hidden flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-medium mt-1"
              style={{
                color: "var(--color-primary)",
                border: "1px solid var(--color-primary)",
              }}
            >
              전체 설교 보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
