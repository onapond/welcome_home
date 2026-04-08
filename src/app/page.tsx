import HeroSection from "@/components/sections/HeroSection";
import ServiceTimesBar from "@/components/sections/ServiceTimesBar";
import JourneyTimeline from "@/components/sections/JourneyTimeline";
import NewHereSection from "@/components/sections/NewHereSection";
import LatestSermonSection from "@/components/sections/LatestSermonSection";
import CommunitySection from "@/components/sections/CommunitySection";
import LocationSection from "@/components/sections/LocationSection";
import { getLatestSermons } from "@/lib/sanity/queries";

// ISR: 1시간마다 정적 페이지 재생성
export const revalidate = 3600;

export default async function Home() {
  const sermons = await getLatestSermons(5);

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
