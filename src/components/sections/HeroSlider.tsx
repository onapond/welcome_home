"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export interface HeroSlide {
  label: string;
  /** 이미 mediaUrl()로 풀어 쓴 주소. 없으면 자리표시를 그린다. */
  imageUrl?: string;
}

export interface HeroSliderProps {
  badge: string;
  headline: string;
  lines: string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  slides: HeroSlide[];
}

const INTERVAL_MS = 5000;

export default function HeroSlider({
  badge,
  headline,
  lines,
  primaryCta,
  secondaryCta,
  slides,
}: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [next, paused, slides.length]);

  const secondaryExternal = /^https?:\/\//.test(secondaryCta.href);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "100svh", minHeight: "600px" }}
      aria-label="히어로 섹션"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/*
        슬라이드는 모두 렌더해두고 CSS opacity로 교차 전환한다.
        JS가 죽어도 첫 슬라이드는 보인다.
      */}
      {slides.map((slide, i) => (
        <div
          key={`${slide.label}-${i}`}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          {slide.imageUrl ? (
            <Image
              src={slide.imageUrl}
              alt={slide.label}
              fill
              sizes="100vw"
              className="object-cover"
              priority={i === 0}
            />
          ) : (
            <ImagePlaceholder
              label={slide.label}
              aspectRatio="16/9"
              className="w-full h-full rounded-none"
              hideLabel
            />
          )}
        </div>
      ))}

      {/* Dark Gradient Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        {/*
          표어와 CTA는 사이트의 첫인상이다. JS 실행 여부와 무관하게 보여야 하므로
          기본 상태를 '보임'으로 두고, 등장 효과는 CSS 애니메이션으로만 얹는다.
        */}
        <div className="flex flex-col items-center gap-6 hero-enter">
          {/* Badge */}
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-[4px] uppercase"
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              color: "var(--color-accent)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(212,168,67,0.3)",
            }}
          >
            {badge}
          </span>

          {/* Main Title */}
          <h1
            className="font-serif font-bold text-white leading-tight"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
          >
            {headline}
          </h1>

          {/* Gold Divider */}
          <div
            className="w-12 h-0.5 mx-auto rounded-full"
            style={{ backgroundColor: "var(--color-accent)" }}
          />

          {/* Subtitle */}
          <p
            className="text-sm sm:text-base leading-relaxed max-w-md"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {lines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:brightness-110"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {primaryCta.label}
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href={secondaryCta.href}
              {...(secondaryExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hero-ghost-button"
            >
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={`${slide.label}-${i}`}
              onClick={() => setCurrent(i)}
              aria-label={`슬라이드 ${i + 1}로 이동`}
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: i === current ? "2.25rem" : "0.5rem",
                backgroundColor:
                  i === current ? "var(--color-primary)" : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
