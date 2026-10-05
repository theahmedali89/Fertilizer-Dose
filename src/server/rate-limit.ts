/**
 * Tiny in-memory rate limiter (per key). Suitable for a single instance;
 * for multi-instance production use a shared store (e.g. Upstash Redis).
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, max: number, windowMs: number): {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
} {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, retryAfterMs: 0 };
  }
  if (b.count >= max) {
    return { ok: false, remaining: 0, retryAfterMs: b.resetAt - now };
  }
  b.count += 1;
  return { ok: true, remaining: max - b.count, retryAfterMs: 0 };
}

// Periodic cleanup so the map cannot grow forever.
if (typeof setInterval !== "undefined") {
  const t = setInterval(() => {
    const now = Date.now();
    for (const [k, b] of buckets) {
      if (now >= b.resetAt) buckets.delete(k);
    }
  }, 60_000);
  // Don't keep the process alive for this in scripts.
  (t as unknown as { unref?: () => void }).unref?.();
}
