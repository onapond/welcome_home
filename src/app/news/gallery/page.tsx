import type { Metadata } from "next";
import GalleryClient from "@/components/features/gallery/GalleryClient";
import { NEWS_TABS, PageHero } from "@/components/features/news/shared";
import { getAlbums } from "@/lib/content";
import { thumbUrl } from "@/lib/media";

export const metadata: Metadata = {
  alternates: { canonical: "/news/gallery" },
  title: "갤러리",
  description: "청파중앙교회의 예배와 행사, 수련회 사진을 모았습니다.",
};

export default function GalleryPage() {
  const items = getAlbums().map((a) => ({
    id: a.id,
    title: a.title,
    date: a.date,
    category: a.category,
    cover: thumbUrl(a.cover ?? a.photos[0].src),
    count: a.photos.length,
  }));

  return (
    <main>
      <PageHero label="소식" title="갤러리" description="함께한 순간들을 사진으로 남깁니다." tabs={NEWS_TABS} current="/news/gallery" />
      <section className="py-12 lg:py-16" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <GalleryClient items={items} />
        </div>
      </section>
    </main>
  );
}
