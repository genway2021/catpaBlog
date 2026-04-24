import { Hono } from 'hono';
import { query, queryOne, buildPageResponse } from '../utils/database';
import { Context } from 'hono';
import { Env } from '../utils/database';

export const articlesRouter = new Hono<{ Bindings: Env }>();

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  ai_summary: string;
  cover: string;
  location: string;
  is_publish: number;
  is_top: number;
  is_essence: number;
  is_outdated: number;
  view_count: number;
  publish_time: string;
  update_time: string;
  category_id: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

articlesRouter.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('page_size') || '10');
  const year = c.req.query('year');
  const month = c.req.query('month');
  const category = c.req.query('category');
  const tag = c.req.query('tag');

  let whereClause = 'WHERE is_publish = 1';
  const params: (string | number)[] = [];

  if (year) {
    whereClause += ' AND strftime(\'%Y\', publish_time) = ?';
    params.push(year);
  }

  if (month) {
    whereClause += ' AND strftime(\'%m\', publish_time) = ?';
    params.push(month.padStart(2, '0'));
  }

  if (category) {
    whereClause += ' AND category_id = (SELECT id FROM categories WHERE slug = ?)';
    params.push(category);
  }

  if (tag) {
    whereClause += ' AND id IN (SELECT article_id FROM article_tags WHERE tag_id = (SELECT id FROM tags WHERE slug = ?))';
    params.push(tag);
  }

  const offset = (page - 1) * pageSize;

  const countResult = await queryOne<{ count: number }>(c,
    `SELECT COUNT(*) as count FROM articles ${whereClause}`,
    ...params
  );
  const total = countResult?.count || 0;

  const articles = await query<Article>(c,
    `SELECT * FROM articles ${whereClause} ORDER BY is_top DESC, publish_time DESC LIMIT ? OFFSET ?`,
    ...params, pageSize, offset
  );

  for (const article of articles) {
    const tags = await query<Tag>(c,
      `SELECT t.* FROM tags t
       INNER JOIN article_tags at ON t.id = at.tag_id
       WHERE at.article_id = ?`,
      article.id
    );
    (article as any).tags = tags;

    if (article.category_id) {
      const cat = await queryOne<Category>(c,
        'SELECT * FROM categories WHERE id = ?',
        article.category_id
      );
      (article as any).category = cat;
    }
  }

  return c.json({
    code: 200,
    data: buildPageResponse(articles, total, page, pageSize),
  });
});

articlesRouter.get('/search', async (c) => {
  const keyword = c.req.query('keyword');
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('page_size') || '10');

  if (!keyword) {
    return c.json({ code: 400, message: 'Keyword is required' }, 400);
  }

  const offset = (page - 1) * pageSize;

  const countResult = await queryOne<{ count: number }>(c,
    `SELECT COUNT(*) as count FROM articles
     WHERE is_publish = 1 AND (title LIKE ? OR content LIKE ?)`,
    `%${keyword}%`, `%${keyword}%`
  );
  const total = countResult?.count || 0;

  const articles = await query<Article>(c,
    `SELECT * FROM articles
     WHERE is_publish = 1 AND (title LIKE ? OR content LIKE ?)
     ORDER BY publish_time DESC LIMIT ? OFFSET ?`,
    `%${keyword}%`, `%${keyword}%`, pageSize, offset
  );

  return c.json({
    code: 200,
    data: buildPageResponse(articles, total, page, pageSize),
  });
});

articlesRouter.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const article = await queryOne<Article>(c,
    'SELECT * FROM articles WHERE slug = ? AND is_publish = 1',
    slug
  );

  if (!article) {
    return c.json({ code: 404, message: 'Article not found' }, 404);
  }

  await execute(c, 'UPDATE articles SET view_count = view_count + 1 WHERE id = ?', article.id);

  const tags = await query<Tag>(c,
    `SELECT t.* FROM tags t
     INNER JOIN article_tags at ON t.id = at.tag_id
     WHERE at.article_id = ?`,
    article.id
  );
  (article as any).tags = tags;

  if (article.category_id) {
    const cat = await queryOne<Category>(c,
      'SELECT * FROM categories WHERE id = ?',
      article.category_id
    );
    (article as any).category = cat;
  }

  return c.json({ code: 200, data: article });
});
