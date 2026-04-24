import { Hono } from 'hono';
import { query } from '../utils/database';
import { Env } from '../utils/database';

export const friendsRouter = new Hono<{ Bindings: Env }>();

interface Friend {
  id: number;
  name: string;
  url: string;
  logo: string;
  description: string;
  type_id: number;
  is_approved: number;
  created_at: string;
}

interface FriendType {
  id: number;
  name: string;
  slug: string;
}

friendsRouter.get('/', async (c) => {
  const friends = await query<Friend>(
    c,
    `SELECT f.* FROM friends f
     INNER JOIN friend_types ft ON f.type_id = ft.id
     WHERE f.is_approved = 1
     ORDER BY ft.sort_order ASC, f.created_at ASC`
  );

  return c.json({ code: 200, data: friends });
});

friendsRouter.get('/types', async (c) => {
  const types = await query<FriendType>(
    c,
    'SELECT * FROM friend_types ORDER BY sort_order ASC'
  );

  return c.json({ code: 200, data: types });
});
