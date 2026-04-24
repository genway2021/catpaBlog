import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

export interface Env {
  MCP_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());
app.use('*', cors({
  origin: (origin) => origin,
  credentials: true,
}));

// MCP endpoint - simplified version
app.post('/mcp', async (c) => {
  const authHeader = c.req.header('Authorization');
  const expectedSecret = c.env.MCP_SECRET;
  
  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return c.json({
      code: 401,
      message: 'Unauthorized'
    }, 401);
  }
  
  try {
    const body = await c.req.json();
    
    // Simulate MCP response
    return c.json({
      code: 200,
      data: {
        tools: [
          {
            name: 'article_manage',
            description: '文章管理工具'
          },
          {
            name: 'taxonomy_manage',
            description: '分类/标签管理工具'
          }
        ]
      }
    });
  } catch (error) {
    return c.json({
      code: 500,
      message: 'Internal Server Error'
    }, 500);
  }
});

app.get('/', (c) => c.text('CatpaBlog MCP API Running'));

export default app;
