import { Context, Next } from 'hono';

export function errorHandler(err: Error, c: Context, next: Next) {
  console.error(`[Error] ${err.message}`, err.stack);

  return c.json({
    code: 500,
    message: err.message || 'Internal Server Error',
  }, 500);
}

export function notFoundHandler(c: Context) {
  return c.json({
    code: 404,
    message: 'Not Found',
  }, 404);
}
