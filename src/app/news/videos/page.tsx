import type { Metadata } from "next";
import VideosClient from "@/components/features/videos/VideosClient";
import { videoPostToItem } from "@/components/features/sermons/items";
import { NEWS_TABS, PageHero } from "@/components/features/news/shared";
import { getVideos } from "@/lib/content";
import { getListPage } from "@/lib/content/lists";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  const page = getListPage("videos");
  return pageMetadata({ title: page.title, description: page.description, path: "/news/videos" });
}

export default function VideosPage() {
  const page = getListPage("videos");

  return (
    <main>
      <PageHero label={page.label} title={page.heading} description={page.intro} tabs={NEWS_TABS} current="/news/videos" />
      <section className="py-12 lg:py-16" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <VideosClient items={getVideos().map(videoPostToItem)} />
        </div>
      </section>
    </main>
  );
}
