"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

const SLIDES = [
  { id: 0, label: "예배 사진 1" },
  { id: 1, label: "예배 사진 2" },
  { id: 2, label: "예배 사진 3" },
] as const;

const INTERVAL_MS = 5000;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [next, paused]);

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
      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          <ImagePlaceholder
            label={slide.label}
            aspectRatio="16/9"
            className="w-full h-full rounded-none"
            hideLabel
          />
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
            2026 표어
          </span>

          {/* Main Title */}
          <h1
            className="font-serif font-bold text-white leading-tight"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
          >
            일어나 함께가자
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
            21세기 지도자를 길러내는 교회
            <br />
            서울 용산, 함께 걸어가는 공동체
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            <Link
              href="/visit/service-times"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:brightness-110"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              예배 안내
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="https://www.youtube.com/channel/UC7Fk-mpsIQlgykLK4lW3t7g"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hero-ghost-button"
            >
              온라인 예배
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
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
    </section>
  );
}
