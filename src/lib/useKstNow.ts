// ──────────────────────────────────────────
// 지금 한국 시간을 화면에서 쓰는 훅 (히어로 「다음 예배」 · 방문 신청 희망일 목록).
//
// - 서버 HTML(빌드 시각)과 첫 렌더에는 null — 날짜가 서버와 브라우저에서 달라
//   생기는 하이드레이션 불일치를 막는다. 하이드레이션 뒤에 값이 채워진다.
// - 열어 둔 화면이 낡지 않게 분이 바뀔 때와 화면으로 돌아올 때(visibilitychange ·
//   pageshow) 다시 읽는다. 값이 분 단위 문자열이라 같은 분 안에서는 다시 그리지 않는다.
// ──────────────────────────────────────────

import { useMemo, useSyncExternalStore } from "react";
import { kstNow, type KstNow } from "@/lib/schedule";

function subscribeClock(onChange: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const arm = () => {
    // 다음 분 경계 바로 뒤에 깨어난다(탭이 쉬는 동안 늦어지면 visibilitychange가 메운다)
    timer = setTimeout(() => {
      onChange();
      arm();
    }, 60_000 - (Date.now() % 60_000) + 50);
  };
  const onVisible = () => {
    if (document.visibilityState === "visible") onChange();
  };
  arm();
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("pageshow", onChange);
  return () => {
    if (timer) clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("pageshow", onChange);
  };
}

function clockKey(): string {
  const n = kstNow();
  return `${n.date}|${n.weekday}|${n.minutes}`;
}

export function useKstNow(): KstNow | null {
  const key = useSyncExternalStore(subscribeClock, clockKey, () => "");
  return useMemo(() => {
    if (!key) return null;
    const [date, weekday, minutes] = key.split("|");
    return { date, weekday: Number(weekday), minutes: Number(minutes) };
  }, [key]);
}
