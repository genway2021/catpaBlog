export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    try {
      if (url.pathname.startsWith('/api/')) {
        return handleAPI(request, env, url);
      }

      return new Response('CatpaBlog Backend API', {
        headers: { 'Content-Type': 'text/plain' },
      });
    } catch (err) {
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

async function handleAPI(request, env, url) {
  const method = request.method;
  const path = url.pathname.replace('/api/v1', '') || '/';

  const corsHeaders = {
    'Access-Control-Allow-Origin': env.SERVER_ALLOW_ORIGINS || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let response;
  switch (`${method} ${path}`) {
    case 'GET /articles':
      response = await getArticles(env);
      break;
    case 'GET /categories':
      response = await getCategories(env);
      break;
    default:
      response = { error: 'Not Found' };
  }

  return new Response(JSON.stringify(response), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

async function getArticles(env) {
  return { articles: [], total: 0 };
}

async function getCategories(env) {
  return { categories: [] };
}
