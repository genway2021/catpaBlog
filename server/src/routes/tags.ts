import { Hono } from 'hono';
import { query, queryOne } from '../utils/database';
import { Env } from '../utils/database';

export const tagsRouter = new Hono<{ Bindings: Env }>();

interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

tagsRouter.get('/', async (c) => {
  const tags = await query<Tag>(
    c,
    'SELECT * FROM tags ORDER BY created_at ASC'
  );

  return c.json({ code: 200, data: tags });
});

tagsRouter.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const tag = await queryOne<Tag>(
    c,
    'SELECT * FROM tags WHERE slug = ?',
    slug
  );

  if (!tag) {
    return c.json({ code: 404, message: 'Tag not found' }, 404);
  }

  return c.json({ code: 200, data: tag });
});
