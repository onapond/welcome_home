"use client";

import { useState } from "react";
import { ChevronDown, Users, Clock, MapPin } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { getIcon } from "@/lib/icons";
import type { Service } from "@/lib/content/schema";
import type { VisitPage } from "@/lib/content/pages";

// ─── FAQ ─────────────────────────────────────────────────────────────────────

interface FaqItem {
  question: string;
  answer: string;
}


// ─── Accordion Item ───────────────────────────────────────────────────────────

function AccordionItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentId = `faq-content-${index}`;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: "1px solid rgba(43,58,140,0.1)",
        backgroundColor: isOpen ? "var(--color-white)" : "var(--color-bg)",
      }}
    >
      <button
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-200"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="text-sm font-semibold leading-snug" style={{ color: "var(--color-dark)" }}>
          {item.question}
        </span>
        <ChevronDown
          className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
          style={{
            color: "var(--color-primary)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
          strokeWidth={2}
        />
      </button>

      <div
        id={contentId}
        role="region"
        aria-hidden={!isOpen}
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? "300px" : "0px" }}
      >
        <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>
          {item.answer}
        </p>
      </div>
    </div>
  );
}

// ─── Visit Form ───────────────────────────────────────────────────────────────

// 예배 선택지는 site.yaml의 예배 목록에서 온다. 서버(api/visit)도 같은 이름 목록으로 검증한다.
function VisitForm({
  services,
  phone,
  copy,
}: {
  services: Service[];
  phone: string;
  copy: VisitPage["reservation"];
}) {
  const serviceOptions = services.map((s) => ({ value: s.name, label: `${s.name} (${s.time})` }));
  const EMPTY_VISIT_FORM = {
    name: "",
    phone: "",
    service: serviceOptions[0]?.value ?? "",
    count: "1",
    memo: "",
  };
  const [form, setForm] = useState(EMPTY_VISIT_FORM);
  const [consent, setConsent] = useState(false);
  // 허니팟 — 사람에게 보이지 않으므로 값이 차면 봇이다
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // 중복 제출 방지

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, consent, website }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // 서버 검증 실패 시 첫 번째 항목을, 그 외에는 서버 메시지를 보여준다
        const fieldMessage = Array.isArray(data.errors) ? data.errors[0]?.message : null;
        setError(
          fieldMessage ??
            data.message ??
            `신청을 접수하지 못했습니다. ${phone}로 전화 주시면 도와드리겠습니다.`
        );
        return;
      }

      setSubmitted(true);
      setForm(EMPTY_VISIT_FORM);
      setConsent(false);
    } catch {
      setError("네트워크 오류로 신청을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2";
  const inputStyle = {
    backgroundColor: "var(--color-bg)",
    border: "1px solid rgba(43,58,140,0.15)",
    color: "var(--color-dark)",
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {submitted && (
        <div
          role="status"
          className="rounded-xl px-5 py-4 text-sm font-medium"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, white)",
            border: "1px solid color-mix(in srgb, var(--color-primary) 25%, white)",
            color: "var(--color-primary)",
          }}
        >
          {copy.successMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl px-5 py-4 text-sm font-medium"
          style={{
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            color: "#B91C1C",
          }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="visit-name" className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--color-primary)" }}>
            이름 <span aria-hidden="true" style={{ color: "#e53e3e" }}>*</span>
            <span className="sr-only">(필수)</span>
          </label>
          <input
            id="visit-name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="홍길동"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="visit-phone" className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--color-primary)" }}>
            연락처 <span aria-hidden="true" style={{ color: "#e53e3e" }}>*</span>
            <span className="sr-only">(필수)</span>
          </label>
          <input
            id="visit-phone"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="010-0000-0000"
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--color-primary)" }}>
          예배 선택 <span aria-hidden="true" style={{ color: "#e53e3e" }}>*</span>
          <span className="sr-only">(필수)</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {serviceOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200"
              style={{
                backgroundColor:
                  form.service === option.value ? "color-mix(in srgb, var(--color-primary) 8%, white)" : "var(--color-bg)",
                border:
                  form.service === option.value
                    ? "1px solid color-mix(in srgb, var(--color-primary) 35%, white)"
                    : "1px solid rgba(43,58,140,0.12)",
              }}
            >
              <input
                type="radio"
                name="service"
                value={option.value}
                checked={form.service === option.value}
                onChange={handleChange}
                style={{ accentColor: "var(--color-primary)" }}
              />
              <span className="text-sm" style={{ color: "var(--color-dark)" }}>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="visit-count" className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--color-primary)" }}>
            인원수
          </label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--color-dark-soft)" }} strokeWidth={1.75} />
            <select
              id="visit-count"
              name="count"
              value={form.count}
              onChange={handleChange}
              className={inputClass}
              style={{ ...inputStyle, paddingLeft: "2.5rem" }}
            >
              {["1", "2", "3", "4", "5명 이상"].map((n) => (
                <option key={n} value={n}>{n}명</option>
              ))}
            </select>
          </div>
        </div>
        <div className="hidden sm:block" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="visit-memo" className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--color-primary)" }}>
          남기실 말씀
        </label>
        <textarea
          id="visit-memo"
          name="memo"
          value={form.memo}
          onChange={handleChange}
          placeholder="궁금하신 점이나 미리 알려주실 내용을 적어주세요."
          rows={3}
          className={inputClass}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {/* 허니팟 — 화면·스크린리더 모두에서 감춘다 */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0 }}>
        <label htmlFor="visit-website">이 항목은 비워두세요</label>
        <input
          id="visit-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <label className="flex items-start gap-3 text-sm cursor-pointer" style={{ color: "var(--color-dark-soft)" }}>
        <input
          type="checkbox"
          name="consent"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
          className="mt-0.5 flex-shrink-0"
          style={{ accentColor: "var(--color-primary)" }}
        />
        <span>
          방문 안내를 위해 이름과 연락처를 수집하는 데 동의합니다.
          수집한 정보는 안내 목적으로만 사용하며, 안내가 끝나면 파기합니다.
          <span aria-hidden="true" style={{ color: "#e53e3e" }}> *</span>
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="self-start inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {loading ? "신청 중..." : copy.submitLabel}
      </button>
    </form>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function VisitClient({
  page,
  services,
  phone,
  locationSlot,
}: {
  page: VisitPage;
  services: Service[];
  phone: string;
  /** 서버에서 렌더한 「오시는 길」 섹션 */
  locationSlot: React.ReactNode;
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function toggleFaq(i: number) {
    setOpenFaq((prev) => (prev === i ? null : i));
  }

  return (
    <main>
      {/* 1. Hero Banner */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-4"
        style={{
          minHeight: "40vh",
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 60%, var(--color-secondary) 100%)",
        }}
        aria-label="새가족 안내 히어로"
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
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            {page.hero.lines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* 2. FAQ */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label={page.faq.label} title={page.faq.title} align="center" className="mb-12" />
          <div className="flex flex-col gap-3" role="list">
            {page.faq.items.map((faq, i) => (
              <div key={i} role="listitem">
                <AccordionItem
                  item={faq}
                  index={i}
                  isOpen={openFaq === i}
                  onToggle={() => toggleFaq(i)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Service Cards */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-white)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label={page.services.label} title={page.services.title} align="center" className="mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {services.map((service) => {
              const Icon = getIcon(service.icon);
              const { name: label, time, day, description } = service;
              return (
              <div
                key={service.id}
                className="flex flex-col gap-4 rounded-2xl p-6"
                style={{ backgroundColor: "var(--color-bg)", border: "1px solid rgba(43,58,140,0.08)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    <Icon className="w-5 h-5 text-white" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <p className="font-serif text-base font-bold" style={{ color: "var(--color-dark)" }}>
                    {label}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--color-primary)" }} strokeWidth={2} aria-hidden="true" />
                    <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>{time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--color-dark-soft)" }} strokeWidth={2} aria-hidden="true" />
                    <span className="text-sm" style={{ color: "var(--color-dark-soft)" }}>{day}</span>
                  </div>
                </div>
                {description && (
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>{description}</p>
                )}
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Visit Form */}
      <section id="reservation" className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label={page.reservation.label} title={page.reservation.title} align="center" className="mb-3" />
          <p className="text-sm text-center mb-12" style={{ color: "var(--color-dark-soft)" }}>
            {page.reservation.intro}
          </p>
          <VisitForm services={services} phone={phone} copy={page.reservation} />
        </div>
      </section>

      {/* 5. Location */}
      {locationSlot}
    </main>
  );
}
