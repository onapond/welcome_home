import type { Site } from "./schema";
import { fullAddress, latestMotto, liveUrl } from "./site-format";

// ─── {{자리표시}} 치환 ───────────────────────────────────────────────────────
//
// content/pages/*.yaml(목록 문구 lists.yaml 포함)의 문구 안에서 교회 정보를
// {{ }}로 부를 수 있다. 정보가 바뀌어도 한 곳(site.yaml)만 고치면 모든 문구가
// 따라온다. 직원용 목록은 content/README.md 「자리표시」 절에 있다 — 여기를
// 바꾸면 그 표도 고친다.
//
//   {{name}} {{nameEn}} {{denomination}} {{pastor}} {{founded}} {{vision}}
//   {{description}} {{phone}} {{fax}} {{email}}
//   {{address}} (도로명 (상세))  {{address.road}}  {{address.detail}}
//   {{sns.youtube}}  {{sns.instagram}}  {{sns.live}} (없으면 유튜브 채널 /live)
//   {{service.<예배 id>.<name|short|day|time|place|audience>}}
//   {{motto.latest.<year|text|keyword>}}  {{motto.<연도>}}
//   {{transport.<교통편 id>}}  (location.yaml 교통편 — location.yaml 안에서는 못 씀)
//
// 모르는 이름, 값이 비어 있는 항목, 짝이 맞지 않는 {{ · }}(여분의 괄호 {{{name}}} 포함)는 파일 · 위치와 함께
// 빌드를 멈춘다.

export type TokenCtx = {
  site: Site;
  /** 교통편 id → 문구. null이면 {{transport.…}}를 쓸 수 없다(location.yaml 자신). */
  transport: ReadonlyMap<string, string> | null;
};
type Resolved = { value: string } | { problem: string };

const SITE_TOKENS = [
  "name",
  "nameEn",
  "denomination",
  "pastor",
  "founded",
  "vision",
  "description",
  "phone",
  "fax",
  "email",
] as const;
const SERVICE_FIELDS = ["name", "short", "day", "time", "place", "audience"] as const;
const MOTTO_FIELDS = ["year", "text", "keyword"] as const;

const UNKNOWN: Resolved = { problem: "알 수 없는 자리표시입니다 (content/README.md의 자리표시 목록 참고)" };

function has<T extends string>(list: readonly T[], v: string | undefined): v is T {
  return v !== undefined && (list as readonly string[]).includes(v);
}

function present(v: string | number | undefined, where: string): Resolved {
  return v === undefined || v === "" ? { problem: `${where} 값이 비어 있습니다` } : { value: String(v) };
}

function resolveToken(token: string, ctx: TokenCtx): Resolved {
  const { site } = ctx;
  const parts = token.split(".");
  const [head, a, b] = parts;

  switch (head) {
    case "address":
      if (parts.length === 1) return { value: fullAddress(site.address) };
      if (parts.length === 2 && (a === "road" || a === "detail")) {
        return present(site.address[a], `site.yaml의 address.${a}`);
      }
      return UNKNOWN;
    case "sns":
      if (parts.length === 2 && (a === "youtube" || a === "instagram")) {
        return present(site.sns[a], `site.yaml의 sns.${a}`);
      }
      if (parts.length === 2 && a === "live") return present(liveUrl(site), "site.yaml의 sns.live(또는 sns.youtube 채널 주소)");
      return UNKNOWN;
    case "service": {
      if (parts.length !== 3 || !has(SERVICE_FIELDS, b)) return UNKNOWN;
      const svc = site.services.find((s) => s.id === a);
      if (!svc) return { problem: `site.yaml에 id가 '${a}'인 예배가 없습니다` };
      return present(svc[b], `site.yaml 예배 '${a}'의 ${b}`);
    }
    case "motto": {
      if (parts.length === 3 && a === "latest" && has(MOTTO_FIELDS, b)) {
        const m = latestMotto(site);
        return m ? present(m[b], "site.yaml의 mottos") : { problem: "site.yaml에 표어(mottos)가 없습니다" };
      }
      if (parts.length === 2 && /^\d{4}$/.test(a)) {
        const m = site.mottos.find((x) => String(x.year) === a);
        return m ? { value: m.text } : { problem: `site.yaml에 ${a}년 표어가 없습니다` };
      }
      return UNKNOWN;
    }
    case "transport": {
      if (parts.length !== 2) return UNKNOWN;
      if (!ctx.transport) return { problem: "location.yaml 안에서는 {{transport.…}}를 쓸 수 없습니다" };
      // Map lookup: only ids registered in location.yaml, never inherited
      // object members such as toString.
      const t = ctx.transport.get(a);
      return t === undefined ? { problem: `location.yaml에 id가 '${a}'인 교통편이 없습니다` } : { value: t };
    }
    default:
      if (parts.length === 1 && has(SITE_TOKENS, head)) return present(site[head], `site.yaml의 ${head}`);
      return UNKNOWN;
  }
}

const TOKEN = /\{\{\s*([^{}]*?)\s*\}\}/g;

const BRACE_HINT = "{{ 와 }} 를 두 개씩 짝으로 적어 주세요 (예: {{name}})";

function fillString(value: string, ctx: TokenCtx, file: string, problems: string[], path: string): string {
  const where = `${file} → ${path || "(문구)"}`;
  // Whatever is left after removing complete {{…}} must not hold a brace pair
  // half: "안내 {{name}" would otherwise reach visitors as-is. Three braces in
  // a row ("{{{name}}}") mean a token with an extra brace that would show as
  // "{청파중앙교회}". A single brace in normal text is fine.
  if (/\{\{|\}\}/.test(value.replace(TOKEN, "")) || /\{\{\{|\}\}\}/.test(value)) {
    problems.push(`${where}: 자리표시의 괄호가 맞지 않습니다 — ${BRACE_HINT}`);
    return value;
  }
  let failed = false;
  const out = value.replace(TOKEN, (whole, token: string) => {
    const res = resolveToken(token, ctx);
    if ("problem" in res) {
      problems.push(`${where}: ${whole} — ${res.problem}`);
      failed = true;
      return whole;
    }
    return res.value;
  });
  // Nothing brace-like may survive substitution (e.g. from a site.yaml value).
  if (!failed && /\{\{|\}\}/.test(out)) {
    problems.push(`${where}: 바꾼 뒤에도 {{ · }} 가 남습니다 — ${BRACE_HINT}`);
  }
  return out;
}

/** Substitute {{ }} tokens in every string of `value`; problems are collected with file · field. */
export function fillTokens<T>(value: T, ctx: TokenCtx, file: string, problems: string[], path = ""): T {
  if (typeof value === "string") return fillString(value, ctx, file, problems, path) as T;
  if (Array.isArray(value)) {
    return value.map((v, i) => fillTokens(v, ctx, file, problems, path ? `${path}.${i}` : String(i))) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, fillTokens(v, ctx, file, problems, path ? `${path}.${k}` : k)]),
    ) as T;
  }
  return value;
}
