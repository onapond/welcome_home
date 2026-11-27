import type { Metadata } from "next";
import SermonsClient from "@/components/features/SermonsClient";
import { PageHero, SERMON_TABS } from "@/components/features/news/shared";
import { sermonToItem } from "@/components/features/sermons/items";
import { SERMON_KINDS, getSermons } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: "/sermons" },
  title: "설교",
  description: "청파중앙교회 설교 말씀 아카이브입니다. 예배 종류, 시리즈, 설교자별로 찾아 유튜브로 시청하세요.",
};

export default function SermonsPage() {
  const sermons = getSermons();
  const series = Array.from(new Set(sermons.map((s) => s.series).filter((v): v is string => !!v)));
  const kinds = SERMON_KINDS.filter((k) => sermons.some((s) => s.kind === k));

  return (
    <main>
      <PageHero label="말씀" title="설교" description="주일예배를 비롯한 청파중앙교회의 말씀을 다시 만나 보세요." tabs={SERMON_TABS} current="/sermons" />
      <section className="py-12 lg:py-16" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SermonsClient items={sermons.map(sermonToItem)} kinds={[...kinds]} series={series} />
        </div>
      </section>
    </main>
  );
}
