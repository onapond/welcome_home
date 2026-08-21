"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Phone } from "lucide-react";

/**
 * 렌더링 중 예외가 발생했을 때의 폴백 화면.
 *
 * 방문자가 빈 화면을 마주하지 않도록 하고, 온라인으로 해결이 안 될 때
 * 전화라는 확실한 대안을 함께 제시한다.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // digest는 서버 로그와 대조하기 위한 식별자다
    console.error("[error boundary]", error.digest ?? error.message);
  }, [error]);

  return (
    <main
      className="flex flex-col items-center justify-center text-center px-4 py-24"
      style={{ minHeight: "60vh", backgroundColor: "var(--color-bg)" }}
    >
      <div className="flex flex-col items-center gap-5 max-w-md">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-dark)" }}>
          일시적인 문제가 발생했습니다
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-dark-soft)" }}>
          잠시 후 다시 시도해 주세요. 계속 같은 화면이 보이면
          <br className="hidden sm:block" />
          교회 사무실로 연락 주시면 안내해 드리겠습니다.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <RefreshCw className="w-4 h-4" strokeWidth={1.75} />
            다시 시도
          </button>

          <a
            href="tel:0271400041"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:brightness-105"
            style={{
              backgroundColor: "var(--color-white)",
              color: "var(--color-primary)",
              border: "1px solid rgba(43,58,140,0.15)",
            }}
          >
            <Phone className="w-4 h-4" strokeWidth={1.75} />
            02-714-0041
          </a>
        </div>

        <Link
          href="/"
          className="text-sm underline underline-offset-4 mt-2"
          style={{ color: "var(--color-dark-soft)" }}
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
