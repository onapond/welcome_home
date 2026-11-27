import type { Metadata } from "next";
import NewsClient from "@/components/features/news/NewsClient";
import { NEWS_TABS, PageHero } from "@/components/features/news/shared";
import { NEWS_CATEGORIES, getNews } from "@/lib/content";
import { getListPage } from "@/lib/content/lists";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  const page = getListPage("news");
  return pageMetadata({ title: page.title, description: page.description, path: "/news" });
}

export default function NewsPage() {
  const news = getNews();
  const page = getListPage("news");
  const categories = NEWS_CATEGORIES.filter((c) => news.some((n) => n.category === c));
  const items = news.map((n) => ({ id: n.id, title: n.title, date: n.date, category: n.category, pinned: n.pinned }));

  return (
    <main>
      <PageHero label={page.label} title={page.heading} description={page.intro} tabs={NEWS_TABS} current="/news" />
      <section className="py-12 lg:py-16" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsClient items={items} categories={[...categories]} />
        </div>
      </section>
    </main>
  );
}
