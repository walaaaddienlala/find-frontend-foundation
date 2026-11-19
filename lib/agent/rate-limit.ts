/**
 * Sliding-window rate limiter. IMPLEMENTED as a pure, in-memory helper.
 * LIMITATION: memory is per server instance, so on serverless/multi-instance
 * hosting this is best-effort only. Production needs a shared store (database
 * or Redis); see docs/FIND_AI_AGENT_ARCHITECTURE.md.
 */
export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };

export function createRateLimiter(options: { limit: number; windowMs: number; maxKeys?: number }) {
  const hits = new Map<string, number[]>();
  const maxKeys = options.maxKeys ?? 5000;

  return {
    check(key: string, now: number = Date.now()): RateLimitResult {
      const cutoff = now - options.windowMs;
      const recent = (hits.get(key) ?? []).filter((time) => time > cutoff);

      if (recent.length >= options.limit) {
        hits.set(key, recent);
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + options.windowMs - now) / 1000)),
        };
      }

      recent.push(now);
      hits.set(key, recent);

      if (hits.size > maxKeys) {
        for (const [storedKey, times] of hits) {
          if (times.every((time) => time <= cutoff)) hits.delete(storedKey);
          if (hits.size <= maxKeys) break;
        }
      }

      return { allowed: true, remaining: options.limit - recent.length, retryAfterSeconds: 0 };
    },
  };
}
