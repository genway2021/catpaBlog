import { Server, Implementation } from '@modelcontextprotocol/sdk';

interface MCPTools {
  article: any;
  taxonomy: any;
  comment: any;
  friend: any;
  rssfeed: any;
  stats: any;
  moment: any;
  user: any;
}

export class MCPServer {
  private server: Server;

  constructor() {
    const implementation: Implementation = {
      name: 'catpablog-public',
      version: '1.0.0'
    };

    this.server = new Server(implementation, { debug: true });
  }

  registerTools() {
    // Article management tool
    this.server.addTool({
      name: 'article_manage',
      description: '文章管理。action：list/get/create/update/delete。',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['list', 'get', 'create', 'update', 'delete']
          },
          payload: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              page_size: { type: 'integer' },
              id: { type: 'integer' },
              title: { type: 'string' },
              content: { type: 'string' },
              summary: { type: 'string' },
              ai_summary: { type: 'string' },
              cover: { type: 'string' },
              location: { type: 'string' },
              is_publish: { type: 'boolean' },
              is_top: { type: 'boolean' },
              is_essence: { type: 'boolean' },
              is_outdated: { type: 'boolean' },
              category_id: { type: 'integer' },
              tags: { type: 'array', items: { type: 'integer' } }
            }
          }
        },
        required: ['action']
      }
    }, async (input: any) => {
      const { action, payload } = input;
      
      switch (action) {
        case 'list':
          return { code: 200, data: { list: [], total: 0, page: 1, page_size: 10 } };
        case 'get':
          return { code: 200, data: {} };
        case 'create':
          return { code: 200, data: { id: 1 } };
        case 'update':
          return { code: 200, message: 'Updated' };
        case 'delete':
          return { code: 200, message: 'Deleted' };
        default:
          return { code: 400, message: 'Invalid action' };
      }
    });

    // Taxonomy management tool
    this.server.addTool({
      name: 'taxonomy_manage',
      description: '分类/标签管理。target：category/tag；action：list/create/update/delete/list_articles。',
      inputSchema: {
        type: 'object',
        properties: {
          target: {
            type: 'string',
            enum: ['category', 'tag']
          },
          action: {
            type: 'string',
            enum: ['list', 'create', 'update', 'delete', 'list_articles']
          },
          payload: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              slug: { type: 'string' },
              description: { type: 'string' }
            }
          }
        },
        required: ['target', 'action']
      }
    }, async (input: any) => {
      const { target, action } = input;
      
      switch (action) {
        case 'list':
          return { code: 200, data: [] };
        case 'create':
          return { code: 200, data: { id: 1 } };
        case 'update':
          return { code: 200, message: 'Updated' };
        case 'delete':
          return { code: 200, message: 'Deleted' };
        case 'list_articles':
          return { code: 200, data: { list: [], total: 0 } };
        default:
          return { code: 400, message: 'Invalid action' };
      }
    });

    // Comment management tool
    this.server.addTool({
      name: 'comment_manage',
      description: '评论管理。action：list/get/toggle_status/delete。',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['list', 'get', 'toggle_status', 'delete']
          },
          payload: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              article_id: { type: 'integer' },
              page: { type: 'integer' },
              page_size: { type: 'integer' }
            }
          }
        },
        required: ['action']
      }
    }, async (input: any) => {
      const { action } = input;
      
      switch (action) {
        case 'list':
          return { code: 200, data: { list: [], total: 0, page: 1, page_size: 20 } };
        case 'get':
          return { code: 200, data: {} };
        case 'toggle_status':
          return { code: 200, message: 'Status toggled' };
        case 'delete':
          return { code: 200, message: 'Deleted' };
        default:
          return { code: 400, message: 'Invalid action' };
      }
    });

    // Friend management tool
    this.server.addTool({
      name: 'friend_manage',
      description: '友链管理。action：list/get/create/update/delete。',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['list', 'get', 'create', 'update', 'delete']
          },
          payload: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              url: { type: 'string' },
              logo: { type: 'string' },
              description: { type: 'string' },
              type_id: { type: 'integer' }
            }
          }
        },
        required: ['action']
      }
    }, async (input: any) => {
      const { action } = input;
      
      switch (action) {
        case 'list':
          return { code: 200, data: [] };
        case 'get':
          return { code: 200, data: {} };
        case 'create':
          return { code: 200, data: { id: 1 } };
        case 'update':
          return { code: 200, message: 'Updated' };
        case 'delete':
          return { code: 200, message: 'Deleted' };
        default:
          return { code: 400, message: 'Invalid action' };
      }
    });

    // RSS feed management tool
    this.server.addTool({
      name: 'rssfeed_manage',
      description: 'RSS订阅管理。action：list/mark_read/mark_all_read。',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['list', 'mark_read', 'mark_all_read']
          },
          payload: {
            type: 'object',
            properties: {
              id: { type: 'integer' }
            }
          }
        },
        required: ['action']
      }
    }, async (input: any) => {
      const { action } = input;
      
      switch (action) {
        case 'list':
          return { code: 200, data: [] };
        case 'mark_read':
          return { code: 200, message: 'Marked as read' };
        case 'mark_all_read':
          return { code: 200, message: 'All marked as read' };
        default:
          return { code: 400, message: 'Invalid action' };
      }
    });

    // Stats query tool
    this.server.addTool({
      name: 'stats_query',
      description: '站点访问统计查询（只读）。action：dashboard/trend。',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['dashboard', 'trend']
          },
          payload: {
            type: 'object',
            properties: {
              days: { type: 'integer' }
            }
          }
        },
        required: ['action']
      }
    }, async (input: any) => {
      const { action } = input;
      
      switch (action) {
        case 'dashboard':
          return { code: 200, data: { articles: 0, users: 0, comments: 0, moments: 0 } };
        case 'trend':
          return { code: 200, data: [] };
        default:
          return { code: 400, message: 'Invalid action' };
      }
    });

    // Moment management tool
    this.server.addTool({
      name: 'moment_manage',
      description: '动态管理。action：list/get/create/update/delete。',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['list', 'get', 'create', 'update', 'delete']
          },
          payload: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              content: { type: 'string' },
              images: { type: 'array', items: { type: 'string' } },
              is_publish: { type: 'boolean' }
            }
          }
        },
        required: ['action']
      }
    }, async (input: any) => {
      const { action } = input;
      
      switch (action) {
        case 'list':
          return { code: 200, data: [] };
        case 'get':
          return { code: 200, data: {} };
        case 'create':
          return { code: 200, data: { id: 1 } };
        case 'update':
          return { code: 200, message: 'Updated' };
        case 'delete':
          return { code: 200, message: 'Deleted' };
        default:
          return { code: 400, message: 'Invalid action' };
      }
    });

    // User management tool
    this.server.addTool({
      name: 'user_manage',
      description: '用户管理。action：list/get/create/update/delete。',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['list', 'get', 'create', 'update', 'delete']
          },
          payload: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              email: { type: 'string' },
              password: { type: 'string' },
              role: { type: 'string' },
              avatar: { type: 'string' }
            }
          }
        },
        required: ['action']
      }
    }, async (input: any) => {
      const { action } = input;
      
      switch (action) {
        case 'list':
          return { code: 200, data: [] };
        case 'get':
          return { code: 200, data: {} };
        case 'create':
          return { code: 200, data: { id: 1 } };
        case 'update':
          return { code: 200, message: 'Updated' };
        case 'delete':
          return { code: 200, message: 'Deleted' };
        default:
          return { code: 400, message: 'Invalid action' };
      }
    });
  }

  getServer(): Server {
    return this.server;
  }

  async handleRequest(request: Request): Promise<Response> {
    try {
      if (request.method === 'GET') {
        return new Response('MCP Server Running', { status: 200 });
      }

      const body = await request.json();
      const response = await this.server.handle(body);
      
      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: {
          code: 500,
          message: 'Internal Server Error'
        }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
}
