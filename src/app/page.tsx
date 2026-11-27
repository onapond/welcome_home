import HeroSection from "@/components/sections/HeroSection";
import ServiceTimesBar from "@/components/sections/ServiceTimesBar";
import JourneyTimeline from "@/components/sections/JourneyTimeline";
import NewHereSection from "@/components/sections/NewHereSection";
import LatestSermonSection from "@/components/sections/LatestSermonSection";
import CommunitySection from "@/components/sections/CommunitySection";
import LocationSection from "@/components/sections/LocationSection";
import type { Metadata } from "next";
import { getSermons, getSite } from "@/lib/content";
import { JsonLd, churchJsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return pageMetadata({ description: getSite().description, path: "/" });
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
      hasVideo: !!s.video,
    }));

  return (
    <main>
      {/* schema.org Church — 값은 모두 content/site.yaml (src/lib/jsonld.tsx) */}
      <JsonLd data={churchJsonLd(site)} />
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
