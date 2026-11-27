import type { Metadata } from "next";
import VisitClient from "@/components/features/VisitClient";
import LocationSection from "@/components/sections/LocationSection";
import { getSite } from "@/lib/content";
import { getVisitPage } from "@/lib/content/pages";

export function generateMetadata(): Metadata {
  const { meta } = getVisitPage();
  const site = getSite();
  return {
    alternates: { canonical: "/visit" },
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: `${meta.title} | ${site.name}`,
      description: meta.ogDescription ?? meta.description,
    },
  };
}

export default function VisitPage() {
  const site = getSite();
  return (
    <VisitClient
      page={getVisitPage()}
      services={site.services}
      phone={site.phone}
      locationSlot={<LocationSection />}
    />
  );
}
