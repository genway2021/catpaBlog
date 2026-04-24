import { Hono } from 'hono';
import { queryOne, execute } from '../utils/database';
import { Env } from '../utils/database';
import { authMiddleware } from '../middleware/auth';
import { signToken } from '../utils/jwt';

export const authRouter = new Hono<{ Bindings: Env }>();

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  avatar: string;
  created_at: string;
}

authRouter.post('/register', async (c) => {
  const body = await c.req.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return c.json({ code: 400, message: 'Name, email and password are required' }, 400);
  }

  const existing = await queryOne<User>(c,
    'SELECT * FROM users WHERE email = ?',
    email
  );

  if (existing) {
    return c.json({ code: 400, message: 'Email already registered' }, 400);
  }

  const hashedPassword = await hashPassword(password);

  const result = await execute(c,
    `INSERT INTO users (name, email, password, role, created_at, updated_at)
     VALUES (?, ?, ?, 'user', datetime('now'), datetime('now'))`,
    name, email, hashedPassword
  );

  const token = signToken({
    id: Number(result.lastRowId),
    name,
    email,
    role: 'user',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  }, c.env.JWT_SECRET);

  return c.json({
    code: 200,
    data: { token, user: { id: result.lastRowId, name, email, role: 'user' } },
  });
});

authRouter.post('/login', async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ code: 400, message: 'Email and password are required' }, 400);
  }

  const user = await queryOne<User>(c,
    'SELECT * FROM users WHERE email = ?',
    email
  );

  if (!user || !(await verifyPassword(password, user.password))) {
    return c.json({ code: 401, message: 'Invalid credentials' }, 401);
  }

  const token = signToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  }, c.env.JWT_SECRET);

  return c.json({
    code: 200,
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    },
  });
});

authRouter.post('/refresh', authMiddleware, async (c) => {
  const user = c.get('user');

  const token = signToken({
    id: user!.id,
    name: user!.name,
    email: user!.email,
    role: user!.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  }, c.env.JWT_SECRET);

  return c.json({ code: 200, data: { token } });
});

authRouter.post('/logout', authMiddleware, async (c) => {
  return c.json({ code: 200, message: 'Logged out' });
});

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hash;
}
