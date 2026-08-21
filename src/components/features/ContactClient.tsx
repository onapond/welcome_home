"use client";

import { useState } from "react";
import { Phone, MapPin, Clock, Mail, CheckCircle, Send } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

const INQUIRY_TYPES = [
  "예배 및 행사 문의",
  "새가족 등록",
  "공동체 참여",
  "시설 대관",
  "기타 문의",
] as const;

const CONTACT_INFO = [
  {
    Icon: Phone,
    label: "전화",
    value: "02-714-0041~3",
    href: "tel:0271400041",
  },
  {
    Icon: Mail,
    label: "팩스",
    value: "02-711-8166",
    href: undefined,
  },
  {
    Icon: MapPin,
    label: "주소",
    value: "서울특별시 용산구 청파로73길 58 (서계동)",
    href: "https://map.kakao.com/?q=청파중앙교회",
  },
  {
    Icon: Clock,
    label: "교회 사무실",
    value: "월~금 09:00 – 18:00",
    href: undefined,
  },
] as const;

const EMPTY_CONTACT_FORM = {
  name: "",
  phone: "",
  type: INQUIRY_TYPES[0] as string,
  message: "",
};

export default function ContactClient() {
  const [form, setForm] = useState(EMPTY_CONTACT_FORM);
  const [consent, setConsent] = useState(false);
  // 허니팟 — 사람에게 보이지 않으므로 값이 차면 봇이다
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // 중복 제출 방지

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, consent, website }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const fieldMessage = Array.isArray(data.errors) ? data.errors[0]?.message : null;
        setError(
          fieldMessage ??
            data.message ??
            "문의를 접수하지 못했습니다. 02-714-0041로 전화 주시면 도와드리겠습니다."
        );
        return;
      }

      setSubmitted(true);
      setForm(EMPTY_CONTACT_FORM);
      setConsent(false);
    } catch {
      setError("네트워크 오류로 문의를 보내지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      {/* ── Hero ── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-4"
        style={{
          minHeight: "36vh",
          background:
            "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 60%, var(--color-secondary) 100%)",
        }}
        aria-label="문의 히어로"
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
            문의
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            언제든지 연락하세요
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            궁금한 점이 있으시면 편하게 문의해 주세요.
          </p>
        </div>
      </section>

      {/* ── Contact Info + Form ── */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

            {/* Left — Info */}
            <div>
              <SectionHeader
                label="연락처"
                title="교회 정보"
                align="left"
                className="mb-8"
              />

              <dl className="flex flex-col gap-5 mb-10">
                {CONTACT_INFO.map(({ Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl"
                      style={{ backgroundColor: "var(--color-bg-warm)", border: "1px solid rgba(43,58,140,0.1)" }}
                    >
                      <Icon className="w-4 h-4" style={{ color: "var(--color-primary)" }} strokeWidth={1.75} />
                    </div>
                    <div>
                      <dt className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-primary)" }}>
                        {label}
                      </dt>
                      {href ? (
                        <dd>
                          <a
                            href={href}
                            target={href.startsWith("http") ? "_blank" : undefined}
                            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="text-sm hover:underline underline-offset-2"
                            style={{ color: "var(--color-dark)" }}
                          >
                            {value}
                          </a>
                        </dd>
                      ) : (
                        <dd className="text-sm" style={{ color: "var(--color-dark)" }}>
                          {value}
                        </dd>
                      )}
                    </div>
                  </div>
                ))}
              </dl>

              {/* Map placeholder */}
              <div
                className="rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  height: 220,
                  backgroundColor: "var(--color-bg-warm)",
                  border: "1px solid rgba(43,58,140,0.1)",
                }}
              >
                <div className="flex flex-col items-center gap-2 text-center px-4">
                  <MapPin className="w-8 h-8" style={{ color: "var(--color-primary)", opacity: 0.4 }} />
                  <p className="text-xs" style={{ color: "var(--color-dark-soft)" }}>
                    서울특별시 용산구 청파로73길 58
                    <br />
                    지하철 남영역 3번 출구 도보 8분
                  </p>
                  <a
                    href="https://map.kakao.com/?q=청파중앙교회"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 px-4 py-1.5 rounded-full text-xs font-semibold transition-all hover:brightness-110"
                    style={{ backgroundColor: "var(--color-primary)", color: "white" }}
                  >
                    카카오맵에서 보기
                  </a>
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div>
              <SectionHeader
                label="문의 양식"
                title="메시지 보내기"
                align="left"
                className="mb-8"
              />

              {submitted ? (
                <div
                  role="status"
                  className="flex flex-col items-center justify-center text-center gap-4 rounded-3xl py-16 px-6"
                  style={{
                    backgroundColor: "var(--color-white)",
                    border: "1px solid rgba(43,58,140,0.08)",
                  }}
                >
                  <CheckCircle className="w-12 h-12" style={{ color: "var(--color-primary)" }} strokeWidth={1.5} />
                  <div>
                    <p className="font-serif text-lg font-bold mb-2" style={{ color: "var(--color-dark)" }}>
                      문의가 접수되었습니다
                    </p>
                    <p className="text-sm" style={{ color: "var(--color-dark-soft)" }}>
                      빠른 시일 내에 연락드리겠습니다.
                    </p>
                  </div>
                  <button
                    onClick={() => { setSubmitted(false); setForm(EMPTY_CONTACT_FORM); setConsent(false); setError(null); }}
                    className="mt-2 px-6 py-2 rounded-full text-sm font-semibold transition-all hover:brightness-110"
                    style={{ backgroundColor: "var(--color-bg-warm)", color: "var(--color-primary)", border: "1px solid rgba(43,58,140,0.12)" }}
                  >
                    다시 문의하기
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

                  {/* 이름 */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-dark)" }}>
                      이름 <span style={{ color: "var(--color-primary)" }}>*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="홍길동"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      style={{
                        backgroundColor: "var(--color-white)",
                        border: "1px solid rgba(43,58,140,0.15)",
                        color: "var(--color-dark)",
                      }}
                    />
                  </div>

                  {/* 연락처 */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-dark)" }}>
                      연락처 <span style={{ color: "var(--color-primary)" }}>*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="010-0000-0000"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      style={{
                        backgroundColor: "var(--color-white)",
                        border: "1px solid rgba(43,58,140,0.15)",
                        color: "var(--color-dark)",
                      }}
                    />
                  </div>

                  {/* 문의 유형 */}
                  <div>
                    <label htmlFor="type" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-dark)" }}>
                      문의 유형
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      style={{
                        backgroundColor: "var(--color-white)",
                        border: "1px solid rgba(43,58,140,0.15)",
                        color: "var(--color-dark)",
                      }}
                    >
                      {INQUIRY_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* 내용 */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-dark)" }}>
                      문의 내용 <span style={{ color: "var(--color-primary)" }}>*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="문의하실 내용을 자유롭게 적어주세요."
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                      style={{
                        backgroundColor: "var(--color-white)",
                        border: "1px solid rgba(43,58,140,0.15)",
                        color: "var(--color-dark)",
                      }}
                    />
                  </div>

                  {/* 허니팟 — 화면·스크린리더 모두에서 감춘다 */}
                  <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0 }}>
                    <label htmlFor="contact-website">이 항목은 비워두세요</label>
                    <input
                      id="contact-website"
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
                      답변 안내를 위해 이름과 연락처를 수집하는 데 동의합니다.
                      수집한 정보는 문의 응대 목적으로만 사용하며, 응대가 끝나면 파기합니다.
                      <span aria-hidden="true" style={{ color: "#e53e3e" }}> *</span>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="self-start inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    {loading ? "전송 중..." : (
                      <>
                        <Send className="w-4 h-4" />
                        문의 보내기
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
