import type { Menu } from '@@/types/menu';
import { createApi } from './createApi';

const menuApi = createApi<Menu[]>('');

/** 获取菜单列表 */
export const getMenus = async () => {
  return menuApi.get<Menu[]>('/menus');
};
