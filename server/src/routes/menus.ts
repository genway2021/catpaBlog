import { Hono } from 'hono';
import { query } from '../utils/database';
import { Env } from '../utils/database';

export const menusRouter = new Hono<{ Bindings: Env }>();

interface Menu {
  id: number;
  name: string;
  path: string;
  icon: string;
  parent_id: number;
  sort_order: number;
  type: string;
}

menusRouter.get('/', async (c) => {
  const type = c.req.query('type');

  let whereClause = '';
  const params: string[] = [];

  if (type) {
    whereClause = 'WHERE type = ?';
    params.push(type);
  }

  const menus = await query<Menu>(
    c,
    `SELECT * FROM menus ${whereClause} ORDER BY sort_order ASC`,
    ...params
  );

  const menuTree = buildMenuTree(menus);

  return c.json({ code: 200, data: menuTree });
});

function buildMenuTree(menus: Menu[]): Menu[] {
  const map = new Map<number, Menu>();
  const roots: Menu[] = [];

  for (const menu of menus) {
    map.set(menu.id, { ...menu });
  }

  for (const menu of menus) {
    if (menu.parent_id) {
      const parent = map.get(menu.parent_id);
      if (parent) {
        (parent as any).children = parent.children || [];
        ((parent as any).children as Menu[]).push(map.get(menu.id)!);
      }
    } else {
      roots.push(map.get(menu.id)!);
    }
  }

  return roots;
}
