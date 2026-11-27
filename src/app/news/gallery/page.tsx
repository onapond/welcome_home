import type { Metadata } from "next";
import GalleryClient from "@/components/features/gallery/GalleryClient";
import { NEWS_TABS, PageHero } from "@/components/features/news/shared";
import { getAlbums } from "@/lib/content";
import { getListPage } from "@/lib/content/lists";
import { pageMetadata } from "@/lib/metadata";
import { thumbUrl } from "@/lib/media";

export function generateMetadata(): Metadata {
  const page = getListPage("gallery");
  return pageMetadata({ title: page.title, description: page.description, path: "/news/gallery" });
}

export default function GalleryPage() {
  const page = getListPage("gallery");
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
      <PageHero label={page.label} title={page.heading} description={page.intro} tabs={NEWS_TABS} current="/news/gallery" />
      <section className="py-12 lg:py-16" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <GalleryClient items={items} />
        </div>
      </section>
    </main>
  );
}
