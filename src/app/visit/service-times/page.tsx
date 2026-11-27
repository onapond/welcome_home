import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Clock, MapPin, Users, ChevronRight, Calendar } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import LocationSection from "@/components/sections/LocationSection";
import { getSite, type Service } from "@/lib/content";
import { getServiceTimesPage } from "@/lib/content/pages";
import { ICONS } from "@/lib/icons";

export function generateMetadata(): Metadata {
  const { meta } = getServiceTimesPage();
  return pageMetadata({
    title: meta.title,
    description: meta.description,
    ogDescription: meta.ogDescription,
    path: "/visit/service-times",
  });
}

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

function ServiceCard({ service }: { service: Service }) {
  const { name: label, time, day: schedule, place: location, audience, description, details, featured: highlight } = service;
  const Icon = ICONS[service.icon];

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
        {location && (
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
        )}
        {audience && (
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
        )}
      </div>

      {/* 설명 */}
      {description && (
        <div className="px-6 pb-4">
          <p
            className="text-sm leading-relaxed"
            style={{ color: highlight ? "rgba(255,255,255,0.8)" : "var(--color-dark-soft)" }}
          >
            {description}
          </p>
        </div>
      )}

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
  const site = getSite();
  const page = getServiceTimesPage();

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
            {page.hero.badge}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
            {page.hero.title}
          </h1>
          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {page.hero.lines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* 2. 정기 예배 */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label={page.regular.label}
            title={page.regular.title}
            align="center"
            className="mb-12"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {site.services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. 특별 예배 */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-white)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label={page.special.label}
            title={page.special.title}
            align="center"
            className="mb-12"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {site.specialServices.map(({ name: label, schedule, description }) => (
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
                {description && (
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-dark-soft)" }}
                  >
                    {description}
                  </p>
                )}
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
            {page.cta.title}
          </h2>
          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            {page.cta.lines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={page.cta.primary.href}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 hover:brightness-110 active:scale-95"
              style={{ backgroundColor: "var(--color-accent)", color: "var(--color-dark)" }}
            >
              {page.cta.primary.label}
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            </Link>
            <Link
              href={page.cta.secondary.href}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-white/20 active:scale-95"
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              {page.cta.secondary.label}
            </Link>
          </div>
        </div>
      </section>

      {/* 5. 오시는 길 */}
      <LocationSection />
    </main>
  );
}
