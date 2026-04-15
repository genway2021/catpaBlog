import { $fetch } from 'ofetch';
import type { FetchOptions } from 'ofetch';
import { accessToken, refreshToken as refreshTokenRef, setTokens, logout } from './auth';
import type { ApiResponse } from '@@/types/request';

type HttpMethod =
  | 'GET'
  | 'HEAD'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE';

// 获取 API baseURL
const getBaseURL = () => useRuntimeConfig().public.apiUrl as string;

// Token 刷新状态
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// 刷新 Token
const doRefreshToken = async (): Promise<boolean> => {
  if (!refreshTokenRef.value) return false;

  try {
    const res = await $fetch<ApiResponse<{ access_token: string; refresh_token: string }>>(
      '/auth/refresh',
      { method: 'POST', baseURL: getBaseURL(), body: { refresh_token: refreshTokenRef.value } }
    );
    if (res.code === 0 && res.data) {
      setTokens(res.data.access_token, res.data.refresh_token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// 封装请求，支持自动 Token 和 401 刷新
export async function apiRequest<T = any>(
  url: string,
  options: Omit<FetchOptions, 'method'> & { method?: HttpMethod; _retry?: boolean } = {}
): Promise<T> {
  const config = useRuntimeConfig();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken.value && url !== '/auth/refresh') {
    headers['Authorization'] = `Bearer ${accessToken.value}`;
  }

  try {
    return await $fetch<T>(url, { ...options, baseURL: config.public.apiUrl, headers } as any);
  } catch (error: any) {
    // 401 自动刷新 token
    if (error?.response?.status === 401 && !options._retry && refreshTokenRef.value) {
      // 避免并发刷新
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = doRefreshToken().finally(() => {
          isRefreshing = false;
        });
      }

      const success = await refreshPromise;
      if (success) {
        return apiRequest<T>(url, { ...options, _retry: true });
      }
      logout();
    }
    throw error;
  }
}

/**
 * GET请求
 */
export async function get<T = any>(
  url: string,
  options: Omit<FetchOptions, 'method'> = {}
): Promise<T> {
  return await apiRequest<T>(url, { ...options, method: 'GET' });
}

/**
 * POST请求
 */
export async function post<T = any>(
  url: string,
  body?: any,
  options: Omit<FetchOptions, 'method'> = {}
): Promise<T> {
  return await apiRequest<T>(url, { ...options, method: 'POST', body });
}

/**
 * PUT请求
 */
export async function put<T = any>(
  url: string,
  body?: any,
  options: Omit<FetchOptions, 'method'> = {}
): Promise<T> {
  return await apiRequest<T>(url, { ...options, method: 'PUT', body });
}

/**
 * PATCH请求
 */
export async function patch<T = any>(
  url: string,
  body?: any,
  options: Omit<FetchOptions, 'method'> = {}
): Promise<T> {
  return await apiRequest<T>(url, { ...options, method: 'PATCH', body });
}

/**
 * DELETE请求
 */
export async function del<T = any>(
  url: string,
  options: Omit<FetchOptions, 'method'> = {}
): Promise<T> {
  return await apiRequest<T>(url, { ...options, method: 'DELETE' });
}
