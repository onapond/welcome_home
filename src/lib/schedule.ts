// ──────────────────────────────────────────
// 예배 요일 · 시각 계산 (한국 시간). 파일을 읽지 않는 순수 함수라
// 서버(api/visit)와 클라이언트(히어로 · 방문 신청 폼)가 함께 쓴다.
//
// site.yaml의 예배 day · time은 사람이 읽는 문구("매주 일요일", "오전 11:00")라
// 읽을 수 있는 모양일 때만 계산하고, 못 읽으면 null을 돌려 문구를 그대로 쓰게 한다.
// ──────────────────────────────────────────

export const WEEKDAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** "매주 일요일" → [0], "월요일 ~ 토요일" → [1..6], "매일" → [0..6]. 못 읽으면 null. */
export function parseWeekdays(day: string): number[] | null {
  const s = day.replace(/\s+/g, "");
  if (/^매일$/.test(s)) return [0, 1, 2, 3, 4, 5, 6];
  const range = s.match(/^([일월화수목금토])요일~([일월화수목금토])요일$/);
  if (range) {
    const a = WEEKDAY_NAMES.indexOf(range[1] as (typeof WEEKDAY_NAMES)[number]);
    const b = WEEKDAY_NAMES.indexOf(range[2] as (typeof WEEKDAY_NAMES)[number]);
    const out: number[] = [];
    for (let d = a; ; d = (d + 1) % 7) {
      out.push(d);
      if (d === b) break;
    }
    return out;
  }
  const single = s.match(/^(?:매주)?([일월화수목금토])요일$/);
  if (single) return [WEEKDAY_NAMES.indexOf(single[1] as (typeof WEEKDAY_NAMES)[number])];
  return null;
}

/** "오전 11:00" → 660, "오후 7:30" → 1170 (자정부터 분). 못 읽으면 null. */
export function parseTime(time: string): number | null {
  const m = time.trim().match(/^(오전|오후)\s*(\d{1,2})(?::(\d{2}))?/);
  if (!m) return null;
  let h = Number(m[2]) % 12;
  if (m[1] === "오후") h += 12;
  return h * 60 + Number(m[3] ?? 0);
}

export interface KstNow {
  /** "YYYY-MM-DD" */
  date: string;
  weekday: number;
  minutes: number;
}

/** 지금 한국 시간 */
export function kstNow(at: Date = new Date()): KstNow {
  const kst = new Date(at.getTime() + 9 * 60 * 60 * 1000);
  return {
    date: kst.toISOString().slice(0, 10),
    weekday: kst.getUTCDay(),
    minutes: kst.getUTCHours() * 60 + kst.getUTCMinutes(),
  };
}

/** "YYYY-MM-DD"에 n일 더하기 */
export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** "2026-12-06" → "12월 6일 (일)" */
export function formatKoreanDate(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${m}월 ${d}일 (${WEEKDAY_NAMES[weekdayOf(date)]})`;
}

/**
 * 오늘부터(오늘 예배 시각이 이미 지났으면 내일부터) 예배 요일에 해당하는 날짜 count개.
 * 요일을 못 읽으면 매일로 본다.
 */
export function upcomingServiceDates(
  day: string,
  time: string,
  count: number,
  now: KstNow = kstNow(),
): string[] {
  const days = parseWeekdays(day) ?? [0, 1, 2, 3, 4, 5, 6];
  const start = parseTime(time);
  const out: string[] = [];
  for (let i = 0; out.length < count && i < 400; i++) {
    const date = addDays(now.date, i);
    if (!days.includes(weekdayOf(date))) continue;
    if (i === 0 && start !== null && now.minutes >= start) continue;
    out.push(date);
  }
  return out;
}

/**
 * 다음 예배가 언제인지 한 단어로: "오늘" · "내일" · "이번 주일" · "다음 주일" · "이번 수요일" …
 * 요일 · 시각을 못 읽으면 null.
 */
export function nextServiceWhen(day: string, time: string, now: KstNow = kstNow()): string | null {
  if (!parseWeekdays(day) || parseTime(time) === null) return null;
  const [next] = upcomingServiceDates(day, time, 1, now);
  if (!next) return null;
  if (next === now.date) return "오늘";
  if (next === addDays(now.date, 1)) return "내일";
  const wd = weekdayOf(next);
  const name = wd === 0 ? "주일" : `${WEEKDAY_NAMES[wd]}요일`;
  // 한 주를 월~일로 본다(일요일이 주의 끝). 다가오는 일요일까지 안이면 「이번」, 넘으면 「다음」.
  // 예: 월~토에 주일예배 → 이번 주일, 일요일 예배가 끝난 뒤 → 다음 주일.
  const daysAhead = Math.round((Date.parse(next) - Date.parse(now.date)) / 86_400_000);
  const untilWeekEnd = (7 - now.weekday) % 7; // 오늘부터 이번 주 일요일까지 남은 날
  return `${daysAhead <= untilWeekEnd ? "이번" : "다음"} ${name}`;
}

/** 방문 희망일 「아직 정하지 않음」 값 */
export const VISIT_DATE_UNDECIDED = "undecided";

/** 방문 신청 폼이 보여 주는 희망일 개수 */
export const VISIT_DATE_COUNT = 6;

/**
 * 방문 희망일 선택지 — 화면(VisitClient)과 서버(api/visit)가 같은 함수로 계산한다.
 * 선택한 예배의 요일에 해당하고, 오늘 예배가 이미 시작했으면 오늘은 뺀다(한국 시간).
 */
export function visitDateChoices(
  service: { day: string; time: string },
  now: KstNow = kstNow(),
): string[] {
  return upcomingServiceDates(service.day, service.time, VISIT_DATE_COUNT, now);
}

/**
 * 방문 희망일 값 검사(서버): 「미정」이거나, 선택한 예배의 지금 선택지(visitDateChoices) 안의 날짜.
 * 요일이 다른 날 · 이미 시작한 예배 날짜 · 너무 먼 날은 거절한다.
 */
export function isAcceptableVisitDate(
  value: string,
  service: { day: string; time: string },
  now: KstNow = kstNow(),
): boolean {
  if (value === VISIT_DATE_UNDECIDED) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return visitDateChoices(service, now).includes(value);
}
