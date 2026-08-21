import { NextResponse } from "next/server";
import {
  LIMITS,
  escapeHtml,
  isBot,
  requireChoice,
  requireConsent,
  requirePhone,
  requireText,
  type FieldError,
} from "@/lib/forms";
import { mailConfigured, notificationHtml, sendFormNotification } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** ContactClient의 INQUIRY_TYPES와 반드시 동일하게 유지할 것 */
const INQUIRY_TYPES = [
  "예배 및 행사 문의",
  "새가족 등록",
  "공동체 참여",
  "시설 대관",
  "기타 문의",
] as const;

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

  const flood = rateLimit(`inquiry:flood:${ip}`, FLOOD_LIMIT, RATE_WINDOW_MS);
  if (!flood.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: "문의가 너무 잦습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 429, headers: { "Retry-After": String(flood.retryAfter) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "요청을 처리하지 못했습니다." },
      { status: 400 }
    );
  }

  // 봇은 성공처럼 응답하고 조용히 버린다
  if (isBot(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const errors: FieldError[] = [];
  const name = requireText(body.name, "name", "이름", LIMITS.name, errors);
  const phone = requirePhone(body.phone, errors);
  const type = requireChoice(body.type, "type", "문의 유형", INQUIRY_TYPES, errors);
  const message = requireText(body.message, "message", "문의 내용", LIMITS.message, errors);
  requireConsent(body.consent, errors);

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const send = rateLimit(`inquiry:send:${ip}`, SEND_LIMIT, RATE_WINDOW_MS);
  if (!send.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: "문의가 너무 잦습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 429, headers: { "Retry-After": String(send.retryAfter) } }
    );
  }

  // 미설정 상태에서 성공을 반환하면 문의자가 답변을 기다리다 놓친다.
  if (!mailConfigured()) {
    console.error("[inquiry] 폼 알림 미설정 — RESEND_API_KEY / FORM_NOTIFY_TO 확인 필요");
    return NextResponse.json(
      {
        ok: false,
        message:
          "현재 온라인 문의 접수가 일시 중단되었습니다. 02-714-0041로 전화 주시면 안내해 드리겠습니다.",
      },
      { status: 503 }
    );
  }

  const result = await sendFormNotification(
    `[문의] ${type} — ${name}님`,
    notificationHtml("홈페이지 문의", [
      { label: "이름", value: escapeHtml(name) },
      { label: "연락처", value: escapeHtml(phone) },
      { label: "문의 유형", value: escapeHtml(type) },
      { label: "문의 내용", value: escapeHtml(message) },
    ])
  );

  if (!result.ok) {
    console.error("[inquiry] 알림 발송 실패:", result.detail);
    return NextResponse.json(
      {
        ok: false,
        message:
          "문의 접수 중 문제가 발생했습니다. 02-714-0041로 전화 주시면 도와드리겠습니다.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
