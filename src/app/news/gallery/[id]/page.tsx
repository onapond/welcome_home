import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import PhotoGrid from "@/components/features/gallery/PhotoGrid";
import Markdown from "@/components/ui/Markdown";
import { fmtDate } from "@/components/features/news/shared";
import { albumCover, getAlbums, getSite } from "@/lib/content";
import { JsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { mediaUrl, thumbUrl } from "@/lib/media";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAlbums().map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const a = getAlbums().find((x) => x.id === id);
  if (!a) return {};
  return pageMetadata({
    title: a.title,
    description: `${fmtDate(a.date)} ${a.category} 사진 ${a.photos.length}장 — ${getSite().name} 갤러리`,
    path: `/news/gallery/${id}`,
    image: mediaUrl(albumCover(a).src),
    type: "article",
  });
}

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = getAlbums().find((x) => x.id === id);
  if (!a) notFound();

  const photos = a.photos.map((p) => ({
    thumb: thumbUrl(p),
    full: mediaUrl(p.src),
    width: p.width,
    height: p.height,
    caption: p.caption,
  }));

  return (
    <main style={{ backgroundColor: "var(--color-bg)" }}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "홈", path: "/" },
          { name: "갤러리", path: "/news/gallery" },
          { name: a.title, path: `/news/gallery/${a.id}` },
        ])}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-20">
        <Link href="/news/gallery" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          갤러리
        </Link>
        <header className="mt-6 mb-8">
          <p className="text-xs font-bold tracking-widest" style={{ color: "var(--color-primary)" }}>
            {a.category}
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-snug mt-2" style={{ color: "var(--color-dark)" }}>
            {a.title}
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--color-dark-soft)" }}>
            {fmtDate(a.date)} · 사진 {a.photos.length}장
          </p>
        </header>
        {a.body && (
          <div className="mb-8 max-w-3xl">
            <Markdown>{a.body}</Markdown>
          </div>
        )}
        <PhotoGrid photos={photos} albumTitle={a.title} />
      </div>
    </main>
  );
}
