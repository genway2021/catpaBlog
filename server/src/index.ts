import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { env } from 'hono/cloudflare-workers';

import { articlesRouter } from './routes/articles';
import { categoriesRouter } from './routes/categories';
import { tagsRouter } from './routes/tags';
import { commentsRouter } from './routes/comments';
import { friendsRouter } from './routes/friends';
import { momentsRouter } from './routes/moments';
import { menusRouter } from './routes/menus';
import { authRouter } from './routes/auth';
import { statsRouter } from './routes/stats';
import { settingsRouter } from './routes/settings';
import { uploadRouter } from './routes/upload';
import { feedbackRouter } from './routes/feedback';
import { subscribeRouter } from './routes/subscribe';
import { notificationsRouter } from './routes/notifications';
import { adminRouter } from './routes/admin';
import { feedsRouter } from './routes/feeds';
import { errorHandler, notFoundHandler } from './middleware/error';
import { rateLimitMiddleware } from './middleware/rateLimit';

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  SERVER_ALLOW_ORIGINS: string;
  RATE_LIMIT_MAX?: number;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());
app.use('*', cors({
  origin: (origin) => origin,
  credentials: true,
}));

app.use('/api/*', rateLimitMiddleware);

app.route('/api/v1/articles', articlesRouter);
app.route('/api/v1/categories', categoriesRouter);
app.route('/api/v1/tags', tagsRouter);
app.route('/api/v1/comments', commentsRouter);
app.route('/api/v1/friends', friendsRouter);
app.route('/api/v1/moments', momentsRouter);
app.route('/api/v1/menus', menusRouter);
app.route('/api/v1/auth', authRouter);
app.route('/api/v1/stats', statsRouter);
app.route('/api/v1/settings', settingsRouter);
app.route('/api/v1/upload', uploadRouter);
app.route('/api/v1/feedback', feedbackRouter);
app.route('/api/v1/subscribe', subscribeRouter);
app.route('/api/v1/notifications', notificationsRouter);
app.route('/api/v1/admin', adminRouter);
app.route('/api/v1', feedsRouter);

app.get('/', (c) => c.text('CatpaBlog API Running'));

app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;
