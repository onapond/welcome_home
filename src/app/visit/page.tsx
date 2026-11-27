import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import VisitClient from "@/components/features/VisitClient";
import LocationSection from "@/components/sections/LocationSection";
import { getSite } from "@/lib/content";
import { getPrivacyPage, getVisitPage } from "@/lib/content/pages";
import { telHref } from "@/lib/site-summary";

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
  const { consent } = getPrivacyPage();
  return (
    <VisitClient
      page={getVisitPage()}
      services={site.services}
      phone={site.phone}
      phoneHref={telHref(site.phone)}
      consentCopy={{ text: consent.visit, linkLabel: consent.linkLabel }}
      locationSlot={<LocationSection />}
    />
  );
}
