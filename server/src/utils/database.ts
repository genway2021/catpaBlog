import { Context } from 'hono';

export interface Env {
  DB: D1Database;
}

export async function query<T>(
  c: Context<{ Bindings: Env }>,
  sql: string,
  ...params: (string | number | boolean | null)[]
): Promise<T[]> {
  const result = await c.env.DB.prepare(sql).bind(...params).all();
  return result.results as T[];
}

export async function queryOne<T>(
  c: Context<{ Bindings: Env }>,
  sql: string,
  ...params: (string | number | boolean | null)[]
): Promise<T | null> {
  const result = await c.env.DB.prepare(sql).bind(...params).first();
  return result as T | null;
}

export async function execute(
  c: Context<{ Bindings: Env }>,
  sql: string,
  ...params: (string | number | boolean | null)[]
): Promise<{ changes: number; lastRowId: number }> {
  const result = await c.env.DB.prepare(sql).bind(...params).run();
  return {
    changes: result.meta.changes ?? 0,
    lastRowId: result.meta.last_row_id ? Number(result.meta.last_row_id) : 0,
  };
}

export function buildPageResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
) {
  return {
    list: data,
    total,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize),
  };
}
