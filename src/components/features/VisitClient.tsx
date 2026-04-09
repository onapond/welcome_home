"use client";

import { useState } from "react";
import { ChevronDown, Sun, Moon, Heart, Sunrise, Users, Clock, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import LocationSection from "@/components/sections/LocationSection";

// ─── FAQ ─────────────────────────────────────────────────────────────────────

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "복장은 어떻게 입고 오면 되나요?",
    answer:
      "특별한 복장 규정은 없습니다. 편안한 일상복으로 오셔도 전혀 문제없습니다. 중요한 것은 마음으로 드리는 예배입니다.",
  },
  {
    question: "주차는 가능한가요?",
    answer:
      "교회 전용 주차장은 없으나, 인근 공영주차장을 이용하실 수 있습니다. 주일예배 시 2시간 주차비를 교회에서 지원해드립니다. 대중교통 이용을 권장합니다 (1호선 남영역 3번 출구 도보 8분).",
  },
  {
    question: "예배는 몇 시에 시작하나요?",
    answer:
      "주일예배는 오전 11시에 시작합니다. 10~15분 전에 도착하시면 자리 안내를 받으실 수 있습니다. 수요예배는 오후 7:30, 금요기도회는 오후 9:00, 새벽기도는 오전 5:30입니다.",
  },
  {
    question: "아이와 함께 와도 되나요?",
    answer:
      "물론입니다! 영아부터 청소년까지 연령별로 분리된 예배와 교육 프로그램이 준비되어 있습니다. 본당 입구에서 안내 받으시면 각 연령부로 안내해 드립니다.",
  },
  {
    question: "헌금은 꼭 해야 하나요?",
    answer:
      "처음 오시는 분께는 헌금에 대한 부담이 전혀 없습니다. 헌금은 믿음으로 자발적으로 드리는 것입니다. 편하게 예배에만 집중하세요.",
  },
  {
    question: "예배 후 식사나 교제가 있나요?",
    answer:
      "주일예배 후 교회 식당에서 점심 식사를 함께 합니다. 처음 오시는 분들도 함께 식사하시며 교우들과 자연스럽게 교제하실 수 있습니다. 별도 비용은 없습니다.",
  },
];

// ─── Service Cards ────────────────────────────────────────────────────────────

interface ServiceCard {
  label: string;
  time: string;
  day: string;
  description: string;
  Icon: LucideIcon;
}

const SERVICES: ServiceCard[] = [
  {
    label: "주일예배",
    time: "오전 11:00",
    day: "매주 일요일",
    description: "전 교인이 함께 드리는 주일 본 예배입니다. 찬양과 말씀, 성찬으로 한 주를 시작합니다.",
    Icon: Sun,
  },
  {
    label: "수요예배",
    time: "오후 7:30",
    day: "매주 수요일",
    description: "한 주의 중간, 하나님 앞에 모여 말씀을 듣고 기도로 새 힘을 얻는 예배입니다.",
    Icon: Moon,
  },
  {
    label: "금요기도회",
    time: "오후 9:00",
    day: "매주 금요일",
    description: "교회와 이웃을 위해 뜨겁게 기도하는 시간입니다. 중보기도와 찬양이 함께합니다.",
    Icon: Heart,
  },
  {
    label: "새벽기도",
    time: "오전 5:30",
    day: "월요일~토요일",
    description: "하루를 하나님께 드리며 시작하는 새벽 기도회입니다. 짧은 말씀과 기도로 진행됩니다.",
    Icon: Sunrise,
  },
];

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

const SERVICE_OPTIONS = ["주일예배 (11:00)", "수요예배 (19:30)", "금요기도회 (21:00)", "새벽기도 (05:30)"];

function VisitForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: SERVICE_OPTIONS[0],
    count: "1",
    memo: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: "", phone: "", service: SERVICE_OPTIONS[0], count: "1", memo: "" });
    setTimeout(() => setSubmitted(false), 5000);
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
          방문 신청이 접수되었습니다. 담당 사역자가 연락드리겠습니다.
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
          {SERVICE_OPTIONS.map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200"
              style={{
                backgroundColor:
                  form.service === option ? "color-mix(in srgb, var(--color-primary) 8%, white)" : "var(--color-bg)",
                border:
                  form.service === option
                    ? "1px solid color-mix(in srgb, var(--color-primary) 35%, white)"
                    : "1px solid rgba(43,58,140,0.12)",
              }}
            >
              <input
                type="radio"
                name="service"
                value={option}
                checked={form.service === option}
                onChange={handleChange}
                style={{ accentColor: "var(--color-primary)" }}
              />
              <span className="text-sm" style={{ color: "var(--color-dark)" }}>{option}</span>
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

      <button
        type="submit"
        className="self-start inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 active:scale-95"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        방문 신청하기
      </button>
    </form>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function VisitClient() {
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
            새가족 안내
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
            처음 오시는 분을 환영합니다
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            교회가 처음이셔도, 신앙이 없으셔도 괜찮습니다.
            <br />
            청파중앙교회는 모든 분을 온 마음으로 환영합니다.
          </p>
        </div>
      </section>

      {/* 2. FAQ */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="자주 묻는 질문" title="방문 전 알아두세요" align="center" className="mb-12" />
          <div className="flex flex-col gap-3" role="list">
            {FAQS.map((faq, i) => (
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
          <SectionHeader label="예배" title="예배 안내" align="center" className="mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {SERVICES.map(({ label, time, day, description, Icon }) => (
              <div
                key={label}
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
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Visit Form */}
      <section id="reservation" className="py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="방문 예약" title="방문 신청하기" align="center" className="mb-3" />
          <p className="text-sm text-center mb-12" style={{ color: "var(--color-dark-soft)" }}>
            방문 전 미리 신청해주시면 담당 사역자가 편안하게 안내해 드립니다.
          </p>
          <VisitForm />
        </div>
      </section>

      {/* 5. Location */}
      <LocationSection />
    </main>
  );
}
