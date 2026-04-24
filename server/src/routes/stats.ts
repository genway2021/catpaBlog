import { Hono } from 'hono';
import { query, queryOne, execute } from '../utils/database';
import { Env } from '../utils/database';

export const statsRouter = new Hono<{ Bindings: Env }>();

statsRouter.post('/collect', async (c) => {
  const body = await c.req.json();
  const { type, data } = body;

  await execute(c,
    `INSERT INTO stats (type, data, created_at) VALUES (?, ?, datetime('now'))`,
    type, JSON.stringify(data)
  );

  return c.json({ code: 200, message: 'Collected' });
});

statsRouter.get('/site', async (c) => {
  const articleCount = await queryOne<{ count: number }>(
    c,
    'SELECT COUNT(*) as count FROM articles WHERE is_publish = 1'
  );

  const categoryCount = await queryOne<{ count: number }>(
    c,
    'SELECT COUNT(*) as count FROM categories'
  );

  const tagCount = await queryOne<{ count: number }>(
    c,
    'SELECT COUNT(*) as count FROM tags'
  );

  const commentCount = await queryOne<{ count: number }>(
    c,
    'SELECT COUNT(*) as count FROM comments WHERE is_approved = 1'
  );

  return c.json({
    code: 200,
    data: {
      articles: articleCount?.count || 0,
      categories: categoryCount?.count || 0,
      tags: tagCount?.count || 0,
      comments: commentCount?.count || 0,
    },
  });
});

statsRouter.get('/archives', async (c) => {
  const archives = await query<{ year: string; month: string; count: number }>(
    c,
    `SELECT
       strftime('%Y', publish_time) as year,
       strftime('%m', publish_time) as month,
       COUNT(*) as count
     FROM articles
     WHERE is_publish = 1
     GROUP BY year, month
     ORDER BY year DESC, month DESC`
  );

  return c.json({ code: 200, data: archives });
});
