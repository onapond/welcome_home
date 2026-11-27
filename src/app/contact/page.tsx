import type { Metadata } from "next";
import ContactClient from "@/components/features/ContactClient";
import { getSite } from "@/lib/content";
import { getContactPage, getLocationInfo } from "@/lib/content/pages";
import { fullAddress, kakaoMapUrl, telHref } from "@/lib/site-summary";

export function generateMetadata(): Metadata {
  const { meta } = getContactPage();
  const site = getSite();
  return {
    alternates: { canonical: "/contact" },
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: `${meta.title} | ${site.name}`,
      description: meta.ogDescription ?? meta.description,
    },
  };
}

export default function ContactPage() {
  const site = getSite();
  const page = getContactPage();

  return (
    <ContactClient
      page={page}
      phone={site.phone}
      phoneHref={telHref(site.phone)}
      fax={site.fax}
      email={site.email}
      address={fullAddress(site.address)}
      addressRoad={site.address.road}
      mapUrl={kakaoMapUrl(site.address)}
      subway={getLocationInfo().transport.find((t) => t.id === "subway")?.text}
    />
  );
}
