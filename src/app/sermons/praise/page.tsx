import type { Metadata } from "next";
import PraiseClient from "@/components/features/sermons/PraiseClient";
import { PageHero, SERMON_TABS } from "@/components/features/news/shared";
import { praiseToItem } from "@/components/features/sermons/items";
import { getPraise } from "@/lib/content";
import { getListPage } from "@/lib/content/lists";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  const page = getListPage("praise");
  return pageMetadata({ title: page.title, description: page.description, path: "/sermons/praise" });
}

export default function PraisePage() {
  const page = getListPage("praise");
  return (
    <main>
      <PageHero label={page.label} title={page.heading} description={page.intro} tabs={SERMON_TABS} current="/sermons/praise" />
      <section className="py-12 lg:py-16" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <PraiseClient items={getPraise().map(praiseToItem)} />
        </div>
      </section>
    </main>
  );
}
