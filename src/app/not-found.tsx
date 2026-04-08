import Link from "next/link";
import { MapPin, Home, BookOpen, Clock } from "lucide-react";

export const metadata = {
  title: "페이지를 찾을 수 없습니다",
};

const QUICK_LINKS = [
  { href: "/", label: "홈으로", Icon: Home },
  { href: "/visit", label: "새가족 안내", Icon: MapPin },
  { href: "/sermons", label: "설교 아카이브", Icon: BookOpen },
  { href: "/visit#service-times", label: "예배 시간", Icon: Clock },
];

export default function NotFound() {
  return (
    <main
      className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* 404 Number */}
      <p
        className="font-serif font-bold leading-none mb-4 select-none"
        style={{
          fontSize: "clamp(6rem, 20vw, 12rem)",
          color: "var(--color-primary)",
          opacity: 0.08,
        }}
        aria-hidden="true"
      >
        404
      </p>

      {/* Icon */}
      <div
        className="flex items-center justify-center w-16 h-16 rounded-full -mt-16 mb-6"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <MapPin className="w-7 h-7 text-white" strokeWidth={1.75} />
      </div>

      {/* Heading */}
      <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-3" style={{ color: "var(--color-dark)" }}>
        페이지를 찾을 수 없습니다
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base leading-relaxed max-w-sm mb-10" style={{ color: "var(--color-dark-soft)" }}>
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
        <br />
        아래 링크에서 원하시는 내용을 찾아보세요.
      </p>

      {/* Quick Links */}
      <nav aria-label="빠른 이동" className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 w-full max-w-lg">
        {QUICK_LINKS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-2xl py-4 px-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            style={{
              backgroundColor: "var(--color-white)",
              border: "1px solid rgba(43,58,140,0.08)",
            }}
          >
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl"
              style={{ backgroundColor: "var(--color-bg-warm)" }}
            >
              <Icon className="w-4 h-4" style={{ color: "var(--color-primary)" }} strokeWidth={1.75} />
            </div>
            <span className="text-xs font-semibold" style={{ color: "var(--color-dark)" }}>
              {label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Home CTA */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:brightness-110"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <Home className="w-4 h-4" />
        홈으로 돌아가기
      </Link>
    </main>
  );
}
