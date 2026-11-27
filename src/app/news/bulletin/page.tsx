import type { Metadata } from "next";
import BulletinClient from "@/components/features/bulletin/BulletinClient";
import { NEWS_TABS, PageHero, fmtDate } from "@/components/features/news/shared";
import { getBulletins } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: "/news/bulletin" },
  title: "주보",
  description: "청파중앙교회 주보 아카이브입니다. 매주 주보를 PDF로 보실 수 있습니다.",
};

export default function BulletinPage() {
  const items = getBulletins().map((b) => ({
    id: b.id,
    date: b.date,
    title: b.title ?? `${fmtDate(b.date)} 주보`,
    hasPdf: !!b.pdf,
  }));

  return (
    <main>
      <PageHero label="소식" title="주보" description="매주 주보를 PDF로 내려받거나 바로 볼 수 있습니다." tabs={NEWS_TABS} current="/news/bulletin" />
      <section className="py-12 lg:py-16" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <BulletinClient items={items} />
        </div>
      </section>
    </main>
  );
}
