import type { Metadata } from "next";
import { Target, BookOpen, Shield, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export const metadata: Metadata = {
  title: "교회소개",
  description:
    "1962년 서울 용산구에서 설립된 청파중앙교회를 소개합니다. 담임목사 소개, 교회 역사, 비전, 신앙고백을 확인하세요.",
  openGraph: {
    title: "교회소개 | 청파중앙교회",
    description:
      "1962년 설립, 60년+ 역사의 청파중앙교회. 21세기 지도자를 길러내는 대한예수교 장로회 교회입니다.",
  },
};

// ─── 1. Vision ───────────────────────────────────────────────────────────────

interface VisionItem {
  Icon: LucideIcon;
  title: string;
  description: string;
}

const VISION_ITEMS: VisionItem[] = [
  {
    Icon: Target,
    title: "사명",
    description:
      "다음 세대의 지도자를 말씀과 기도로 세워 세상을 변화시키는 일꾼을 길러내는 것이 청파중앙교회의 사명입니다.",
  },
  {
    Icon: Users,
    title: "공동체",
    description:
      "함께 걸어가는 공동체로서 서로를 섬기고 사랑하며, 그리스도의 몸 된 교회를 이루어 가고자 합니다.",
  },
  {
    Icon: BookOpen,
    title: "말씀",
    description:
      "성경 말씀을 삶의 기준으로 삼고, 하나님의 뜻을 분별하며 순종하는 성도를 세워가는 교회입니다.",
  },
  {
    Icon: Shield,
    title: "선교",
    description:
      "서울 용산에서 시작해 땅 끝까지, 복음의 능력으로 세상을 변화시키는 선교적 공동체를 꿈꿉니다.",
  },
];

// ─── 3. History ──────────────────────────────────────────────────────────────

interface HistoryNode {
  year: string;
  title: string;
  description: string;
  highlight?: boolean;
}

const HISTORY: HistoryNode[] = [
  {
    year: "1962",
    title: "교회 설립",
    description: "서울 용산구 서계동에서 청파중앙교회가 창립예배를 드리며 역사를 시작했습니다.",
    highlight: true,
  },
  {
    year: "1970s",
    title: "성장과 부흥",
    description: "지역사회와 함께 성장하며 교인 수가 늘고 다양한 교육 및 선교 사역이 시작되었습니다.",
  },
  {
    year: "1980s",
    title: "청소년·청년 사역 확대",
    description: "다음 세대를 향한 비전이 구체화되어 청소년부와 청년부가 독립적 사역으로 발전했습니다.",
  },
  {
    year: "1990s",
    title: "선교 사역 본격화",
    description: "국내외 선교에 본격적으로 헌신하며 여러 선교사를 파송하기 시작했습니다.",
  },
  {
    year: "2000s",
    title: "지역 사회 섬김",
    description: "소외된 이웃을 향한 사회봉사 사역이 확대되고, 지역 공동체와 더욱 깊이 연결되었습니다.",
  },
  {
    year: "2010s",
    title: "교회 리뉴얼",
    description: "예배당 리모델링과 사역 구조 재편을 통해 21세기에 맞는 건강한 교회로 새로워졌습니다.",
  },
  {
    year: "2024",
    title: "표어: 우리는 한 가족입니다",
    description: "공동체의 소속감과 뿌리를 강조하며 교회 가족으로서의 정체성을 재확인했습니다.",
  },
  {
    year: "2025",
    title: "표어: 우리는 여행하는 사람들입니다",
    description: "순례의 여정 위에서 함께 걷는 공동체임을 고백하며 신앙의 길을 나아갔습니다.",
  },
  {
    year: "2026",
    title: "표어: 일어나 함께가자",
    description: "행동하는 공동체, 동행의 시작을 선포하며 새로운 60년을 향해 나아가고 있습니다.",
    highlight: true,
  },
];

// ─── 4. Beliefs ──────────────────────────────────────────────────────────────

interface BeliefItem {
  number: string;
  title: string;
  content: string;
}

const BELIEFS: BeliefItem[] = [
  {
    number: "01",
    title: "성경",
    content:
      "신구약 66권 성경은 하나님의 말씀으로서 신앙과 행위의 유일한 표준입니다.",
  },
  {
    number: "02",
    title: "삼위일체 하나님",
    content:
      "하나님은 성부·성자·성령 삼위일체이시며, 영원하시고 전능하신 창조주이십니다.",
  },
  {
    number: "03",
    title: "예수 그리스도",
    content:
      "예수 그리스도는 하나님의 독생자이시며, 동정녀에게서 나시고 죽으시고 부활하셔서 우리의 구원자가 되셨습니다.",
  },
  {
    number: "04",
    title: "성령",
    content:
      "성령은 신자 안에 내주하시며 성화의 사역을 이루시고 교회를 세우시는 하나님이십니다.",
  },
  {
    number: "05",
    title: "구원",
    content:
      "구원은 오직 믿음으로 말미암아 은혜로 받는 것이며, 행위로 얻을 수 없습니다 (엡 2:8-9).",
  },
  {
    number: "06",
    title: "교회와 성례",
    content:
      "교회는 그리스도의 몸이며, 세례와 성찬은 그리스도께서 제정하신 두 가지 성례입니다.",
  },
];

// ─── 5. Staff ────────────────────────────────────────────────────────────────

interface StaffCard {
  name: string;
  role: string;
  department: string;
}

const STAFF: StaffCard[] = [
  { name: "김항우 목사", role: "담임목사", department: "당회장" },
  { name: "교역자", role: "부목사", department: "교육부" },
  { name: "교역자", role: "전도사", department: "청년부" },
  { name: "교역자", role: "전도사", department: "청소년부" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AboutPage() {
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
        aria-label="교회소개 히어로"
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
            교회소개
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
            청파중앙교회를 소개합니다
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            1962년 서울 용산에서 시작된
            <br />
            60년+ 역사의 대한예수교 장로회 교회입니다.
          </p>
        </div>
      </section>

      {/* ── 1. Vision ── */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="비전 & 미션"
            title="21세기 지도자를 길러내는 교회"
            align="center"
            className="mb-6"
          />
          <p
            className="text-base leading-relaxed text-center max-w-2xl mx-auto mb-14"
            style={{ color: "var(--color-dark-soft)" }}
          >
            청파중앙교회는 말씀과 기도, 공동체와 선교를 통해 이 시대에 필요한 지도자를 세우고,
            하나님 나라의 확장을 위해 함께 나아가는 공동체입니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VISION_ITEMS.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-5 rounded-2xl p-6"
                style={{
                  backgroundColor: "var(--color-white)",
                  border: "1px solid rgba(43,58,140,0.07)",
                }}
              >
                <div
                  className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <Icon className="w-5 h-5 text-white" strokeWidth={1.75} />
                </div>
                <div>
                  <p
                    className="text-xs font-bold tracking-widest uppercase mb-2"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Pastor ── */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-white)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="담임목사"
            title="김항우 목사"
            align="center"
            className="mb-14"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Photo */}
            <div className="flex justify-center">
              <div className="relative w-64 sm:w-72">
                <ImagePlaceholder
                  label="담임목사 사진"
                  aspectRatio="4/3"
                  className="rounded-2xl w-full"
                />
                {/* Name badge */}
                <div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-center whitespace-nowrap shadow-lg"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <p className="font-serif text-sm font-bold text-white">김항우 목사</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                    담임목사 · 당회장
                  </p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-5 pt-6 lg:pt-0">
              <div>
                <p
                  className="text-xs font-semibold tracking-[4px] uppercase mb-3"
                  style={{ color: "var(--color-primary)" }}
                >
                  목사 소개
                </p>
                <p className="text-base leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>
                  김항우 목사님은 하나님의 말씀으로 성도들을 세우고,
                  공동체가 함께 그리스도의 형상을 닮아가도록 이끄시는 담임목사님입니다.
                  &ldquo;21세기 지도자를 길러내는 교회&rdquo;라는 비전 아래 청파중앙교회를 섬기고 계십니다.
                </p>
              </div>

              {/* Career */}
              <ul className="flex flex-col gap-3">
                {[
                  { label: "학력", value: "신학대학원 졸업 (M.Div.)" },
                  { label: "약력", value: "청파중앙교회 담임목사" },
                  { label: "교단", value: "대한예수교 장로회" },
                  { label: "연락처", value: "02-714-0041" },
                ].map(({ label, value }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 text-xs font-bold tracking-widest uppercase pt-0.5 w-14"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {label}
                    </span>
                    <span className="text-sm" style={{ color: "var(--color-dark-soft)" }}>
                      {value}
                    </span>
                  </li>
                ))}
              </ul>

              <blockquote
                className="border-l-4 pl-4 italic"
                style={{
                  borderColor: "var(--color-accent)",
                  color: "var(--color-dark-soft)",
                }}
              >
                <p className="text-sm leading-relaxed font-serif">
                  &ldquo;일어나 함께가자 — 우리는 혼자가 아닙니다.
                  하나님이 부르신 길 위에서 함께 걸어가는 공동체가 청파중앙교회입니다.&rdquo;
                </p>
                <footer className="text-xs mt-2 not-italic" style={{ color: "var(--color-primary)" }}>
                  — 김항우 목사
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. History ── */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="교회 역사"
            title="1962년부터 지금까지"
            align="center"
            className="mb-14"
          />

          <ol className="relative flex flex-col gap-0" aria-label="교회 역사 타임라인">
            {HISTORY.map((node, i) => (
              <li key={node.year} className="flex gap-6">
                {/* Left: line + dot */}
                <div className="flex flex-col items-center flex-shrink-0 w-5">
                  {/* dot */}
                  <div
                    className="flex-shrink-0 w-4 h-4 rounded-full mt-1 z-10"
                    style={{
                      backgroundColor: node.highlight
                        ? "var(--color-primary)"
                        : "var(--color-white)",
                      border: `2px solid ${node.highlight ? "var(--color-primary)" : "rgba(43,58,140,0.3)"}`,
                      boxShadow: node.highlight
                        ? "0 0 0 6px color-mix(in srgb, var(--color-primary) 12%, transparent)"
                        : "none",
                    }}
                  />
                  {/* connector */}
                  {i < HISTORY.length - 1 && (
                    <div
                      className="w-0.5 flex-1 my-1"
                      style={{
                        minHeight: "2.5rem",
                        backgroundColor: "rgba(43,58,140,0.15)",
                      }}
                    />
                  )}
                </div>

                {/* Right: content */}
                <div className="pb-8 flex-1">
                  <div className="flex items-baseline gap-3 mb-1.5">
                    <span
                      className="text-xs font-bold tracking-widest"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {node.year}
                    </span>
                    {node.highlight && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: "var(--color-accent)",
                          color: "var(--color-dark)",
                        }}
                      >
                        주요
                      </span>
                    )}
                  </div>
                  <p
                    className="font-serif text-sm font-bold mb-1"
                    style={{ color: "var(--color-dark)" }}
                  >
                    {node.title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>
                    {node.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 4. Beliefs ── */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-primary)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <p
              className="text-xs font-semibold uppercase tracking-[5px] mb-3"
              style={{ color: "var(--color-secondary)" }}
            >
              신앙고백
            </p>
            <h2 className="font-serif text-3xl font-bold text-white mb-4">
              우리가 믿는 것
            </h2>
            <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
              청파중앙교회는 대한예수교 장로회 신앙고백을 따르며
              성경의 권위 위에 세워진 교회입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BELIEFS.map(({ number, title, content }) => (
              <div
                key={number}
                className="rounded-2xl p-5 flex flex-col gap-3"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span
                  className="font-serif text-2xl font-bold"
                  style={{ color: "rgba(255,255,255,0.18)" }}
                >
                  {number}
                </span>
                <p
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: "var(--color-accent)" }}
                >
                  {title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                  {content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Staff ── */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-white)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="교역자"
            title="교역자 소개"
            align="center"
            className="mb-12"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {STAFF.map(({ name, role, department }) => (
              <div
                key={`${name}-${role}`}
                className="flex flex-col items-center gap-4 rounded-2xl p-5 text-center"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid rgba(43,58,140,0.07)",
                }}
              >
                {/* Photo */}
                <div
                  className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--color-bg-warm)" }}
                >
                  <ImagePlaceholder
                    label=""
                    aspectRatio="1/1"
                    className="w-full h-full rounded-full"
                  />
                </div>

                <div>
                  <p
                    className="font-serif text-sm font-bold"
                    style={{ color: "var(--color-dark)" }}
                  >
                    {name}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {role}
                  </p>
                  <span
                    className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: "var(--color-bg-warm)",
                      color: "var(--color-dark-soft)",
                    }}
                  >
                    {department}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
