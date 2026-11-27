import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import ContactClient from "@/components/features/ContactClient";
import { getSite } from "@/lib/content";
import { getContactPage, getLocationInfo, getPrivacyPage } from "@/lib/content/pages";
import { kakaoDirectionsUrl } from "@/lib/directions";
import { fullAddress, telHref } from "@/lib/site-summary";

export function generateMetadata(): Metadata {
  const { meta } = getContactPage();
  return pageMetadata({
    title: meta.title,
    description: meta.description,
    ogDescription: meta.ogDescription,
    path: "/contact",
  });
}

export default function ContactPage() {
  const site = getSite();
  const page = getContactPage();
  const { consent } = getPrivacyPage();

  return (
    <ContactClient
      page={page}
      phone={site.phone}
      phoneHref={telHref(site.phone)}
      fax={site.fax}
      email={site.email}
      address={fullAddress(site.address)}
      addressRoad={site.address.road}
      mapUrl={kakaoDirectionsUrl(site)}
      subway={getLocationInfo().transport.find((t) => t.id === "subway")?.text}
      consentCopy={{ text: consent.contact, linkLabel: consent.linkLabel }}
    />
  );
}
