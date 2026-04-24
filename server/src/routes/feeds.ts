import { Hono } from 'hono';
import { query } from '../utils/database';
import { Env } from '../utils/database';

export const feedsRouter = new Hono<{ Bindings: Env }>();

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  publish_time: string;
  created_at: string;
  category_name: string;
  tags: string;
}

feedsRouter.get('/rss.xml', async (c) => {
  const articles = await query<Article>(c,
    `SELECT a.*, c.name as category_name
     FROM articles a
     LEFT JOIN categories c ON a.category_id = c.id
     WHERE a.is_publish = 1
     ORDER BY a.publish_time DESC LIMIT 20`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CatpaBlog</title>
    <link>https://catpablog.example.com</link>
    <description>A personal blog</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://catpablog.example.com/rss.xml" rel="self" type="application/rss+xml"/>
    ${articles.map(article => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>https://catpablog.example.com/posts/${article.slug}</link>
      <description><![CDATA[${article.summary || article.content.substring(0, 200)}]]></description>
      <pubDate>${new Date(article.publish_time).toUTCString()}</pubDate>
      <guid>https://catpablog.example.com/posts/${article.slug}</guid>
    </item>`).join('')}
  </channel>
</rss>`;

  c.header('Content-Type', 'application/xml');
  return c.body(xml);
});

feedsRouter.get('/atom.xml', async (c) => {
  const articles = await query<Article>(c,
    `SELECT a.*, c.name as category_name
     FROM articles a
     LEFT JOIN categories c ON a.category_id = c.id
     WHERE a.is_publish = 1
     ORDER BY a.publish_time DESC LIMIT 20`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>CatpaBlog</title>
  <id>https://catpablog.example.com</id>
  <updated>${new Date().toISOString()}</updated>
  <author><name>CatpaBlog</name></author>
  <link href="https://catpablog.example.com/atom.xml" rel="self" type="application/atom+xml"/>
  ${articles.map(article => `
  <entry>
    <title>${escapeXml(article.title)}</title>
    <link href="https://catpablog.example.com/posts/${article.slug}"/>
    <id>https://catpablog.example.com/posts/${article.slug}</id>
    <updated>${new Date(article.publish_time).toISOString()}</updated>
    <summary type="text"><![CDATA[${article.summary || ''}]]></summary>
    <content type="html"><![CDATA[${article.content}]]></content>
  </entry>`).join('')}
</feed>`;

  c.header('Content-Type', 'application/xml');
  return c.body(xml);
});

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
