import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Markdown from "@/components/ui/Markdown";
import ShareButton from "@/components/features/ShareButton";
import { fmtDate, plainExcerpt } from "@/components/features/news/shared";
import { getNews, getSite } from "@/lib/content";
import { bodyImageUrls } from "@/lib/content/body";
import { JsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { mediaUrl } from "@/lib/media";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return getNews().map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const n = getNews().find((x) => x.id === id);
  if (!n) return {};
  return pageMetadata({
    title: n.title,
    description: plainExcerpt(n.body) || `${n.category} · ${fmtDate(n.date)} — ${getSite().name}`,
    path: `/news/${id}`,
    type: "article",
    image: n.images[0] ? mediaUrl(n.images[0].src) : undefined,
  });
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = getNews().find((x) => x.id === id);
  if (!n) notFound();

  // `images` also feeds the list thumbnail and the share preview; a photo the
  // body already draws (migrated posts keep it in place), as the original or
  // as its thumb, is not drawn twice. A path merely mentioned in text is not.
  const drawn = bodyImageUrls(n.body);
  const gallery = n.images.filter(
    (img) => !drawn.has(mediaUrl(img.src)) && !(img.thumb && drawn.has(mediaUrl(img.thumb))),
  );

  return (
    <main style={{ backgroundColor: "var(--color-bg)" }}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "홈", path: "/" },
          { name: "소식 & 공지", path: "/news" },
          { name: n.title, path: `/news/${n.id}` },
        ])}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-20">
        <div className="flex items-center justify-between gap-4">
          <Link href="/news" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            소식 목록
          </Link>
          <ShareButton title={n.title} />
        </div>
        <header className="mt-6 pb-6 border-b" style={{ borderColor: "rgba(43,58,140,0.12)" }}>
          <p className="text-xs font-bold" style={{ color: "var(--color-primary)" }}>
            {n.category}
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-snug mt-2" style={{ color: "var(--color-dark)" }}>
            {n.title}
          </h1>
          <p className="text-sm mt-3" style={{ color: "var(--color-dark-soft)" }}>
            {fmtDate(n.date)}
          </p>
        </header>

        {n.body && (
          <article className="mt-6">
            <Markdown>{n.body}</Markdown>
          </article>
        )}

        {gallery.length > 0 && (
          <div className="mt-8 flex flex-col gap-5">
            {gallery.map((img) => (
              <Image
                key={img.src}
                src={mediaUrl(img.src)}
                alt={img.alt}
                width={1600}
                height={1067}
                sizes="(max-width: 768px) 100vw, 768px"
                className="w-full h-auto rounded-xl"
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
