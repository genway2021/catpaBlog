import { Hono } from 'hono';
import { query, queryOne, execute, buildPageResponse } from '../utils/database';
import { Env } from '../utils/database';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

export const adminRouter = new Hono<{ Bindings: Env }>();

adminRouter.use('/*', authMiddleware, adminMiddleware);

adminRouter.get('/dashboard', async (c) => {
  const articleCount = await queryOne<{ count: number }>(
    c, 'SELECT COUNT(*) as count FROM articles'
  );
  const userCount = await queryOne<{ count: number }>(
    c, 'SELECT COUNT(*) as count FROM users'
  );
  const commentCount = await queryOne<{ count: number }>(
    c, 'SELECT COUNT(*) as count FROM comments'
  );
  const momentCount = await queryOne<{ count: number }>(
    c, 'SELECT COUNT(*) as count FROM moments'
  );

  return c.json({
    code: 200,
    data: {
      articles: articleCount?.count || 0,
      users: userCount?.count || 0,
      comments: commentCount?.count || 0,
      moments: momentCount?.count || 0,
    },
  });
});

adminRouter.get('/users', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('page_size') || '20');
  const offset = (page - 1) * pageSize;

  const countResult = await queryOne<{ count: number }>(
    c, 'SELECT COUNT(*) as count FROM users'
  );
  const total = countResult?.count || 0;

  const users = await query(
    c,
    'SELECT id, name, email, role, avatar, created_at FROM users LIMIT ? OFFSET ?',
    pageSize, offset
  );

  return c.json({ code: 200, data: buildPageResponse(users, total, page, pageSize) });
});

adminRouter.post('/users', async (c) => {
  const body = await c.req.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password) {
    return c.json({ code: 400, message: 'Name, email and password are required' }, 400);
  }

  const hashedPassword = await hashPassword(password);

  const result = await execute(c,
    `INSERT INTO users (name, email, password, role, created_at, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
    name, email, hashedPassword, role || 'user'
  );

  return c.json({ code: 200, data: { id: result.lastRowId } });
});

adminRouter.put('/users/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { name, email, role } = body;

  await execute(c,
    'UPDATE users SET name = ?, email = ?, role = ?, updated_at = datetime(\'now\') WHERE id = ?',
    name, email, role, id
  );

  return c.json({ code: 200, message: 'User updated' });
});

adminRouter.delete('/users/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  await execute(c, 'DELETE FROM users WHERE id = ?', id);

  return c.json({ code: 200, message: 'User deleted' });
});

adminRouter.get('/articles', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('page_size') || '20');
  const offset = (page - 1) * pageSize;

  const countResult = await queryOne<{ count: number }>(
    c, 'SELECT COUNT(*) as count FROM articles'
  );
  const total = countResult?.count || 0;

  const articles = await query(
    c,
    'SELECT * FROM articles ORDER BY created_at DESC LIMIT ? OFFSET ?',
    pageSize, offset
  );

  return c.json({ code: 200, data: buildPageResponse(articles, total, page, pageSize) });
});

adminRouter.post('/articles', async (c) => {
  const body = await c.req.json();
  const {
    title, slug, content, summary, cover, category_id,
    tags, is_publish, is_top, is_essence, location
  } = body;

  if (!title || !slug) {
    return c.json({ code: 400, message: 'Title and slug are required' }, 400);
  }

  const result = await execute(c,
    `INSERT INTO articles (title, slug, content, summary, cover, category_id, is_publish, is_top, is_essence, location, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    title, slug, content || '', summary || '', cover || '', category_id || null,
    is_publish ? 1 : 0, is_top ? 1 : 0, is_essence ? 1 : 0, location || ''
  );

  return c.json({ code: 200, data: { id: result.lastRowId } });
});

adminRouter.put('/articles/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { title, slug, content, summary, cover, category_id, is_publish, is_top, is_essence } = body;

  await execute(c,
    `UPDATE articles SET title = ?, slug = ?, content = ?, summary = ?, cover = ?,
     category_id = ?, is_publish = ?, is_top = ?, is_essence = ?, updated_at = datetime('now')
     WHERE id = ?`,
    title, slug, content, summary, cover, category_id, is_publish ? 1 : 0, is_top ? 1 : 0, is_essence ? 1 : 0, id
  );

  return c.json({ code: 200, message: 'Article updated' });
});

