/**
 * Best-effort in-memory rate limit (per server instance). It smooths bursts;
 * the DURABLE control is the per-user daily quota in the database (usage.ts).
 * For multi-instance production, back this with Upstash Redis or Postgres.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, max = 8, windowMs = 10_000): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }
  if (b.count >= max) return { ok: false, retryAfterMs: b.reset - now };
  b.count++;
  return { ok: true, retryAfterMs: 0 };
}
