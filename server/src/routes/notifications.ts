import { Hono } from 'hono';
import { query, queryOne, execute, buildPageResponse } from '../utils/database';
import { Env } from '../utils/database';
import { authMiddleware } from '../middleware/auth';

export const notificationsRouter = new Hono<{ Bindings: Env }>();

interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  content: string;
  is_read: number;
  created_at: string;
}

notificationsRouter.get('/', authMiddleware, async (c) => {
  const user = c.get('user');
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('page_size') || '20');

  const offset = (page - 1) * pageSize;

  const countResult = await queryOne<{ count: number }>(c,
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?',
    user!.id
  );
  const total = countResult?.count || 0;

  const notifications = await query<Notification>(c,
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    user!.id, pageSize, offset
  );

  return c.json({
    code: 200,
    data: buildPageResponse(notifications, total, page, pageSize),
  });
});

notificationsRouter.put('/:id/read', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'));
  const user = c.get('user');

  await execute(c,
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    id, user!.id
  );

  return c.json({ code: 200, message: 'Marked as read' });
});

notificationsRouter.put('/read-all', authMiddleware, async (c) => {
  const user = c.get('user');

  await execute(c,
    'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
    user!.id
  );

  return c.json({ code: 200, message: 'All marked as read' });
});
