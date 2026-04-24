import { Hono } from 'hono';
import { query, buildPageResponse } from '../utils/database';
import { Env } from '../utils/database';

export const momentsRouter = new Hono<{ Bindings: Env }>();

interface Moment {
  id: number;
  content: string;
  images: string;
  is_publish: number;
  created_at: string;
}

momentsRouter.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('page_size') || '20');

  const offset = (page - 1) * pageSize;

  const moments = await query<Moment>(
    c,
    `SELECT * FROM moments
     WHERE is_publish = 1
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    pageSize, offset
  );

  for (const moment of moments) {
    if (moment.images) {
      (moment as any).image_list = JSON.parse(moment.images);
    }
  }

  const countResult = await query<{ count: number }>(
    c,
    'SELECT COUNT(*) as count FROM moments WHERE is_publish = 1'
  );

  return c.json({
    code: 200,
    data: buildPageResponse(moments, countResult[0]?.count || 0, page, pageSize),
  });
});
