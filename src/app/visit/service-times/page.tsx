import type { Metadata } from "next";
import Link from "next/link";
import { Sun, Moon, Heart, Sunrise, Clock, MapPin, Users, ChevronRight, Calendar } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import LocationSection from "@/components/sections/LocationSection";

export const metadata: Metadata = {
  title: "예배 안내",
  description:
    "청파중앙교회 예배 시간 안내. 주일예배(11:00), 수요예배(19:30), 금요기도회(21:00), 새벽기도(05:30). 누구나 환영합니다.",
  openGraph: {
    title: "예배 안내 | 청파중앙교회",
    description:
      "청파중앙교회 모든 예배의 시간, 장소, 대상을 안내합니다. 처음 오시는 분도 편안하게 참석하실 수 있습니다.",
  },
};

// ─── 데이터 ─────────────────────────────────────────────────────────────────

const MAIN_SERVICES = [
  {
    id: "sunday",
    label: "주일예배",
    time: "오전 11:00",
    schedule: "매주 일요일",
    location: "본당 (2층)",
    Icon: Sun,
    audience: "전 교인 및 방문객",
    description:
      "한 주의 첫 날, 온 교회가 함께 드리는 주일 본 예배입니다. 찬양과 말씀, 성찬으로 하나님 앞에 나아갑니다.",
    details: [
      "예배 15분 전 도착하시면 자리 안내를 받으실 수 있습니다.",
      "아이들은 본당 입구에서 각 연령부로 안내해 드립니다.",
      "주일예배 후 교회 식당에서 점심 식사를 함께합니다.",
      "주차 지원: 인근 공영주차장 2시간 교회 지원",
    ],
    highlight: true,
  },
  {
    id: "wednesday",
    label: "수요예배",
    time: "오후 7:30",
    schedule: "매주 수요일",
    location: "본당 (2층)",
    Icon: Moon,
    audience: "전 교인",
    description:
      "한 주의 중간, 바쁜 일상 속에서 하나님 앞에 잠시 멈추는 예배입니다. 말씀을 듣고 기도로 새 힘을 얻습니다.",
    details: [
      "약 1시간 내외로 진행됩니다.",
      "직장인도 참석하기 편한 저녁 시간에 진행됩니다.",
      "말씀 중심의 예배로 진행됩니다.",
    ],
    highlight: false,
  },
  {
    id: "friday",
    label: "금요기도회",
    time: "오후 9:00",
    schedule: "매주 금요일",
    location: "본당 (2층)",
    Icon: Heart,
    audience: "전 교인",
    description:
      "교회와 나라, 이웃을 위해 뜨겁게 기도하는 시간입니다. 중보기도와 찬양으로 한 주를 마무리합니다.",
    details: [
      "자유로운 분위기로 진행됩니다.",
      "중보기도 제목을 미리 준비해 오셔도 좋습니다.",
      "늦게 도착하셔도 함께 참여하실 수 있습니다.",
    ],
    highlight: false,
  },
  {
    id: "dawn",
    label: "새벽기도",
    time: "오전 5:30",
    schedule: "월요일 ~ 토요일",
    location: "본당 (2층)",
    Icon: Sunrise,
    audience: "전 교인",
    description:
      "하루를 하나님께 드리며 시작하는 새벽 기도회입니다. 짧은 말씀 묵상과 기도로 하루를 엽니다.",
    details: [
      "약 40분 내외로 진행됩니다.",
      "매일 다른 말씀으로 진행됩니다.",
      "조용한 새벽, 개인 기도 시간도 가질 수 있습니다.",
    ],
    highlight: false,
  },
];

const SPECIAL_SERVICES = [
  {
    label: "부활절 연합예배",
    schedule: "매년 부활절 주일",
    description: "부활의 기쁨을 온 교회가 함께 나누는 특별 연합예배입니다.",
  },
  {
    label: "성탄절 예배",
    schedule: "매년 12월 25일",
    description: "예수님의 탄생을 기뻐하며 드리는 성탄 예배와 찬양제입니다.",
  },
  {
    label: "맥추감사절",
    schedule: "매년 7월 첫째 주일",
    description: "한 해의 첫 결실에 감사드리는 맥추감사절 예배입니다.",
  },
  {
    label: "추수감사절",
    schedule: "매년 11월 셋째 주일",
    description: "한 해의 모든 은혜에 감사드리는 추수감사절 예배입니다.",
  },
];

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

