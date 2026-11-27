import type { Metadata } from "next";
import PraiseClient from "@/components/features/sermons/PraiseClient";
import { PageHero, SERMON_TABS } from "@/components/features/news/shared";
import { praiseToItem } from "@/components/features/sermons/items";
import { getPraise } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: "/sermons/praise" },
  title: "찬양",
  description: "청파중앙교회 찬양대와 찬양팀의 찬양 영상을 모았습니다.",
};

export default function PraisePage() {
  return (
    <main>
      <PageHero label="말씀" title="찬양" description="예배 가운데 드린 찬양 영상입니다." tabs={SERMON_TABS} current="/sermons/praise" />
      <section className="py-12 lg:py-16" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <PraiseClient items={getPraise().map(praiseToItem)} />
        </div>
      </section>
    </main>
  );
}
