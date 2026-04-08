import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

interface CommunityCard {
  title: string;
  description: string;
  tag: string;
  imageLabel: string;
  href: string;
}

const CARDS: CommunityCard[] = [
  {
    title: "청년부 United",
    description:
      "20-30대 청년들이 함께 예배하고 교제하며 신앙 안에서 성장해가는 공동체입니다.",
    tag: "@chungpa_united",
    imageLabel: "청년부 사진",
    href: "/community/youth",
  },
  {
    title: "청소년부",
    description:
      "중·고등학생들이 말씀과 기도로 뿌리를 내리고 다음 세대 지도자로 세워지는 곳입니다.",
    tag: "매주 주일",
    imageLabel: "청소년부 사진",
    href: "/community/students",
  },
  {
    title: "선교",
    description:
      "국내외 선교 현장을 지원하며 복음의 땅 끝까지 나아가는 청파중앙교회의 사명입니다.",
    tag: "해외선교",
    imageLabel: "선교 사진",
    href: "/community/mission",
  },
];

export default function CommunitySection() {
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-white)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="공동체"
          title="함께 걸어가는 사람들"
          align="center"
          className="mb-12 lg:mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid rgba(43,58,140,0.05)",
              }}
            >
              {/* Image Area */}
              <div className="relative h-44 flex-shrink-0">
                <ImagePlaceholder
                  label={card.imageLabel}
                  aspectRatio="16/9"
                  className="w-full h-full rounded-none"
                />

                {/* Tag — bottom-right overlay */}
                <span
                  className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: "rgba(43,58,140,0.85)" }}
                >
                  {card.tag}
                </span>
              </div>

              {/* Text */}
              <div className="flex flex-col flex-1 p-5 gap-2">
                <h3
                  className="font-serif text-base font-bold leading-snug"
                  style={{ color: "var(--color-dark)" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-sm leading-relaxed flex-1"
                  style={{ color: "var(--color-dark-soft)" }}
                >
                  {card.description}
                </p>
                <div
                  className="flex items-center gap-1 text-xs font-semibold mt-2 transition-colors duration-200"
                  style={{ color: "var(--color-primary)" }}
                >
                  자세히 보기
                  <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
