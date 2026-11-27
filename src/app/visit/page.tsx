import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import VisitClient from "@/components/features/VisitClient";
import LocationSection from "@/components/sections/LocationSection";
import { getSite } from "@/lib/content";
import { getVisitPage } from "@/lib/content/pages";
import { JsonLd, faqJsonLd } from "@/lib/jsonld";

export function generateMetadata(): Metadata {
  const { meta } = getVisitPage();
  return pageMetadata({
    title: meta.title,
    description: meta.description,
    ogDescription: meta.ogDescription,
    path: "/visit",
  });
}

export default function VisitPage() {
  const site = getSite();
  const page = getVisitPage();
  return (
    <>
      {/* VisitClient renders <main>; the FAQ data sits next to it (head-agnostic JSON-LD). */}
      <JsonLd data={faqJsonLd(page.faq.items)} />
      <VisitClient
        page={page}
        services={site.services}
        phone={site.phone}
        locationSlot={<LocationSection />}
      />
    </>
  );
}
