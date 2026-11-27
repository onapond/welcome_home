import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import { getSite } from "@/lib/content";
import {
  formatHistoryDate,
  getAboutPage,
  getHistory,
  getStaff,
  groupHistoryByDecade,
} from "@/lib/content/pages";
import { getIcon } from "@/lib/icons";
import { mediaUrl } from "@/lib/media";

export function generateMetadata(): Metadata {
  const { meta } = getAboutPage();
  return pageMetadata({
    title: meta.title,
    description: meta.description,
    ogDescription: meta.ogDescription,
    path: "/about",
  });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const site = getSite();
  const page = getAboutPage();
  const staff = getStaff();
  const history = getHistory();
  const milestones = history
    .filter((e) => e.highlight)
    .sort((a, b) => a.date.localeCompare(b.date));
  const decades = groupHistoryByDecade(history);

  return (
    <main>
      {/* ── Hero ── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-4"
        style={{
          minHeight: "40vh",
          background:
            "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 70%, var(--color-secondary) 120%)",
        }}
        aria-label="교회소개 히어로"
      >
        <div className="flex flex-col items-center gap-4 max-w-xl">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-white)",
              border: "1px solid rgba(143,215,239,0.45)",
            }}
          >
            {page.hero.badge}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
            {page.hero.title}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--color-white)" }}>
            {page.hero.lines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* ── 1. Vision ── */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label={page.vision.label}
            title={page.vision.title}
            align="center"
            className="mb-6"
          />
          <p
            className="text-base leading-relaxed text-center max-w-2xl mx-auto mb-14"
            style={{ color: "var(--color-dark-soft)" }}
          >
            {page.vision.intro}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {page.vision.items.map(({ icon, title, text }) => {
              const Icon = getIcon(icon);
              return (
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
                    className="text-xs font-bold mb-2"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>
                    {text}
                  </p>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 2. Pastor ── */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-white)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label={page.pastor.label}
            title={site.pastor}
            align="center"
            className="mb-14"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Photo */}
            <div className="flex justify-center">
              <div className="relative w-64 sm:w-72">
                {page.pastor.photo ? (
                  <div className="relative aspect-[4/5] w-full">
                    <Image
                      src={mediaUrl(page.pastor.photo)}
                      alt={`${site.pastor} 사진`}
                      fill
                      sizes="288px"
                      className="object-cover object-top rounded-2xl"
                    />
                  </div>
                ) : (
                  <ImagePlaceholder
                    label={`${site.pastor} 사진`}
                    aspectRatio="4/3"
                    className="rounded-2xl w-full"
                  />
                )}
                {/* Name badge */}
                <div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-center whitespace-nowrap shadow-lg"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <p className="font-serif text-sm font-bold text-white">{site.pastor}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {page.pastor.roleLine}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-5 pt-6 lg:pt-0">
              <div>
                <p
                  className="text-xs font-semibold mb-3"
                  style={{ color: "var(--color-primary)" }}
                >
                  {page.pastor.bioLabel}
                </p>
                <p className="text-base leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>
                  {page.pastor.bio}
                </p>
              </div>

              {/* Career */}
              <ul className="flex flex-col gap-3">
                {page.pastor.career.map(({ label, value }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 text-xs font-bold pt-0.5 w-14"
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
                  &ldquo;{page.pastor.quote.text}&rdquo;
                </p>
                <footer className="text-xs mt-2 not-italic" style={{ color: "var(--color-primary)" }}>
                  — {page.pastor.quote.by}
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
            label={page.history.label}
            title={page.history.title}
            align="center"
            className="mb-14"
          />

          {/* 주요 연혁 (history.yaml에서 highlight: true 인 항목) */}
          {milestones.length > 0 && (
            <ol className="relative flex flex-col gap-0" aria-label="주요 연혁 타임라인">
              {milestones.map((node, i) => (
                <li key={`${node.date}-${i}`} className="flex gap-6">
                  {/* Left: line + dot */}
                  <div className="flex flex-col items-center flex-shrink-0 w-5">
                    <div
                      className="flex-shrink-0 w-4 h-4 rounded-full mt-1 z-10"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        border: "2px solid var(--color-primary)",
                        boxShadow: "0 0 0 6px color-mix(in srgb, var(--color-primary) 12%, transparent)",
                      }}
                    />
                    {i < milestones.length - 1 && (
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
                        className="text-xs font-bold tracking-wide"
                        style={{ color: "var(--color-primary)" }}
                      >
                        {formatHistoryDate(node.date)}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: "var(--color-accent)",
                          color: "var(--color-dark)",
                        }}
                      >
                        주요
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>
                      {node.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {/* 연혁 전체 — 10년 단위로 접어 두어 수백 건이어도 페이지가 길어지지 않는다 */}
          <div className={milestones.length > 0 ? "mt-10" : ""}>
            <h3
              className="font-serif text-lg font-bold mb-4"
              style={{ color: "var(--color-dark)" }}
            >
              {page.history.allLabel}
            </h3>
            <div className="flex flex-col gap-3">
              {decades.map((decade, di) => (
                <details
                  key={decade.decade}
                  open={di === 0}
                  className="rounded-xl"
                  style={{
                    backgroundColor: "var(--color-white)",
                    border: "1px solid rgba(43,58,140,0.08)",
                  }}
                >
                  <summary
                    className="cursor-pointer px-5 py-4 text-sm font-semibold"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {decade.label}
                    <span className="ml-2 text-xs font-medium" style={{ color: "var(--color-dark-soft)" }}>
                      {decade.entries.length}건
                    </span>
                  </summary>
                  <ul className="flex flex-col gap-3 px-5 pb-5">
                    {decade.entries.map((entry, ei) => (
                      <li key={`${entry.date}-${ei}`} className="flex gap-4 text-sm leading-relaxed">
                        <span
                          className="w-24 flex-shrink-0 font-semibold tabular-nums"
                          style={{ color: "var(--color-primary)" }}
                        >
                          {formatHistoryDate(entry.date)}
                        </span>
                        <span style={{ color: "var(--color-dark-soft)" }}>{entry.text}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Beliefs ── */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-primary)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <p
              className="text-xs font-semibold mb-3"
              style={{ color: "var(--color-secondary)" }}
            >
              {page.beliefs.label}
            </p>
            <h2 className="font-serif text-3xl font-bold text-white mb-4">
              {page.beliefs.title}
            </h2>
            <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
              {page.beliefs.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {page.beliefs.items.map(({ title, text }, i) => {
              const number = String(i + 1).padStart(2, "0");
              return (
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
                  className="text-xs font-bold"
                  style={{ color: "var(--color-secondary-light)" }}
                >
                  {title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                  {text}
                </p>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. Staff ── */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-white)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label={page.staff.label}
            title={page.staff.title}
            align="center"
            className="mb-12"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {staff.map((person) => (
              <div
                key={`${person.name}-${person.role}`}
                className="flex flex-col items-center gap-4 rounded-2xl p-5 text-center"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid rgba(43,58,140,0.07)",
                }}
              >
                {/* Photo */}
                <div
                  className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--color-bg-warm)" }}
                >
                  {person.photo ? (
                    <Image
                      src={mediaUrl(person.photo)}
                      alt={`${person.name} ${person.role}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <ImagePlaceholder
                      label=""
                      aspectRatio="1/1"
                      className="w-full h-full rounded-full"
                    />
                  )}
                </div>

                <div>
                  <p
                    className="font-serif text-sm font-bold"
                    style={{ color: "var(--color-dark)" }}
                  >
                    {person.name}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {person.role}
                  </p>
                  {person.group && (
                    <span
                      className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: "var(--color-bg-warm)",
                        color: "var(--color-dark-soft)",
                      }}
                    >
                      {person.group}
                    </span>
                  )}
                  {person.publishContact && (person.phone || person.email) && (
                    <p className="mt-2 text-xs" style={{ color: "var(--color-dark-soft)" }}>
                      {person.phone}
                      {person.phone && person.email && <br />}
                      {person.email}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
