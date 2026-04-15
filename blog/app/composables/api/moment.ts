import type { Moment } from '@@/types/moment';
import type { PaginationData, PaginationQuery } from '@@/types/request';
import { createApi } from './createApi';

const momentApi = createApi<Moment>('/moments');

/** 获取动态列表 */
export const getMoments = async (params: PaginationQuery = {}) => {
  return momentApi.getList(params);
};
