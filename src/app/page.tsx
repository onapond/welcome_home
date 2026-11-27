import HeroSection from "@/components/sections/HeroSection";
import ServiceTimesBar from "@/components/sections/ServiceTimesBar";
import JourneyTimeline from "@/components/sections/JourneyTimeline";
import NewHereSection from "@/components/sections/NewHereSection";
import LatestSermonSection from "@/components/sections/LatestSermonSection";
import CommunitySection from "@/components/sections/CommunitySection";
import LocationSection from "@/components/sections/LocationSection";
import type { Metadata } from "next";
import { getSermons } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  const sermons = getSermons()
    .slice(0, 5)
    .map((s) => ({ id: s.id, title: s.title, date: s.date, scripture: s.scripture, preacher: s.preacher }));

  return (
    <main>
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
