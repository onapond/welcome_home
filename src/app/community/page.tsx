import type { Metadata } from "next";
import Link from "next/link";
import {
  Users, Music, Globe, Heart,
  Instagram, Youtube, ChevronRight, MapPin,
} from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export const metadata: Metadata = {
  title: "공동체 | 청파중앙교회",
  description: "청파중앙교회의 다양한 공동체를 소개합니다. 청년부 United, 청소년부, 선교, 소그룹/구역.",
};

// ─── Community Groups ─────────────────────────────────────────────────────────

const GROUPS = [
  {
    id: "youth",
    label: "청년부",
    title: "청년부 United",
    subtitle: "@chungpa_united",
    description:
      "20~30대 청년들이 함께 예배하고, 말씀 안에서 성장하며, 서로를 세워가는 공동체입니다. 주일 2부 예배(오후 1시)와 다양한 소모임을 통해 함께 합니다.",
    tags: ["주일 1PM", "소모임", "수련회"],
    color: "var(--color-primary)",
    Icon: Users,
    instagram: "https://www.instagram.com/chungpa_united",
    youtube: "https://www.youtube.com/channel/UC7Fk-mpsIQlgykLK4lW3t7g",
    details: [
      { label: "예배 시간", value: "주일 오후 1:00" },
      { label: "장소", value: "청년부 예배실" },
      { label: "대상", value: "20~30대 청년" },
      { label: "문의", value: "02-714-0041" },
    ],
  },
  {
    id: "students",
    label: "청소년부",
    title: "청소년부",
    subtitle: "중·고등학생 공동체",
    description:
      "중학생·고등학생이 함께하는 청소년부입니다. 말씀과 찬양, 또래 친구들과의 교제를 통해 하나님을 알아가며 건강한 신앙을 키웁니다.",
    tags: ["주일 11AM", "캠프", "전도"],
    color: "var(--color-secondary)",
    Icon: Heart,
    details: [
      { label: "예배 시간", value: "주일 오전 11:00" },
      { label: "장소", value: "청소년부 예배실" },
      { label: "대상", value: "중·고등학생" },
      { label: "문의", value: "02-714-0042" },
    ],
  },
  {
    id: "mission",
    label: "선교",
    title: "선교",
    subtitle: "국내·해외 선교",
    description:
      "청파중앙교회는 여러 선교사님과 함께 국내외 선교를 지원합니다. 단기 선교팀 파송, 선교 헌금, 기도 파트너십을 통해 복음을 전합니다.",
    tags: ["해외선교", "단기팀", "기도"],
    color: "var(--color-accent)",
    Icon: Globe,
    details: [
      { label: "파송 선교사", value: "다수" },
      { label: "지역", value: "아시아·아프리카" },
      { label: "단기 선교", value: "연 1~2회" },
      { label: "문의", value: "02-714-0041" },
    ],
  },
  {
    id: "groups",
    label: "소그룹",
    title: "소그룹 / 구역",
    subtitle: "함께 나누는 삶",
    description:
      "교회 내 지역별·연령별 소그룹(구역)에서 말씀을 나누고 서로의 삶을 돌봅니다. 매주 각 가정에서 모여 기도하고 교제합니다.",
    tags: ["주중 모임", "가정 방문", "중보기도"],
    color: "var(--color-primary-light)",
    Icon: Music,
    details: [
      { label: "모임 주기", value: "매주" },
      { label: "장소", value: "각 가정" },
      { label: "인원", value: "6~12명" },
      { label: "문의", value: "02-714-0041" },
    ],
  },
] as const;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-4"
        style={{
          minHeight: "40vh",
          background:
            "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 60%, var(--color-secondary) 100%)",
        }}
        aria-label="공동체 히어로"
      >
        <div className="flex flex-col items-center gap-4 max-w-xl">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-[4px] uppercase"
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              color: "var(--color-accent)",
              border: "1px solid rgba(212,168,67,0.35)",
            }}
          >
            공동체
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            함께 걸어가는 사람들
          </h1>
          <p className="text-sm sm:text-base leading-relaxed max-w-md" style={{ color: "rgba(255,255,255,0.75)" }}>
            나이와 형편이 달라도 같은 믿음 안에서 하나가 됩니다.
            <br />
            청파중앙교회의 다양한 공동체에 함께하세요.
          </p>
        </div>
      </section>

      {/* ── Groups ── */}
      {GROUPS.map((group, i) => {
        const isEven = i % 2 === 0;
        return (
          <section
            key={group.id}
            id={group.id}
            className="py-20 lg:py-28"
            style={{ backgroundColor: isEven ? "var(--color-bg)" : "var(--color-white)" }}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className={[
                  "flex flex-col gap-12 lg:gap-16 items-center",
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse",
                ].join(" ")}
              >
                {/* Image */}
                <div className="w-full lg:w-1/2">
                  <div className="w-full rounded-3xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                    <ImagePlaceholder
                      className="w-full h-full"
                      label={`${group.title} 사진`}
                    />
                  </div>
                </div>

                {/* Text */}
                <div className="w-full lg:w-1/2 flex flex-col gap-6">
                  {/* Label */}
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-xl"
                      style={{ backgroundColor: group.color, opacity: 0.12 }}
                    />
                    <span
                      className="text-xs font-bold tracking-[4px] uppercase"
                      style={{ color: group.color }}
                    >
                      {group.label}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-1" style={{ color: "var(--color-dark)" }}>
                      {group.title}
                    </h2>
                    <p className="text-sm" style={{ color: "var(--color-dark-soft)" }}>
                      {group.subtitle}
                    </p>
                  </div>

                  <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>
                    {group.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: "var(--color-bg-warm)",
                          color: "var(--color-primary)",
                          border: "1px solid rgba(43,58,140,0.1)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Details Grid */}
                  <dl className="grid grid-cols-2 gap-3">
                    {group.details.map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-xl p-4"
                        style={{
                          backgroundColor: "var(--color-bg-warm)",
                          border: "1px solid rgba(43,58,140,0.07)",
                        }}
                      >
                        <dt className="text-xs font-semibold mb-1" style={{ color: group.color }}>
                          {label}
                        </dt>
                        <dd className="text-sm font-medium" style={{ color: "var(--color-dark)" }}>
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {/* Social Links (청년부만) */}
                  {"instagram" in group && (
                    <div className="flex gap-3">
                      <a
                        href={group.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:brightness-110"
                        style={{ backgroundColor: "var(--color-primary)", color: "white" }}
                      >
                        <Instagram className="w-4 h-4" />
                        인스타그램
                      </a>
                      <a
                        href={group.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:brightness-110"
                        style={{
                          backgroundColor: "var(--color-bg-warm)",
                          color: "var(--color-primary)",
                          border: "1px solid rgba(43,58,140,0.15)",
                        }}
                      >
                        <Youtube className="w-4 h-4" />
                        유튜브
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ── CTA ── */}
      <section
        className="py-20 text-center"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div className="max-w-xl mx-auto px-4">
          <SectionHeader
            label="함께해요"
            title="공동체에 참여하기"
            align="center"
            className="mb-4"
          />
          <p className="text-sm sm:text-base leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.75)" }}>
            어느 공동체든 처음이라면 담당 사역자가 따뜻하게 안내해 드립니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/visit#reservation"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-white transition-all hover:brightness-110"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              방문 예약하기
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-all hover:brightness-110"
              style={{ backgroundColor: "white", color: "var(--color-primary)" }}
            >
              <MapPin className="w-4 h-4" />
              문의하기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
