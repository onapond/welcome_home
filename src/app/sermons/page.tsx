import type { Metadata } from "next";
import SermonsClient from "@/components/features/SermonsClient";
import { PageHero, SERMON_TABS } from "@/components/features/news/shared";
import { sermonToItem } from "@/components/features/sermons/items";
import { SERMON_KINDS, getSermons } from "@/lib/content";
import { getListPage } from "@/lib/content/lists";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  const page = getListPage("sermons");
  return pageMetadata({ title: page.title, description: page.description, path: "/sermons" });
}

export default function SermonsPage() {
  const sermons = getSermons();
  const series = Array.from(new Set(sermons.map((s) => s.series).filter((v): v is string => !!v)));
  const kinds = SERMON_KINDS.filter((k) => sermons.some((s) => s.kind === k));
  const page = getListPage("sermons");

  return (
    <main>
      <PageHero label={page.label} title={page.heading} description={page.intro} tabs={SERMON_TABS} current="/sermons" />
      <section className="py-12 lg:py-16" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SermonsClient items={sermons.map(sermonToItem)} kinds={[...kinds]} series={series} />
        </div>
      </section>
    </main>
  );
}