function ServiceCard({
  service,
}: {
  service: (typeof MAIN_SERVICES)[number];
}) {
  const { label, time, schedule, location, Icon, audience, description, details, highlight } = service;

  return (
    <article
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        backgroundColor: highlight ? "var(--color-primary)" : "var(--color-white)",
        border: highlight ? "none" : "1px solid rgba(43,58,140,0.1)",
        boxShadow: highlight ? "0 8px 32px rgba(43,58,140,0.2)" : "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* 상단 헤더 */}
      <div
        className="flex items-center gap-4 px-6 pt-6 pb-5"
        style={{
          borderBottom: highlight
            ? "1px solid rgba(255,255,255,0.15)"
            : "1px solid rgba(43,58,140,0.08)",
        }}
      >
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0"
          style={{
            backgroundColor: highlight ? "rgba(255,255,255,0.15)" : "var(--color-primary)",
          }}
        >
          <Icon
            className="w-6 h-6"
            style={{ color: highlight ? "white" : "white" }}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>
        <div>
          <h3
            className="font-serif text-lg font-bold"
            style={{ color: highlight ? "white" : "var(--color-dark)" }}
          >
            {label}
          </h3>
          {highlight && (
            <span
              className="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-dark)",
              }}
            >
              주요 예배
            </span>
          )}
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="px-6 py-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-1.5">
          <Clock
            className="w-4 h-4 flex-shrink-0"
            style={{ color: highlight ? "rgba(255,255,255,0.7)" : "var(--color-primary)" }}
            strokeWidth={2}
            aria-hidden="true"
          />
          <span
            className="text-sm font-semibold"
            style={{ color: highlight ? "white" : "var(--color-primary)" }}
          >
            {time}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar
            className="w-4 h-4 flex-shrink-0"
            style={{ color: highlight ? "rgba(255,255,255,0.7)" : "var(--color-dark-soft)" }}
            strokeWidth={2}
            aria-hidden="true"
          />
          <span
            className="text-sm"
            style={{ color: highlight ? "rgba(255,255,255,0.85)" : "var(--color-dark-soft)" }}
          >
            {schedule}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin
            className="w-4 h-4 flex-shrink-0"
            style={{ color: highlight ? "rgba(255,255,255,0.7)" : "var(--color-dark-soft)" }}
            strokeWidth={2}
            aria-hidden="true"
          />
          <span
            className="text-sm"
            style={{ color: highlight ? "rgba(255,255,255,0.85)" : "var(--color-dark-soft)" }}
          >
            {location}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users
            className="w-4 h-4 flex-shrink-0"
            style={{ color: highlight ? "rgba(255,255,255,0.7)" : "var(--color-dark-soft)" }}
            strokeWidth={2}
            aria-hidden="true"
          />
          <span
            className="text-sm"
            style={{ color: highlight ? "rgba(255,255,255,0.85)" : "var(--color-dark-soft)" }}
          >
            {audience}
          </span>
        </div>
      </div>

      {/* 설명 */}
      <div className="px-6 pb-4">
        <p
          className="text-sm leading-relaxed"
          style={{ color: highlight ? "rgba(255,255,255,0.8)" : "var(--color-dark-soft)" }}
        >
          {description}
        </p>
      </div>

      {/* 안내 사항 */}
      <div className="px-6 pb-6 mt-auto">
        <ul className="flex flex-col gap-2">
          {details.map((detail, i) => (
            <li key={i} className="flex items-start gap-2">
              <ChevronRight
                className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                style={{ color: highlight ? "var(--color-accent)" : "var(--color-secondary)" }}
                strokeWidth={2.5}
                aria-hidden="true"
              />
              <span
                className="text-xs leading-relaxed"
                style={{ color: highlight ? "rgba(255,255,255,0.75)" : "var(--color-dark-soft)" }}
              >
                {detail}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

// ─── 페이지 ───────────────────────────────────────────────────────────────────

export default function ServiceTimesPage() {
  return (
    <main>
      {/* 1. Hero */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-4"
        style={{
          minHeight: "40vh",
          background:
            "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 60%, var(--color-secondary) 100%)",
        }}
        aria-label="예배 안내 히어로"
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
            예배 안내
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
            하나님 앞에 나아오세요
          </h1>
          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            청파중앙교회는 매주 다양한 예배를 통해
            <br />
            하나님과 만나는 자리를 마련하고 있습니다.
          </p>
        </div>
      </section>

      {/* 2. 정기 예배 */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="정기 예배"
            title="매주 드리는 예배"
            align="center"
            className="mb-12"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MAIN_SERVICES.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. 특별 예배 */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-white)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="특별 예배"
            title="절기 및 특별 예배"
            align="center"
            className="mb-12"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SPECIAL_SERVICES.map(({ label, schedule, description }) => (
              <div
                key={label}
                className="flex flex-col gap-2 rounded-2xl p-6"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid rgba(43,58,140,0.08)",
                }}
              >
                <p
                  className="font-serif text-base font-bold"
                  style={{ color: "var(--color-dark)" }}
                >
                  {label}
                </p>
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--color-primary)" }}
                >
                  {schedule}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-dark-soft)" }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 처음 오시나요 CTA */}
      <section
        className="py-16 lg:py-20"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-snug">
            처음 방문하시나요?
          </h2>
          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            미리 방문 신청을 해주시면 담당 사역자가
            <br />
            편안하게 안내해 드립니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/visit#reservation"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 hover:brightness-110 active:scale-95"
              style={{ backgroundColor: "var(--color-accent)", color: "var(--color-dark)" }}
            >
              방문 신청하기
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            </Link>
            <Link
              href="/visit"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-white/20 active:scale-95"
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              새가족 안내 보기
            </Link>
          </div>
        </div>
      </section>

      {/* 5. 오시는 길 */}
      <LocationSection />
    </main>
  );
}
