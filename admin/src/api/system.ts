import request from '@/utils/request';
import type { SystemStatic, SystemDynamic } from '@/types/system';

/**
 * 获取系统静态信息
 * @returns Promise<SystemStatic>
 */
export function getSystemStatic(): Promise<SystemStatic> {
  return request.get('/admin/system/static');
}

/**
 * 获取系统动态信息
 * @returns Promise<SystemDynamic>
 */
export function getSystemDynamic(): Promise<SystemDynamic> {
  return request.get('/admin/system/dynamic');
}
