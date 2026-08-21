// ──────────────────────────────────────────
// 간단 레이트리밋 (인메모리)
// ──────────────────────────────────────────
//
// ⚠️ 한계: 함수 인스턴스 메모리에만 존재한다.
//    Vercel Fluid Compute는 인스턴스를 재사용하므로 대부분의 연속 요청은
//    같은 인스턴스에서 처리되어 동작하지만, 인스턴스가 여러 개로 늘어나면
//    각 인스턴스가 별도 카운터를 갖는다. 즉 상한이 인스턴스 수만큼 완화된다.
//
//    교회 홈페이지 트래픽 규모에서는 스팸 억제 목적으로 충분하다.
//    엄격한 보장이 필요해지면 Upstash Redis 등 공유 저장소로 교체할 것.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** 메모리 누수 방지 — 버킷이 과도하게 쌓이면 만료된 것부터 정리한다 */
const MAX_BUCKETS = 5000;

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  // 만료 정리 후에도 넘치면 오래된 순으로 버린다
  if (buckets.size > MAX_BUCKETS) {
    const excess = buckets.size - MAX_BUCKETS;
    let removed = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      if (++removed >= excess) break;
    }
  }
}

export type RateLimitResult = {
  ok: boolean;
  /** 제한에 걸렸을 때 남은 대기 시간(초) */
  retryAfter: number;
};

/**
 * @param key      식별자 (보통 IP + 폼 종류)
 * @param limit    윈도 내 허용 횟수
 * @param windowMs 윈도 길이 (밀리초)
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfter: 0 };
}

/**
 * 요청자 IP 추출.
 * Vercel은 x-forwarded-for의 첫 항목에 실제 클라이언트 IP를 넣는다.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
