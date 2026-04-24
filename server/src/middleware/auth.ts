import { Context, Next } from 'hono';
import { verify } from '../utils/jwt';

export interface UserPayload {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      code: 401,
      message: 'Unauthorized',
    }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = verify(token, c.env.JWT_SECRET) as UserPayload;
    c.set('user', payload);
    return next();
  } catch (err) {
    return c.json({
      code: 401,
      message: 'Invalid or expired token',
    }, 401);
  }
}

export function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = verify(token, c.env.JWT_SECRET) as UserPayload;
      c.set('user', payload);
    } catch (err) {
      c.set('user', null);
    }
  } else {
    c.set('user', null);
  }

  return next();
}

export function adminMiddleware(c: Context, next: Next) {
  const user = c.get('user') as UserPayload | undefined;

  if (!user || user.role !== 'admin') {
    return c.json({
      code: 403,
      message: 'Forbidden',
    }, 403);
  }

  return next();
}
