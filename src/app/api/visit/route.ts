import { NextResponse } from "next/server";
import {
  LIMITS,
  escapeHtml,
  isBot,
  isFieldObject,
  normalizeVisitCount,
  optionalText,
  requireChoice,
  requireConsent,
  requirePhone,
  requireText,
  type FieldError,
  VISIT_COUNT_OPTIONS,
  visitCountLabel,
} from "@/lib/forms";
import { mailConfigured, notificationHtml, sendFormNotification } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSite } from "@/lib/content";
import { formatKoreanDate, isAcceptableVisitDate, VISIT_DATE_UNDECIDED } from "@/lib/schedule";

const COUNT_OPTIONS = VISIT_COUNT_OPTIONS.map((o) => o.value);

// 레이트리밋은 두 단계로 나눈다.
//
// FLOOD: 검증 실패를 포함한 모든 요청. 넉넉하게 잡아 폭주만 막는다.
//        검증 실패까지 엄격히 세면 연락처를 두어 번 잘못 입력한 방문자가
//        차단되어 버린다.
// SEND : 실제로 메일을 보내는 요청만. 스팸 발송을 막는 진짜 상한이다.
const FLOOD_LIMIT = 20;
const SEND_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  const ip = clientIp(request);
  // 예배 선택지는 site.yaml의 예배 이름 목록 — VisitClient가 보여 주는 값과 같은 출처다.
  const { phone: churchPhone, services } = getSite();
  const serviceOptions = services.map((s) => s.name);

  const flood = rateLimit(`visit:flood:${ip}`, FLOOD_LIMIT, RATE_WINDOW_MS);
  if (!flood.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: "신청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 429, headers: { "Retry-After": String(flood.retryAfter) } }
    );
  }

  // 파싱 실패와 「필드 객체가 아닌 JSON」(null · 배열 · 숫자)은 같은 400이다.
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    parsed = null;
  }
  if (!isFieldObject(parsed)) {
    return NextResponse.json(
      { ok: false, message: "요청을 처리하지 못했습니다." },
      { status: 400 }
    );
  }
  const body = parsed;

  // 봇은 성공처럼 응답하고 조용히 버린다 (탐지 사실을 알려주지 않는다)
  if (isBot(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const errors: FieldError[] = [];
  const name = requireText(body.name, "name", "이름", LIMITS.name, errors);
  const phone = requirePhone(body.phone, errors);
  const service = requireChoice(body.service, "service", "예배", serviceOptions, errors);
  const count = requireChoice(normalizeVisitCount(body.count), "count", "인원수", COUNT_OPTIONS, errors);
  const memo = optionalText(body.memo, LIMITS.message);
  // 방문 희망일: 선택한 예배의 다가오는 날짜(화면과 같은 visitDateChoices · 한국 시간) 또는 「미정」.
  // 예배 선택이 틀렸으면 날짜는 따로 탓하지 않는다(예배를 다시 고르면 날짜 목록이 바뀐다).
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const selectedService = services.find((s) => s.name === service);
  if (!date) {
    errors.push({ field: "date", message: "방문 희망일을 선택해 주세요." });
  } else if (selectedService && !isAcceptableVisitDate(date, selectedService)) {
    errors.push({
      field: "date",
      message: "선택하신 날짜에는 이 예배가 없거나 이미 시작했습니다. 방문 희망일을 다시 선택해 주세요.",
    });
  }
  const dateLabel = date === VISIT_DATE_UNDECIDED ? "미정" : date ? formatKoreanDate(date) : "";
  requireConsent(body.consent, errors);

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const send = rateLimit(`visit:send:${ip}`, SEND_LIMIT, RATE_WINDOW_MS);
  if (!send.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: "신청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 429, headers: { "Retry-After": String(send.retryAfter) } }
    );
  }

  // 미설정 상태에서 성공을 반환하면 신청자가 연락을 기다리다 놓친다.
  if (!mailConfigured()) {
    console.error("[visit] 폼 알림 미설정 — RESEND_API_KEY / FORM_NOTIFY_TO 확인 필요");
    return NextResponse.json(
      {
        ok: false,
        message:
          `현재 온라인 신청 접수가 일시 중단되었습니다. ${churchPhone}로 전화 주시면 안내해 드리겠습니다.`,
      },
      { status: 503 }
    );
  }

  const result = await sendFormNotification(
    `[방문 신청] ${name}님 — ${dateLabel} ${service}`,
    notificationHtml("새가족 방문 신청", [
      { label: "이름", value: escapeHtml(name) },
      { label: "연락처", value: escapeHtml(phone) },
      { label: "방문 희망일", value: escapeHtml(dateLabel) },
      { label: "예배", value: escapeHtml(service) },
      { label: "인원", value: escapeHtml(visitCountLabel(count)) },
      { label: "남기실 말씀", value: escapeHtml(memo) },
    ])
  );

  if (!result.ok) {
    // 상세 사유는 서버 로그에만 남긴다 (개인정보는 기록하지 않는다)
    console.error("[visit] 알림 발송 실패:", result.detail);
    return NextResponse.json(
      {
        ok: false,
        message:
          `신청 접수 중 문제가 발생했습니다. ${churchPhone}로 전화 주시면 도와드리겠습니다.`,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
