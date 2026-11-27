import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import PhotoGrid from "@/components/features/gallery/PhotoGrid";
import VideoFacade from "@/components/features/VideoFacade";
import Markdown from "@/components/ui/Markdown";
import ShareButton from "@/components/features/ShareButton";
import { fmtDate, plainExcerpt } from "@/components/features/news/shared";
import { getSite, getVideos } from "@/lib/content";
import { JsonLd, breadcrumbJsonLd, videoJsonLd } from "@/lib/jsonld";
import { mediaUrl, thumbUrl, videoEmbedAllow, videoEmbedUrl, videoThumb } from "@/lib/media";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return getVideos().map((v) => ({ id: v.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const v = getVideos().find((x) => x.id === id);
  if (!v) return {};
  const image = videoThumb(v.video, v.thumbnail, "full") ?? (v.images[0] ? mediaUrl(v.images[0].src) : undefined);
  return pageMetadata({
    title: v.title,
    description: plainExcerpt(v.body) || `${fmtDate(v.date)} — ${getSite().name} 영상`,
    path: `/news/videos/${id}`,
    image,
    type: "article",
  });
}

export default async function VideoPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = getVideos().find((x) => x.id === id);
  if (!v) notFound();

  const photos = v.images.map((img) => ({
    thumb: thumbUrl(img),
    full: mediaUrl(img.src),
    caption: img.alt || undefined,
  }));

  return (
    <main style={{ backgroundColor: "var(--color-bg)" }}>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "홈", path: "/" },
            { name: "영상", path: "/news/videos" },
            { name: v.title, path: `/news/videos/${v.id}` },
          ]),
          ...(v.video
            ? [
                videoJsonLd({
                  name: v.title,
                  description: plainExcerpt(v.body),
                  date: v.date,
                  video: v.video,
                  thumbnail: v.thumbnail,
                }),
              ]
            : []),
        ]}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-20">
        <div className="flex items-center justify-between gap-4">
          <Link href="/news/videos" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            영상 목록
          </Link>
          <ShareButton title={v.title} />
        </div>
        <header className="mt-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-snug" style={{ color: "var(--color-dark)" }}>
            {v.title}
          </h1>
          <p className="text-sm mt-3" style={{ color: "var(--color-dark-soft)" }}>
            {fmtDate(v.date)}
          </p>
        </header>

        {v.video && (
          <div className="mt-8 rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--color-dark)" }}>
            <VideoFacade
              embedUrl={videoEmbedUrl(v.video)}
              allow={videoEmbedAllow(v.video)}
              title={v.title}
              thumbnail={videoThumb(v.video, v.thumbnail, "full")}
            />
          </div>
        )}

        {v.body && (
          <article className="mt-10">
            <Markdown>{v.body}</Markdown>
          </article>
        )}

        {photos.length > 0 && (
          <section className="mt-10" aria-label="사진">
            <PhotoGrid photos={photos} albumTitle={v.title} />
          </section>
        )}
      </div>
    </main>
  );
}
