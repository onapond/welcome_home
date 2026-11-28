import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Youtube, ChevronRight, MapPin } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import { getSite } from "@/lib/content";
import { getCommunityPage, type CommunityGroup } from "@/lib/content/pages";
import { mediaUrl } from "@/lib/media";

export function generateMetadata(): Metadata {
  const { meta } = getCommunityPage();
  return pageMetadata({
    title: meta.title,
    description: meta.description,
    ogDescription: meta.ogDescription,
    path: "/community",
  });
}

/** content의 색 이름 → 브랜드 색 변수 */
const GROUP_COLOR: Record<CommunityGroup["color"], string> = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  accent: "var(--color-accent)",
  "primary-light": "var(--color-primary-light)",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const site = getSite();
  const page = getCommunityPage();

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
        aria-label="공동체 히어로"
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
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            {page.hero.title}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed max-w-md" style={{ color: "var(--color-white)" }}>
            {page.hero.lines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* ── Groups ── */}
      {page.groups.map((group, i) => {
        const isEven = i % 2 === 0;
        const color = GROUP_COLOR[group.color];
        // 글자는 밝은 배경에서도 읽히도록 남색 계열만 쓴다(하늘색 · 골드는 장식 칸에만).
        const textColor = group.color === "primary-light" ? "var(--color-primary-light)" : "var(--color-primary)";
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
                    {group.image ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={mediaUrl(group.image)}
                          alt={`${group.title} 사진`}
                          fill
                          sizes="(min-width: 1024px) 50vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <ImagePlaceholder
                        className="w-full h-full"
                        label={`${group.title} 사진`}
                      />
                    )}
                  </div>
                </div>

                {/* Text */}
                <div className="w-full lg:w-1/2 flex flex-col gap-6">
                  {/* Label */}
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-xl"
                      style={{ backgroundColor: color, opacity: 0.12 }}
                    />
                    <span
                      className="text-xs font-bold"
                      style={{ color: textColor }}
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
                        <dt className="text-xs font-semibold mb-1" style={{ color: textColor }}>
                          {label}
                        </dt>
                        <dd className="text-sm font-medium" style={{ color: "var(--color-dark)" }}>
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {/* Social Links (showSnsLinks: true 인 공동체만) */}
                  {group.showSnsLinks && (site.sns.instagram || site.sns.youtube) && (
                    <div className="flex gap-3">
                      {site.sns.instagram && (
                        <a
                          href={site.sns.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:brightness-110"
                          style={{ backgroundColor: "var(--color-primary)", color: "white" }}
                        >
                          <Instagram className="w-4 h-4" />
                          인스타그램
                        </a>
                      )}
                      {site.sns.youtube && (
                        <a
                          href={site.sns.youtube}
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
                      )}
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
            label={page.cta.label}
            title={page.cta.title}
            align="center"
            className="mb-4"
            onDark
          />
          <p className="text-sm sm:text-base leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.75)" }}>
            {page.cta.text}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={page.cta.primary.href}
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-white transition-all hover:brightness-110"
              style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              {page.cta.primary.label}
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href={page.cta.secondary.href}
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-all hover:brightness-110"
              style={{ backgroundColor: "white", color: "var(--color-primary)" }}
            >
              <MapPin className="w-4 h-4" />
              {page.cta.secondary.label}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
