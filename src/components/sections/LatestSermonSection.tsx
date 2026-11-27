import Link from "next/link";
import { Play, ChevronRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
export interface LatestSermon {
  id: string;
  title: string;
  date: string;
  scripture?: string;
  preacher?: string;
  /** 유튜브 영상이 등록돼 있는지. 없으면 재생 아이콘 대신 「설교 보기」로 안내한다. */
  hasVideo: boolean;
}

// "YYYY-MM-DD" -> "YYYY.MM.DD"
function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, ".");
}

function meta(s: LatestSermon): string {
  return [s.scripture, s.preacher].filter(Boolean).join(" · ");
}

interface Props {
  sermons: LatestSermon[];
}

export default function LatestSermonSection({ sermons }: Props) {
  const latest = sermons[0];
  const rest = sermons.slice(1, 5);

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

        {!latest ? (
          <p className="py-16 text-center text-sm" style={{ color: "var(--color-dark-soft)" }}>
            아직 등록된 설교가 없습니다.
          </p>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">

          {/* ── Left: Main Card ── */}
          <Link
            href={`/sermons/${latest.id}`}
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
                className="self-start px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: "var(--color-accent)", color: "var(--color-dark)" }}
              >
                최신 설교
              </span>

              <h3 className="font-serif text-2xl font-bold text-white leading-snug">
                {latest.title}
              </h3>

              <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                {meta(latest)}
              </p>

              <div className="flex items-center gap-2 mt-1">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 group-hover:scale-110"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                >
                  {latest.hasVideo ? (
                    <Play className="w-4 h-4 text-white fill-white" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white" aria-hidden="true" />
                  )}
                </div>
                <span className="text-sm font-medium text-white">
                  {latest.hasVideo ? "설교 듣기" : "설교 보기"}
                </span>
              </div>
            </div>
          </Link>

          {/* ── Right: Sermon List ── */}
          <div className="flex flex-col gap-3">
            {rest.map((sermon) => (
              <Link
                key={sermon.id}
                href={`/sermons/${sermon.id}`}
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
                    {[sermon.scripture, formatDate(sermon.date)].filter(Boolean).join(" · ")}
                  </p>
                </div>

                <div
                  className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full"
                  style={{ backgroundColor: "var(--color-bg-warm)" }}
                >
                  {sermon.hasVideo ? (
                    <Play
                      className="w-4 h-4"
                      style={{ color: "var(--color-primary)" }}
                      fill="currentColor"
                      aria-hidden="true"
                    />
                  ) : (
                    <ChevronRight
                      className="w-4 h-4"
                      style={{ color: "var(--color-primary)" }}
                      aria-hidden="true"
                    />
                  )}
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
        )}

      </div>
    </section>
  );
}
