import { mediaUrl } from "@/lib/media";
import { getHomePage } from "@/lib/content/pages";
import HeroSlider from "./HeroSlider";

/** 홈 첫 화면. 문구는 content/pages/home.yaml, 표어는 content/site.yaml에서 읽는다. */
export default function HeroSection() {
  const { hero } = getHomePage();

  return (
    <HeroSlider
      badge={hero.badge}
      headline={hero.headline}
      lines={hero.lines}
      primaryCta={hero.primaryCta}
      secondaryCta={hero.secondaryCta}
      slides={hero.slides.map((s) => ({
        label: s.label,
        imageUrl: s.image ? mediaUrl(s.image) : undefined,
      }))}
    />
  );
}
