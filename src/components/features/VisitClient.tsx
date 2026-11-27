"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ChevronDown, Users, Clock, MapPin, CalendarDays } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import PhoneLinkText from "@/components/ui/PhoneLinkText";
import { getIcon } from "@/lib/icons";
import { VISIT_COUNT_OPTIONS } from "@/lib/forms";
import {
  formatKoreanDate,
  kstNow,
  upcomingServiceDates,
  VISIT_DATE_UNDECIDED,
  type KstNow,
} from "@/lib/schedule";
import type { Service } from "@/lib/content/schema";
import type { VisitPage } from "@/lib/content/pages";

// ─── 처음 오시면 이렇게 진행돼요 ─────────────────────────────────────────────

function VisitSteps({ steps }: { steps: NonNullable<VisitPage["steps"]> }) {
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-white)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader label={steps.label} title={steps.title} align="center" className="mb-12 lg:mb-16" />
        <ol className="relative grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* 단계를 잇는 선 — 휴대폰은 세로, 넓은 화면은 가로 */}
          <span
            aria-hidden="true"
            className="absolute left-6 top-6 bottom-6 w-px lg:left-[10%] lg:right-[10%] lg:top-6 lg:bottom-auto lg:w-auto lg:h-px"
            style={{ backgroundColor: "rgba(43,58,140,0.15)" }}
          />
          {steps.items.map((step, i) => {
            const Icon = getIcon(step.icon);
            return (
              <li key={step.title} className="relative flex lg:flex-col items-start lg:items-center gap-5 lg:gap-4 lg:text-center">
                <span
                  className="relative flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <Icon className="w-5 h-5 text-white" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="pt-1 lg:pt-0">
                  <p className="text-xs font-bold tracking-wide mb-1" style={{ color: "var(--color-primary-light)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-serif text-lg font-bold mb-1.5" style={{ color: "var(--color-dark)" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>
                    {step.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

// ─── FAQ — <details>라 답변 길이와 상관없이 다 보이고, JS 없이도 열린다 ─────────

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details
      className="group rounded-xl overflow-hidden bg-[var(--color-bg)] open:bg-white"
      style={{ border: "1px solid rgba(43,58,140,0.1)" }}
    >
      <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-semibold leading-snug" style={{ color: "var(--color-dark)" }}>
          {question}
        </span>
        <ChevronDown
          className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-open:rotate-180"
          style={{ color: "var(--color-primary)" }}
          strokeWidth={2}
          aria-hidden="true"
        />
      </summary>
      <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>
        {answer}
      </p>
    </details>
  );
}

// ─── Visit Form ───────────────────────────────────────────────────────────────

type FieldName = "name" | "phone" | "service" | "date" | "count" | "memo" | "consent";
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ["name", "phone", "service", "date", "count", "memo", "consent"];
const FIELD_ID: Record<FieldName, string> = {
  name: "visit-name",
  phone: "visit-phone",
  service: "visit-service-0",
  date: "visit-date",
  count: "visit-count",
  memo: "visit-memo",
  consent: "visit-consent",
};
const VISIT_DATE_COUNT = 6;

const noSubscribe = () => () => {};

/**
 * 지금 한국 시간. 서버 HTML(빌드 시각)과 첫 렌더에는 null이라 날짜 선택지가 비어 있고,
 * 하이드레이션 뒤에 채워진다 — 날짜가 서버와 브라우저에서 달라 생기는 불일치를 막는다.
 */
function useKstNow(): KstNow | null {
  const key = useSyncExternalStore(
    noSubscribe,
    () => {
      const n = kstNow();
      return `${n.date}|${n.weekday}|${n.minutes}`;
    },
    () => "",
  );
  return useMemo(() => {
    if (!key) return null;
    const [date, weekday, minutes] = key.split("|");
    return { date, weekday: Number(weekday), minutes: Number(minutes) };
  }, [key]);
}

/** 서버와 같은 기준의 간단한 검사 — 서버(api/visit)가 최종 검증한다 */
function checkVisitForm(form: { name: string; phone: string; date: string }, consent: boolean): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = "이름을 입력해 주세요.";
  const digits = form.phone.trim().replace(/^\+?82/, "0").replace(/\D/g, "");
  if (!form.phone.trim()) errors.phone = "연락처를 입력해 주세요.";
  else if (digits.length < 9 || digits.length > 11) errors.phone = "연락처 형식을 확인해 주세요.";
  if (!form.date) errors.date = "방문 희망일을 선택해 주세요.";
  if (!consent) errors.consent = "개인정보 수집·이용에 동의해 주세요.";
  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs font-medium" style={{ color: "#B91C1C" }}>
      {message}
    </p>
  );
}

// 예배 선택지는 site.yaml의 예배 목록에서 온다. 서버(api/visit)도 같은 이름 목록으로 검증한다.
function VisitForm({
  services,
  phone,
  phoneHref,
  copy,
  consentCopy,
}: {
  services: Service[];
  phone: string;
  phoneHref: string;
  copy: VisitPage["reservation"];
  consentCopy: { text: string; linkLabel: string };
}) {
  const serviceOptions = services.map((s) => ({ value: s.name, label: `${s.name} (${s.time})`, service: s }));
  const EMPTY_VISIT_FORM = {
    name: "",
    phone: "",
    service: serviceOptions[0]?.value ?? "",
    date: "",
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const now = useKstNow();
  const selected = serviceOptions.find((o) => o.value === form.service)?.service;
  const dateOptions = useMemo(
    () =>
      now && selected
        ? upcomingServiceDates(selected.day, selected.time, VISIT_DATE_COUNT, now).map((d) => ({
            value: d,
            label: formatKoreanDate(d),
          }))
        : [],
    [now, selected],
  );

  function clearFieldError(name: FieldName) {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // 예배를 바꾸면 그 예배 요일이 아닌 날짜는 다시 고르게 한다
      if (name === "service" && prev.date && prev.date !== VISIT_DATE_UNDECIDED) {
        const svc = serviceOptions.find((o) => o.value === value)?.service;
        const ok = svc && now && upcomingServiceDates(svc.day, svc.time, VISIT_DATE_COUNT, now).includes(prev.date);
        if (!ok) next.date = "";
      }
      return next;
    });
    clearFieldError(name as FieldName);
  }

  function showErrors(errors: FieldErrors) {
    setFieldErrors(errors);
    const first = FIELD_ORDER.find((f) => errors[f]);
    if (first) {
      // 첫 번째로 틀린 칸으로 포커스를 옮긴다
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`#${FIELD_ID[first]}`)?.focus());
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // 중복 제출 방지

    setError(null);
    const errors = checkVisitForm(form, consent);
    if (Object.keys(errors).length > 0) {
      showErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, consent, website }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // 서버 검증 실패는 칸마다, 그 외에는 서버 메시지를 위에 보여 준다
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          const errs: FieldErrors = {};
          for (const item of data.errors as { field?: string; message?: string }[]) {
            if (item.field && item.message && FIELD_ORDER.includes(item.field as FieldName)) {
              errs[item.field as FieldName] ??= item.message;
            }
          }
          if (Object.keys(errs).length > 0) {
            showErrors(errs);
            return;
          }
        }
        setError(data.message ?? `신청을 접수하지 못했습니다. ${phone}로 전화 주시면 도와드리겠습니다.`);
        return;
      }

      setSubmitted(true);
      setForm(EMPTY_VISIT_FORM);
      setConsent(false);
    } catch {
      setError(`네트워크 오류로 신청을 보내지 못했습니다. 잠시 후 다시 시도하시거나 ${phone}로 전화 주세요.`);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2";
  const inputStyle = (invalid: boolean) => ({
    backgroundColor: "var(--color-bg)",
    border: invalid ? "1px solid #B91C1C" : "1px solid rgba(43,58,140,0.15)",
    color: "var(--color-dark)",
  });
  const labelClass = "text-sm font-semibold";
  const labelStyle = { color: "var(--color-primary)" };
  const errId = (f: FieldName) => `${FIELD_ID[f]}-error`;
  const aria = (f: FieldName) =>
    fieldErrors[f] ? { "aria-invalid": true as const, "aria-describedby": errId(f) } : {};
  const errorCount = Object.keys(fieldErrors).length;

  const Required = () => (
    <>
      <span aria-hidden="true" style={{ color: "#B91C1C" }}> *</span>
      <span className="sr-only">(필수)</span>
    </>
  );

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
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

      {(error || errorCount > 0) && (
        <div
          role="alert"
          className="rounded-xl px-5 py-4 text-sm font-medium"
          style={{
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            color: "#B91C1C",
          }}
        >
          {error ? (
            <PhoneLinkText text={error} phone={phone} phoneHref={phoneHref} />
          ) : (
            `입력한 내용을 확인해 주세요 (${errorCount}곳).`
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={FIELD_ID.name} className={labelClass} style={labelStyle}>
            이름<Required />
          </label>
          <input
            id={FIELD_ID.name}
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            aria-required="true"
            autoComplete="name"
            maxLength={40}
            placeholder="홍길동"
            className={inputClass}
            style={inputStyle(!!fieldErrors.name)}
            {...aria("name")}
          />
          <FieldError id={errId("name")} message={fieldErrors.name} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={FIELD_ID.phone} className={labelClass} style={labelStyle}>
            연락처<Required />
          </label>
          <input
            id={FIELD_ID.phone}
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            aria-required="true"
            autoComplete="tel"
            inputMode="tel"
            maxLength={30}
            placeholder="010-0000-0000"
            className={inputClass}
            style={inputStyle(!!fieldErrors.phone)}
            {...aria("phone")}
          />
          <FieldError id={errId("phone")} message={fieldErrors.phone} />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2" {...(fieldErrors.service ? { "aria-describedby": errId("service") } : {})}>
        <legend className={`${labelClass} mb-2`} style={labelStyle}>
          예배 선택<Required />
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {serviceOptions.map((option, i) => (
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
                id={i === 0 ? FIELD_ID.service : undefined}
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
        <FieldError id={errId("service")} message={fieldErrors.service} />
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={FIELD_ID.date} className={labelClass} style={labelStyle}>
            방문 희망일<Required />
          </label>
          <div className="relative">
            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--color-dark-soft)" }} strokeWidth={1.75} aria-hidden="true" />
            <select
              id={FIELD_ID.date}
              name="date"
              value={form.date}
              onChange={handleChange}
              aria-required="true"
              className={inputClass}
              style={{ ...inputStyle(!!fieldErrors.date), paddingLeft: "2.5rem" }}
              {...aria("date")}
            >
              <option value="">날짜를 골라 주세요</option>
              {dateOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
              <option value={VISIT_DATE_UNDECIDED}>아직 정하지 않았어요</option>
            </select>
          </div>
          <FieldError id={errId("date")} message={fieldErrors.date} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={FIELD_ID.count} className={labelClass} style={labelStyle}>
            인원수
          </label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--color-dark-soft)" }} strokeWidth={1.75} aria-hidden="true" />
            <select
              id={FIELD_ID.count}
              name="count"
              value={form.count}
              onChange={handleChange}
              className={inputClass}
              style={{ ...inputStyle(!!fieldErrors.count), paddingLeft: "2.5rem" }}
              {...aria("count")}
            >
              {VISIT_COUNT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <FieldError id={errId("count")} message={fieldErrors.count} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={FIELD_ID.memo} className={labelClass} style={labelStyle}>
          남기실 말씀
        </label>
        <textarea
          id={FIELD_ID.memo}
          name="memo"
          value={form.memo}
          onChange={handleChange}
          placeholder="궁금하신 점이나 미리 알려주실 내용을 적어주세요."
          rows={3}
          maxLength={2000}
          className={inputClass}
          style={{ ...inputStyle(!!fieldErrors.memo), resize: "vertical" }}
          {...aria("memo")}
        />
        <FieldError id={errId("memo")} message={fieldErrors.memo} />
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

      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-3 text-sm" style={{ color: "var(--color-dark-soft)" }}>
          <input
            id={FIELD_ID.consent}
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              clearFieldError("consent");
            }}
            aria-required="true"
            className="mt-1 flex-shrink-0 w-4 h-4"
            style={{ accentColor: "var(--color-primary)" }}
            {...aria("consent")}
          />
          <div>
            <label htmlFor={FIELD_ID.consent} className="cursor-pointer leading-relaxed">
              {consentCopy.text}
              <Required />
            </label>{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="font-semibold underline underline-offset-2"
              style={{ color: "var(--color-primary)" }}
            >
              {consentCopy.linkLabel}
              <span className="sr-only">(새 창)</span>
            </Link>
          </div>
        </div>
        <FieldError id={errId("consent")} message={fieldErrors.consent} />
      </div>

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
  phoneHref,
  consentCopy,
  locationSlot,
}: {
  page: VisitPage;
  services: Service[];
  phone: string;
  phoneHref: string;
  /** 방문 신청 동의 문구 (content/pages/privacy.yaml consent) */
  consentCopy: { text: string; linkLabel: string };
  /** 서버에서 렌더한 「오시는 길」 섹션 */
  locationSlot: React.ReactNode;
}) {
  return (
    <main>
      {/* 1. Hero Banner */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-4"
        style={{
          minHeight: "40vh",
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 70%, var(--color-secondary) 120%)",
        }}
        aria-label="새가족 안내 히어로"
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
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
            {page.hero.lines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* 2. 처음 오시면 이렇게 진행돼요 */}
      {page.steps && <VisitSteps steps={page.steps} />}

      {/* 3. FAQ */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label={page.faq.label} title={page.faq.title} align="center" className="mb-12" />
          <ul className="flex flex-col gap-3">
            {page.faq.items.map((faq) => (
              <li key={faq.question}>
                <FaqItem question={faq.question} answer={faq.answer} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. Service Cards */}
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

      {/* 5. Visit Form */}
      <section id="reservation" className="py-20 lg:py-28 scroll-mt-16" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label={page.reservation.label} title={page.reservation.title} align="center" className="mb-3" />
          <p className="text-sm text-center mb-12" style={{ color: "var(--color-dark-soft)" }}>
            {page.reservation.intro}
          </p>
          <VisitForm
            services={services}
            phone={phone}
            phoneHref={phoneHref}
            copy={page.reservation}
            consentCopy={consentCopy}
          />
        </div>
      </section>

      {/* 6. Location */}
      {locationSlot}
    </main>
  );
}
