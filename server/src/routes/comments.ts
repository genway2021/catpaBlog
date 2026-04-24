import { Hono } from 'hono';
import { query, queryOne, execute, buildPageResponse } from '../utils/database';
import { Env } from '../utils/database';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';

export const commentsRouter = new Hono<{ Bindings: Env }>();

interface Comment {
  id: number;
  content: string;
  user_id: number;
  article_id: number;
  parent_id: number;
  is_approved: number;
  created_at: string;
  updated_at: string;
}

interface CommentWithUser extends Comment {
  user_name: string;
  user_email: string;
  user_avatar: string;
}

commentsRouter.get('/', async (c) => {
  const articleId = c.req.query('article_id');
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('page_size') || '20');

  let whereClause = 'WHERE c.is_approved = 1';
  const params: (string | number)[] = [];

  if (articleId) {
    whereClause += ' AND c.article_id = ?';
    params.push(parseInt(articleId));
  }

  const offset = (page - 1) * pageSize;

  const countResult = await queryOne<{ count: number }>(c,
    `SELECT COUNT(*) as count FROM comments c ${whereClause}`,
    ...params
  );
  const total = countResult?.count || 0;

  const comments = await query<CommentWithUser>(c,
    `SELECT c.*, u.name as user_name, u.email as user_email, u.avatar as user_avatar
     FROM comments c
     LEFT JOIN users u ON c.user_id = u.id
     ${whereClause}
     ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
    ...params, pageSize, offset
  );

  return c.json({
    code: 200,
    data: buildPageResponse(comments, total, page, pageSize),
  });
});

commentsRouter.post('/', optionalAuthMiddleware, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const { content, article_id, parent_id } = body;

  if (!content || !article_id) {
    return c.json({ code: 400, message: 'Content and article_id are required' }, 400);
  }

  const userId = user?.id || null;

  const result = await execute(c,
    `INSERT INTO comments (content, user_id, article_id, parent_id, is_approved, created_at, updated_at)
     VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
    content, userId, article_id, parent_id || null
  );

  return c.json({ code: 200, data: { id: result.lastRowId } });
});

commentsRouter.put('/:id', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const { content } = body;

  if (!content) {
    return c.json({ code: 400, message: 'Content is required' }, 400);
  }

  await execute(c,
    'UPDATE comments SET content = ?, updated_at = datetime(\'now\') WHERE id = ?',
    content, id
  );

  return c.json({ code: 200, message: 'Comment updated' });
});

commentsRouter.delete('/:id', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'));

  await execute(c, 'DELETE FROM comments WHERE id = ?', id);

  return c.json({ code: 200, message: 'Comment deleted' });
});
