import HeroSection from "@/components/sections/HeroSection";
import ServiceTimesBar from "@/components/sections/ServiceTimesBar";
import JourneyTimeline from "@/components/sections/JourneyTimeline";
import NewHereSection from "@/components/sections/NewHereSection";
import LatestSermonSection from "@/components/sections/LatestSermonSection";
import CommunitySection from "@/components/sections/CommunitySection";
import LocationSection from "@/components/sections/LocationSection";
import type { Metadata } from "next";
import { getSermons, getSite, type Site } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";
import { fullAddress } from "@/lib/site-summary";

export function generateMetadata(): Metadata {
  return pageMetadata({ description: getSite().description, path: "/" });
}

/** schema.org Church 구조화 데이터 — 값은 모두 content/site.yaml에서 온다. */
function churchJsonLd(site: Site) {
  const sameAs = [site.sns.youtube, site.sns.instagram].filter((v): v is string => !!v);
  return {
    "@context": "https://schema.org",
    "@type": "Church",
    name: site.name,
    alternateName: site.nameEn,
    description: site.description,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    foundingDate: String(site.founded),
    // "02-714-0041~3" 같은 대표번호 묶음에서 첫 번호만 쓴다
    telephone: (site.phone.split(/[~,/]/)[0] ?? site.phone).trim(),
    ...(site.fax ? { faxNumber: site.fax } : {}),
    ...(site.email ? { email: site.email } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: fullAddress(site.address),
      addressCountry: "KR",
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export default function Home() {
  const site = getSite();
  const sermons = getSermons()
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      title: s.title,
      date: s.date,
      scripture: s.scripture,
      preacher: s.preacher,
      hasVideo: !!s.youtube,
    }));

  return (
    <main>
      <script
        type="application/ld+json"
        // JSON 안의 "<"를 이스케이프해 </script>로 끊기지 않게 한다
        dangerouslySetInnerHTML={{ __html: JSON.stringify(churchJsonLd(site)).replace(/</g, "\\u003c") }}
      />
      <HeroSection />
      <ServiceTimesBar />
      <JourneyTimeline />
      <NewHereSection />
      <LatestSermonSection sermons={sermons} />
      <CommunitySection />
      <LocationSection />
    </main>
  );
}
