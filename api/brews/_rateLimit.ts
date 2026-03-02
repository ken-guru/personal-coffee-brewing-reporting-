// Simple in-memory rate limiter for API endpoints.
// Note: This operates per warm function instance. In a distributed or
// high-traffic environment, replace with a Redis-backed solution such as
// @upstash/ratelimit paired with Vercel KV.

// Maximum number of unique IPs tracked per limiter to bound memory usage.
const MAX_TRACKED_IPS = 10_000;

export interface RateLimiter {
  readonly map: Map<string, { count: number; resetAt: number }>;
  readonly windowMs: number;
  readonly max: number;
}

export function createRateLimiter(windowMs: number, max: number): RateLimiter {
  return { map: new Map(), windowMs, max };
}

export function checkRateLimit(limiter: RateLimiter, ip: string): boolean {
  const now = Date.now();
  const record = limiter.map.get(ip);

  if (!record || now > record.resetAt) {
    // Evict the oldest entry (Map preserves insertion order) when at capacity
    // to prevent unbounded memory growth in long-running function instances.
    if (!record && limiter.map.size >= MAX_TRACKED_IPS) {
      const firstKey = limiter.map.keys().next().value;
      if (firstKey !== undefined) limiter.map.delete(firstKey);
    }
    limiter.map.set(ip, { count: 1, resetAt: now + limiter.windowMs });
    return true;
  }
  if (record.count >= limiter.max) return false;
  record.count++;
  return true;
}

// On Vercel the x-forwarded-for header is set by Vercel's edge network and
// reflects the real client IP, so it is safe to use for rate limiting purposes.
export function getClientIp(headers: Record<string, string | string[] | undefined>): string {
  const forwarded = headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  if (Array.isArray(forwarded)) return (forwarded[0] ?? '').split(',')[0].trim();
  return 'unknown';
}

// 100 POST requests per 15 minutes per IP for the share endpoint
export const shareRateLimiter = createRateLimiter(15 * 60 * 1000, 100);
// 200 GET requests per 15 minutes per IP for the individual brew endpoint
export const getBrewRateLimiter = createRateLimiter(15 * 60 * 1000, 200);
// 100 GET requests per 15 minutes per IP for the brew list endpoint
export const listBrewsRateLimiter = createRateLimiter(15 * 60 * 1000, 100);
