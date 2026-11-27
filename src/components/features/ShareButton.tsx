"use client";

import { useEffect, useRef, useState } from "react";
import { Share2 } from "lucide-react";

/**
 * 상세 페이지의 「공유」 버튼. 휴대폰 공유 창(Web Share API)을 열고,
 * 지원하지 않는 브라우저에서는 주소를 복사한 뒤 알림 문구를 띄운다.
 * (카카오톡 공유 SDK는 앱 키가 필요해 쓰지 않는다 — 휴대폰 공유 창에서 카카오톡을 고를 수 있다.)
 */
export default function ShareButton({ title }: { title: string }) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function announce(text: string) {
    setMessage(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), 3000);
  }

  async function handleClick() {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (e) {
        // 사용자가 공유 창을 닫은 경우는 조용히 끝낸다
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      announce("주소를 복사했습니다. 원하는 곳에 붙여 넣어 공유해 주세요.");
    } catch {
      announce("주소를 복사하지 못했습니다. 주소창의 주소를 복사해 주세요.");
    }
  }

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 hover:bg-white"
        style={{ color: "var(--color-primary)", border: "1px solid rgba(43,58,140,0.2)" }}
      >
        <Share2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
        공유
      </button>
      {/* 화면 읽기 프로그램에도 알리는 짧은 알림 */}
      <p
        role="status"
        aria-live="polite"
        className={[
          "absolute right-0 top-full mt-2 w-64 rounded-lg px-4 py-2.5 text-xs leading-relaxed shadow-lg transition-opacity duration-200",
          message ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
        style={{ backgroundColor: "var(--color-dark)", color: "var(--color-white)" }}
      >
        {message}
      </p>
    </div>
  );
}
