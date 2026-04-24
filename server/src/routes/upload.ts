import { Hono } from 'hono';
import { Env } from '../utils/database';

export const uploadRouter = new Hono<{ Bindings: Env }>();

uploadRouter.post('/', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return c.json({ code: 400, message: 'No file provided' }, 400);
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const key = `uploads/${filename}`;

  await c.env.BUCKET.put(key, bytes);

  return c.json({
    code: 200,
    data: {
      url: `/uploads/${filename}`,
      filename,
      size: file.size,
      type: file.type,
    },
  });
});
