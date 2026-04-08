import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ──────────────────────────────────────────
// cn — Tailwind 클래스 병합 유틸
// Usage: cn("px-4 py-2", isActive && "bg-primary", className)
// ──────────────────────────────────────────
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ──────────────────────────────────────────
// formatDate — 날짜 포맷 유틸
// ──────────────────────────────────────────
const KO_LOCALE = "ko-KR";

/**
 * 한국어 날짜 포맷
 * @example formatDate("2026-04-07") → "2026년 4월 7일"
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(KO_LOCALE, options);
}

/**
 * 짧은 날짜 포맷
 * @example formatDateShort("2026-04-07") → "4월 7일"
 */
export function formatDateShort(date: string | Date): string {
  return formatDate(date, { month: "long", day: "numeric" });
}

/**
 * 날짜 + 시간 포맷
 * @example formatDateTime("2026-04-07T10:30:00") → "2026년 4월 7일 오전 10:30"
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(KO_LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * 상대 시간 포맷 (Intl.RelativeTimeFormat)
 * @example formatRelativeTime("2026-04-01") → "6일 전"
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(KO_LOCALE, { numeric: "auto" });

  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return rtf.format(diffHours, "hour");
  }
  if (Math.abs(diffDays) < 30) {
    return rtf.format(diffDays, "day");
  }
  if (Math.abs(diffDays) < 365) {
    return rtf.format(Math.round(diffDays / 30), "month");
  }
  return rtf.format(Math.round(diffDays / 365), "year");
}
