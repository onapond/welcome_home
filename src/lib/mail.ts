// ──────────────────────────────────────────
// Resend 이메일 발송 래퍼
// ──────────────────────────────────────────
//
// SDK 대신 fetch로 직접 호출한다. 이 프로젝트는 이미 peer dependency 충돌로
// legacy-peer-deps를 쓰고 있어, 의존성을 늘리지 않는 편이 안전하다.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type MailResult =
  | { ok: true }
  | { ok: false; reason: "unconfigured" | "failed"; detail: string };

/** 알림 수신 주소 목록 (콤마 구분 허용) */
function recipients(): string[] {
  return (process.env.FORM_NOTIFY_TO ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
}

/**
 * 폼 알림 메일이 실제로 나갈 수 있는 상태인지.
 * 라우트는 이 값이 false면 성공을 반환해서는 안 된다.
 */
export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY) && recipients().length > 0;
}

/**
 * 담당자에게 폼 접수 알림을 보낸다.
 *
 * @param subject  메일 제목
 * @param html     본문 (호출부에서 escapeHtml을 거친 값만 넣을 것)
 * @param replyTo  제출자 연락처가 이메일인 경우 회신 주소로 지정
 */
export async function sendFormNotification(
  subject: string,
  html: string,
  replyTo?: string
): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = recipients();

  if (!apiKey || to.length === 0) {
    return {
      ok: false,
      reason: "unconfigured",
      detail: "RESEND_API_KEY 또는 FORM_NOTIFY_TO 미설정",
    };
  }

  const from = process.env.FORM_NOTIFY_FROM?.trim() || "onboarding@resend.dev";

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `청파중앙교회 홈페이지 <${from}>`,
        to,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      // 발송이 지연되면 사용자를 무한정 기다리게 하지 않는다
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        ok: false,
        reason: "failed",
        detail: `Resend ${response.status}: ${body.slice(0, 200)}`,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: "failed",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

/** 알림 메일 공통 레이아웃. rows의 값은 이미 이스케이프되어 있어야 한다. */
export function notificationHtml(
  heading: string,
  rows: Array<{ label: string; value: string }>
): string {
  const cells = rows
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding:10px 14px;background:#F4F6FA;border:1px solid #E2E6F0;font-weight:600;color:#2B3A8C;white-space:nowrap;vertical-align:top;">${label}</td>
          <td style="padding:10px 14px;border:1px solid #E2E6F0;color:#1A1E2C;white-space:pre-wrap;">${value || "-"}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="ko">
  <body style="margin:0;padding:24px;background:#F4F6FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table role="presentation" style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:12px;padding:28px;border-collapse:separate;">
      <tr>
        <td>
          <h1 style="margin:0 0 6px;font-size:18px;color:#2B3A8C;">${heading}</h1>
          <p style="margin:0 0 20px;font-size:13px;color:#4A5568;">홈페이지 폼을 통해 접수된 내용입니다.</p>
          <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">
            ${cells}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
