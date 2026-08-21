// ──────────────────────────────────────────
// 폼 제출 공통 검증 / 정규화
// ──────────────────────────────────────────

/** 필드별 최대 길이 — 서버에서 강제한다 (클라이언트 제한은 우회 가능) */
export const LIMITS = {
  name: 40,
  phone: 30,
  choice: 60,
  message: 2000,
} as const;

export type FieldError = { field: string; message: string };

/**
 * 이메일 HTML에 사용자 입력을 넣기 전 반드시 거쳐야 한다.
 * 이스케이프하지 않으면 제출 내용으로 알림 메일의 마크업을 깨뜨릴 수 있다.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** 앞뒤 공백 제거 + 제어문자 제거 (헤더 인젝션·레이아웃 깨짐 방지) */
function clean(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
}

/**
 * 한글 받침 유무에 따라 조사를 고른다.
 * 한글 음절은 0xAC00부터 28개 종성 단위로 배열되므로,
 * (코드 - 0xAC00) % 28 이 0이 아니면 받침이 있다.
 *
 * @example particle("이름", "을", "를") -> "이름을"
 * @example particle("예배", "을", "를") -> "예배를"
 */
export function particle(word: string, withFinal: string, withoutFinal: string): string {
  const last = word.trim().at(-1);
  if (!last) return word + withoutFinal;

  const code = last.charCodeAt(0);
  const isHangulSyllable = code >= 0xac00 && code <= 0xd7a3;
  if (!isHangulSyllable) return word + withoutFinal;

  return word + ((code - 0xac00) % 28 !== 0 ? withFinal : withoutFinal);
}

/** 필수 문자열 필드 검증 */
export function requireText(
  raw: unknown,
  field: string,
  label: string,
  max: number,
  errors: FieldError[]
): string {
  const value = clean(raw);
  if (!value) {
    errors.push({ field, message: `${particle(label, "을", "를")} 입력해 주세요.` });
    return "";
  }
  if (value.length > max) {
    errors.push({ field, message: `${particle(label, "은", "는")} ${max}자를 넘을 수 없습니다.` });
    return value.slice(0, max);
  }
  return value;
}

/** 선택 문자열 필드 (비어도 됨) */
export function optionalText(raw: unknown, max: number): string {
  return clean(raw).slice(0, max);
}

/** 허용된 선택지 중 하나인지 확인 */
export function requireChoice(
  raw: unknown,
  field: string,
  label: string,
  allowed: readonly string[],
  errors: FieldError[]
): string {
  const value = clean(raw);
  if (!allowed.includes(value)) {
    errors.push({ field, message: `${particle(label, "을", "를")} 다시 선택해 주세요.` });
    return "";
  }
  return value;
}

/**
 * 한국 휴대폰/일반전화 형식 검증.
 * 하이픈·공백·국가번호(+82)를 허용하되 숫자만 남겨 9~11자리인지 본다.
 */
export function requirePhone(raw: unknown, errors: FieldError[]): string {
  const value = clean(raw);
  if (!value) {
    errors.push({ field: "phone", message: "연락처를 입력해 주세요." });
    return "";
  }
  const digits = value.replace(/^\+?82/, "0").replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 11) {
    errors.push({ field: "phone", message: "연락처 형식을 확인해 주세요." });
    return value.slice(0, LIMITS.phone);
  }
  return value.slice(0, LIMITS.phone);
}

/** 개인정보 수집·이용 동의 — 미동의 시 접수하지 않는다 */
export function requireConsent(raw: unknown, errors: FieldError[]): boolean {
  const ok = raw === true || raw === "true" || raw === "on";
  if (!ok) {
    errors.push({ field: "consent", message: "개인정보 수집·이용에 동의해 주세요." });
  }
  return ok;
}

/**
 * 허니팟 — 사람에게는 보이지 않는 필드다.
 * 값이 채워져 있으면 봇으로 간주한다.
 */
export function isBot(raw: unknown): boolean {
  return clean(raw).length > 0;
}
