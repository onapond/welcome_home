import type { Metadata } from "next";
import NewsClient from "@/components/features/news/NewsClient";
import { NEWS_TABS, PageHero } from "@/components/features/news/shared";
import { NEWS_CATEGORIES, getNews } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: "/news" },
  title: "소식",
  description: "청파중앙교회 공지사항, 교회 소식, 간증을 확인하세요.",
};

export default function NewsPage() {
  const news = getNews();
  const categories = NEWS_CATEGORIES.filter((c) => news.some((n) => n.category === c));
  const items = news.map((n) => ({ id: n.id, title: n.title, date: n.date, category: n.category, pinned: n.pinned }));

  return (
    <main>
      <PageHero label="소식" title="교회 소식" description="공지사항, 행사 안내, 간증을 전합니다." tabs={NEWS_TABS} current="/news" />
      <section className="py-12 lg:py-16" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsClient items={items} categories={[...categories]} />
        </div>
      </section>
    </main>
  );
}
