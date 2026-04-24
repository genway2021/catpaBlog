import { Hono } from 'hono';
import { execute, queryOne } from '../utils/database';
import { Env } from '../utils/database';

export const feedbackRouter = new Hono<{ Bindings: Env }>();

feedbackRouter.post('/', async (c) => {
  const body = await c.req.json();
  const { type, content, contact, files } = body;

  if (!type || !content) {
    return c.json({ code: 400, message: 'Type and content are required' }, 400);
  }

  const ticketNo = `FB${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const result = await execute(c,
    `INSERT INTO feedback (ticket_no, type, content, contact, files, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'open', datetime('now'), datetime('now'))`,
    ticketNo, type, content, contact || '', JSON.stringify(files || [])
  );

  return c.json({
    code: 200,
    data: { ticket_no: ticketNo, id: result.lastRowId },
  });
});

feedbackRouter.get('/ticket/:ticket_no', async (c) => {
  const ticketNo = c.req.param('ticket_no');

  const feedback = await queryOne(c,
    'SELECT * FROM feedback WHERE ticket_no = ?',
    ticketNo
  );

  if (!feedback) {
    return c.json({ code: 404, message: 'Feedback not found' }, 404);
  }

  return c.json({ code: 200, data: feedback });
});
