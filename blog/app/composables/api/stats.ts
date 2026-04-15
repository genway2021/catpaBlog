import type { SiteStats, ArchiveStats } from '@@/types/stats';
import { createApi } from './createApi';

const statsApi = createApi<SiteStats>('');

/** 获取网站统计信息 */
export const getSiteStats = async () => {
  return statsApi.get<SiteStats>('/stats/site');
};

/** 获取归档统计信息 */
export const getArchiveStats = async () => {
  return statsApi.get<ArchiveStats>('/stats/archives');
};
