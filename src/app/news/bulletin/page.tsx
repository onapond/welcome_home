import type { Metadata } from "next";
import BulletinClient from "@/components/features/bulletin/BulletinClient";
import { NEWS_TABS, PageHero, fmtDate } from "@/components/features/news/shared";
import { getBulletins } from "@/lib/content";
import { getListPage } from "@/lib/content/lists";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  const page = getListPage("bulletin");
  return pageMetadata({ title: page.title, description: page.description, path: "/news/bulletin" });
}

export default function BulletinPage() {
  const page = getListPage("bulletin");
  const items = getBulletins().map((b) => ({
    id: b.id,
    date: b.date,
    title: b.title ?? `${fmtDate(b.date)} 주보`,
    hasPdf: !!b.pdf,
  }));

  return (
    <main>
      <PageHero label={page.label} title={page.heading} description={page.intro} tabs={NEWS_TABS} current="/news/bulletin" />
      <section className="py-12 lg:py-16" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <BulletinClient items={items} />
        </div>
      </section>
    </main>
  );
}
