"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Clock, Pause, Play } from "lucide-react";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import { nextServiceWhen } from "@/lib/schedule";

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
  /** 대표 예배(site.yaml featured) — 「이번 주일 오전 11:00 주일예배」 한 줄 */
  service?: { name: string; day: string; time: string };
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const noSubscribe = () => () => {};

/**
 * 서버 HTML과 첫 렌더는 「매주 일요일」처럼 site.yaml 문구 그대로, 하이드레이션 뒤에
 * 지금 한국 시간 기준 「이번 주일 · 오늘 · 다음 주일」로 바꾼다(하이드레이션 불일치 없음).
 */
function useServiceWhen(service?: { day: string; time: string }): string | null {
  return useSyncExternalStore(
    noSubscribe,
    () => (service ? nextServiceWhen(service.day, service.time) : null),
    () => null,
  );
}

const INTERVAL_MS = 5000;

export default function HeroSlider({
  badge,
  headline,
  lines,
  primaryCta,
  secondaryCta,
  slides,
  service,
}: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  // 자동 전환은 세 경우에 멈춘다: 사용자가 멈춤 버튼을 눌렀을 때, 마우스가 올라와 있을 때,
  // 키보드 포커스가 슬라이드 안에 있을 때(WCAG 2.2.2 일시정지).
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  // 움직임 줄이기를 켠 사용자에게는 자동 전환을 하지 않는다(버튼으로 넘길 수는 있다).
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  const paused = userPaused || hovered || focused || reducedMotion;
  const when = useServiceWhen(service);

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
    // 휴대폰에서는 화면 높이의 78%만 써서 아래 예배 시간 바가 살짝 보이게 한다
    <section
      className="relative w-full overflow-hidden h-[78svh] min-h-[520px] md:h-[100svh] md:min-h-[600px]"
      aria-label="히어로 섹션"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
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
            "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        {/*
          표어와 CTA는 사이트의 첫인상이다. JS 실행 여부와 무관하게 보여야 하므로
          기본 상태를 '보임'으로 두고, 등장 효과는 CSS 애니메이션으로만 얹는다.
        */}
        <div className="flex flex-col items-center gap-6 hero-enter">
          {/* Badge — 사진 밝기와 상관없이 읽히도록 불투명한 남색 칩 위에 골드 글자 */}
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-accent)",
              border: "1px solid rgba(212,168,67,0.45)",
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
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            {lines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>

          {/* 다음 예배 */}
          {service && (
            <p className="inline-flex items-center gap-2 text-sm font-medium text-white">
              <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "var(--color-secondary-light)" }} aria-hidden="true" />
              {when ?? service.day} {service.time} {service.name}
            </p>
          )}

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

      {/* Slide Indicators + 자동 전환 멈춤/재생 */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? "슬라이드 자동 전환 다시 시작" : "슬라이드 자동 전환 멈추기"}
            className="mr-2 flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 hover:bg-white/25"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "var(--color-white)" }}
          >
            {userPaused ? (
              <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            ) : (
              <Pause className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            )}
          </button>
          {slides.map((slide, i) => (
            <button
              key={`${slide.label}-${i}`}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`슬라이드 ${i + 1}로 이동`}
              aria-current={i === current ? "true" : undefined}
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
