import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Download, ExternalLink } from "lucide-react";
import Markdown from "@/components/ui/Markdown";
import { fmtDate } from "@/components/features/news/shared";
import { getBulletins, getSite } from "@/lib/content";
import { isEmbeddableMedia, mediaUrl } from "@/lib/media";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return getBulletins().map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const b = getBulletins().find((x) => x.id === id);
  if (!b) return {};
  return pageMetadata({
    title: b.title ?? `${fmtDate(b.date)} 주보`,
    description: `${getSite().name} ${fmtDate(b.date)} 주보입니다.`,
    path: `/news/bulletin/${id}`,
    type: "article",
  });
}

export default async function BulletinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = getBulletins().find((x) => x.id === id);
  if (!b) notFound();
  const pdf = b.pdf ? mediaUrl(b.pdf) : null;
  // Embed only store keys and "/" site paths. Any https:// PDF gets a plain
  // link: an outside file may not be the PDF its name says.
  const embed = b.pdf ? isEmbeddableMedia(b.pdf) : false;
  const title = b.title ?? `${fmtDate(b.date)} 주보`;

  return (
    <main style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-20">
        <Link href="/news/bulletin" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          주보 목록
        </Link>
        <header className="mt-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-dark)" }}>
            {title}
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--color-dark-soft)" }}>
            {fmtDate(b.date)}
          </p>
        </header>

        {pdf && embed ? (
          <>
            <a
              href={pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full text-sm font-semibold"
              style={{ backgroundColor: "var(--color-primary)", color: "var(--color-white)" }}
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              PDF 열기·내려받기
              <span className="sr-only">(새 창)</span>
            </a>
            <iframe
              src={pdf}
              title={`${title} PDF 미리보기`}
              loading="lazy"
              className="mt-6 w-full rounded-xl border-0 bg-white"
              style={{ height: "80vh", border: "1px solid rgba(43,58,140,0.1)" }}
            />
          </>
        ) : pdf ? (
          <a
            href={pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full text-sm font-semibold"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-white)" }}
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            PDF 열기
            <span className="sr-only">(새 창)</span>
          </a>
        ) : (
          <p className="mt-6 text-sm" style={{ color: "var(--color-dark-soft)" }}>
            이 주보의 PDF는 아직 등록되지 않았습니다.
          </p>
        )}

        {b.body && (
          <section className="mt-10" aria-label="광고">
            <Markdown>{b.body}</Markdown>
          </section>
        )}
      </div>
    </main>
  );
}
