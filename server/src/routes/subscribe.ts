import { Hono } from 'hono';
import { execute, queryOne } from '../utils/database';
import { Env } from '../utils/database';

export const subscribeRouter = new Hono<{ Bindings: Env }>();

interface Subscriber {
  id: number;
  email: string;
  is_active: number;
}

subscribeRouter.post('/', async (c) => {
  const body = await c.req.json();
  const { email } = body;

  if (!email) {
    return c.json({ code: 400, message: 'Email is required' }, 400);
  }

  const existing = await queryOne<Subscriber>(c,
    'SELECT * FROM subscribers WHERE email = ?',
    email
  );

  if (existing) {
    if (existing.is_active) {
      return c.json({ code: 200, message: 'Already subscribed' });
    }
    await execute(c,
      'UPDATE subscribers SET is_active = 1, updated_at = datetime(\'now\') WHERE id = ?',
      existing.id
    );
    return c.json({ code: 200, message: 'Resubscribed successfully' });
  }

  const token = Math.random().toString(36).substring(2, 15);

  const result = await execute(c,
    `INSERT INTO subscribers (email, token, is_active, created_at, updated_at)
     VALUES (?, ?, 1, datetime('now'), datetime('now'))`,
    email, token
  );

  return c.json({
    code: 200,
    data: { id: result.lastRowId, token },
  });
});

subscribeRouter.get('/unsubscribe', async (c) => {
  const email = c.req.query('email');
  const token = c.req.query('token');

  if (!email || !token) {
    return c.json({ code: 400, message: 'Email and token are required' }, 400);
  }

  const subscriber = await queryOne<Subscriber>(c,
    'SELECT * FROM subscribers WHERE email = ? AND token = ?',
    email, token
  );

  if (!subscriber) {
    return c.json({ code: 404, message: 'Invalid unsubscribe link' }, 404);
  }

  await execute(c,
    'UPDATE subscribers SET is_active = 0, updated_at = datetime(\'now\') WHERE id = ?',
    subscriber.id
  );

  return c.json({ code: 200, message: 'Unsubscribed successfully' });
});
