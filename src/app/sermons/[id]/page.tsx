import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Calendar, ChevronLeft, ChevronRight, ExternalLink, Layers, User } from "lucide-react";
import Markdown from "@/components/ui/Markdown";
import { fmtDate } from "@/components/features/news/shared";
import { getSermons, getSite } from "@/lib/content";
import { videoEmbedAllow, videoEmbedUrl, videoThumb } from "@/lib/media";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return getSermons().map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const s = getSermons().find((x) => x.id === id);
  if (!s) return {};
  return pageMetadata({
    title: s.title,
    description: `${[s.scripture, s.preacher, fmtDate(s.date)].filter(Boolean).join(" · ")} — ${getSite().name} 설교`,
    path: `/sermons/${id}`,
    image: videoThumb(s.video, s.thumbnail, "full") ?? undefined,
    type: "article",
  });
}

export default async function SermonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const all = getSermons(); // newest first
  const index = all.findIndex((x) => x.id === id);
  if (index === -1) notFound();
  const s = all[index];
  const newer = index > 0 ? all[index - 1] : undefined;
  const older = index < all.length - 1 ? all[index + 1] : undefined;
  const channel = getSite().sns.youtube;

  const meta = [
    { Icon: Calendar, value: fmtDate(s.date) },
    { Icon: User, value: s.preacher },
    { Icon: BookOpen, value: s.scripture },
    { Icon: Layers, value: s.series },
  ].filter((m): m is { Icon: typeof Calendar; value: string } => !!m.value);

  return (
    <main style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-20">
        <Link href="/sermons" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          설교 목록
        </Link>

        <header className="mt-6">
          <p className="text-xs font-semibold tracking-[4px]" style={{ color: "var(--color-primary)" }}>
            {s.kind}
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-snug mt-2" style={{ color: "var(--color-dark)" }}>
            {s.title}
          </h1>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm" style={{ color: "var(--color-dark-soft)" }}>
            {meta.map(({ Icon, value }) => (
              <li key={value} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                {value}
              </li>
            ))}
          </ul>
        </header>

        <div className="mt-8 rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--color-dark)" }}>
          {s.video ? (
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              <iframe
                src={videoEmbedUrl(s.video)}
                title={`${s.title} 영상`}
                loading="lazy"
                allow={videoEmbedAllow(s.video)}
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center"
              style={{ background: "linear-gradient(160deg, var(--color-primary-light) 0%, var(--color-dark) 100%)" }}
            >
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                이 설교는 영상이 등록되어 있지 않습니다.
              </p>
              {channel && (
                <a
                  href={channel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold"
                  style={{ color: "var(--color-white)", border: "1px solid rgba(255,255,255,0.35)" }}
                >
                  유튜브 채널에서 찾아보기
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </div>

        {s.body && (
          <article className="mt-10">
            <Markdown>{s.body}</Markdown>
          </article>
        )}

        <nav aria-label="이전 다음 설교" className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {older ? (
            <Link
              href={`/sermons/${older.id}`}
              className="flex items-center gap-3 rounded-xl p-4"
              style={{ backgroundColor: "var(--color-white)", border: "1px solid rgba(43,58,140,0.07)" }}
            >
              <ChevronLeft className="w-4 h-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-xs" style={{ color: "var(--color-dark-soft)" }}>이전 설교</span>
                <span className="block text-sm font-semibold truncate" style={{ color: "var(--color-dark)" }}>{older.title}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {newer ? (
            <Link
              href={`/sermons/${newer.id}`}
              className="flex items-center justify-end gap-3 rounded-xl p-4 text-right"
              style={{ backgroundColor: "var(--color-white)", border: "1px solid rgba(43,58,140,0.07)" }}
            >
              <span className="min-w-0">
                <span className="block text-xs" style={{ color: "var(--color-dark-soft)" }}>다음 설교</span>
                <span className="block text-sm font-semibold truncate" style={{ color: "var(--color-dark)" }}>{newer.title}</span>
              </span>
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden="true" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </main>
  );
}
