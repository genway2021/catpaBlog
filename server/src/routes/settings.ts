import { Hono } from 'hono';
import { query } from '../utils/database';
import { Env } from '../utils/database';

export const settingsRouter = new Hono<{ Bindings: Env }>();

interface Setting {
  key: string;
  value: string;
  group: string;
}

settingsRouter.get('/:group', async (c) => {
  const group = c.req.param('group');

  const settings = await query<Setting>(
    c,
    'SELECT * FROM settings WHERE is_public = 1 AND `group` = ?',
    group
  );

  const result: Record<string, string> = {};
  for (const setting of settings) {
    result[setting.key] = setting.value;
  }

  return c.json({ code: 200, data: result });
});