adminRouter.delete('/articles/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  await execute(c, 'DELETE FROM articles WHERE id = ?', id);

  return c.json({ code: 200, message: 'Article deleted' });
});

adminRouter.get('/categories', async (c) => {
  const categories = await query(c, 'SELECT * FROM categories ORDER BY created_at ASC');
  return c.json({ code: 200, data: categories });
});

adminRouter.post('/categories', async (c) => {
  const body = await c.req.json();
  const { name, slug, description } = body;

  const result = await execute(c,
    'INSERT INTO categories (name, slug, description, created_at) VALUES (?, ?, ?, datetime(\'now\'))',
    name, slug, description || ''
  );

  return c.json({ code: 200, data: { id: result.lastRowId } });
});

adminRouter.put('/categories/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { name, slug, description } = body;

  await execute(c, 'UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?', name, slug, description, id);

  return c.json({ code: 200, message: 'Category updated' });
});

adminRouter.delete('/categories/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  await execute(c, 'DELETE FROM categories WHERE id = ?', id);

  return c.json({ code: 200, message: 'Category deleted' });
});

adminRouter.get('/tags', async (c) => {
  const tags = await query(c, 'SELECT * FROM tags ORDER BY created_at ASC');
  return c.json({ code: 200, data: tags });
});

adminRouter.post('/tags', async (c) => {
  const body = await c.req.json();
  const { name, slug } = body;

  const result = await execute(c,
    'INSERT INTO tags (name, slug, created_at) VALUES (?, ?, datetime(\'now\'))',
    name, slug
  );

  return c.json({ code: 200, data: { id: result.lastRowId } });
});

adminRouter.put('/tags/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { name, slug } = body;

  await execute(c, 'UPDATE tags SET name = ?, slug = ? WHERE id = ?', name, slug, id);

  return c.json({ code: 200, message: 'Tag updated' });
});

adminRouter.delete('/tags/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  await execute(c, 'DELETE FROM tags WHERE id = ?', id);

  return c.json({ code: 200, message: 'Tag deleted' });
});

adminRouter.get('/moments', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('page_size') || '20');
  const offset = (page - 1) * pageSize;

  const countResult = await queryOne<{ count: number }>(c, 'SELECT COUNT(*) as count FROM moments');
  const total = countResult?.count || 0;

  const moments = await query(c,
    'SELECT * FROM moments ORDER BY created_at DESC LIMIT ? OFFSET ?',
    pageSize, offset
  );

  return c.json({ code: 200, data: buildPageResponse(moments, total, page, pageSize) });
});

adminRouter.post('/moments', async (c) => {
  const body = await c.req.json();
  const { content, images, is_publish } = body;

  const result = await execute(c,
    `INSERT INTO moments (content, images, is_publish, created_at) VALUES (?, ?, ?, datetime('now'))`,
    content, JSON.stringify(images || []), is_publish ? 1 : 0
  );

  return c.json({ code: 200, data: { id: result.lastRowId } });
});

adminRouter.put('/moments/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { content, images, is_publish } = body;

  await execute(c,
    'UPDATE moments SET content = ?, images = ?, is_publish = ? WHERE id = ?',
    content, JSON.stringify(images || []), is_publish ? 1 : 0, id
  );

  return c.json({ code: 200, message: 'Moment updated' });
});

adminRouter.delete('/moments/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  await execute(c, 'DELETE FROM moments WHERE id = ?', id);

  return c.json({ code: 200, message: 'Moment deleted' });
});

adminRouter.get('/settings', async (c) => {
  const settings = await query(c, 'SELECT * FROM settings');
  return c.json({ code: 200, data: settings });
});

adminRouter.put('/settings/:key', async (c) => {
  const key = c.req.param('key');
  const body = await c.req.json();
  const { value } = body;

  await execute(c, 'UPDATE settings SET value = ?, updated_at = datetime(\'now\') WHERE `key` = ?', value, key);

  return c.json({ code: 200, message: 'Setting updated' });
});

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
