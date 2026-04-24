import { Hono } from 'hono';
import { query, queryOne } from '../utils/database';
import { Env } from '../utils/database';

export const categoriesRouter = new Hono<{ Bindings: Env }>();

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

categoriesRouter.get('/', async (c) => {
  const categories = await query<Category>(
    c,
    'SELECT * FROM categories ORDER BY created_at ASC'
  );

  return c.json({ code: 200, data: categories });
});

categoriesRouter.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const category = await queryOne<Category>(
    c,
    'SELECT * FROM categories WHERE slug = ?',
    slug
  );

  if (!category) {
    return c.json({ code: 404, message: 'Category not found' }, 404);
  }

  return c.json({ code: 200, data: category });
});
