import Link from "next/link";
import { CalendarCheck, MapPin, Phone } from "lucide-react";
import { getSite } from "@/lib/content";
import { telHref } from "@/lib/site-summary";

/**
 * 휴대폰(768px 미만) 화면 아래에 고정되는 버튼 세 개 — 방문 예약 · 전화 · 길찾기.
 * 문구와 주소는 content/site.yaml의 mobileBar, 전화번호는 phone에서 온다.
 * 메뉴가 열렸거나 입력 칸에 포커스가 있으면 globals.css가 감춘다.
 * 바로 앞의 빈 칸(spacer)이 바닥글 끝을 버튼 높이만큼 밀어 올려 가리지 않게 한다.
 */
export default function MobileActionBar() {
  const site = getSite();
  const { reserve, call, directions } = site.mobileBar;
  const itemClass =
    "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-semibold";

  return (
    <>
      <div className="mobile-action-bar-spacer md:hidden" aria-hidden="true" />
      <nav
        aria-label="빠른 연결"
        className="mobile-action-bar fixed bottom-0 left-0 right-0 z-30 md:hidden"
        style={{
          backgroundColor: "var(--color-white)",
          borderTop: "1px solid rgba(43,58,140,0.12)",
          boxShadow: "0 -4px 16px rgba(26,30,44,0.06)",
        }}
      >
        <div className="flex items-stretch">
          <Link
            href={reserve.href}
            className={itemClass}
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-white)" }}
          >
            <CalendarCheck className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            {reserve.label}
          </Link>
          <a href={telHref(site.phone)} className={itemClass} style={{ color: "var(--color-primary)" }}>
            <Phone className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            {call.label}
            <span className="sr-only"> {site.phone}</span>
          </a>
          <Link
            href={directions.href}
            className={itemClass}
            style={{ color: "var(--color-primary)", borderLeft: "1px solid rgba(43,58,140,0.1)" }}
          >
            <MapPin className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            {directions.label}
          </Link>
        </div>
      </nav>
    </>
  );
}
