import { Context, Next } from 'hono';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(c: Context, next: Next) {
  const max = parseInt(c.env.RATE_LIMIT_MAX as string) || 500;
  const windowMs = 60 * 1000;

  const ip = c.req.header('CF-Connecting-IP') ||
             c.req.header('X-Forwarded-For')?.split(',')[0] ||
             c.req.header('X-Real-IP') ||
             'unknown';

  const now = Date.now();
  const key = `rate:${ip}`;

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + windowMs };
    rateLimitStore.set(key, record);
  }

  record.count++;

  c.header('X-RateLimit-Limit', String(max));
  c.header('X-RateLimit-Remaining', String(Math.max(0, max - record.count)));
  c.header('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));

  if (record.count > max) {
    return c.json({
      code: 429,
      message: 'Too Many Requests',
    }, 429);
  }

  return next();
}
