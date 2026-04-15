import type { ApiResponse, PaginationData, PaginationQuery } from '@@/types/request';
import { get, post, put, patch, del } from '@/utils/request';

interface ApiFactoryOptions {
  stringifyTargetKey?: boolean;
  transformParams?: (params: any) => any;
  transformBody?: (body: any) => any;
}

function processData(data: any, options: ApiFactoryOptions, isBody: boolean) {
  let processed = { ...data };

  if (options.stringifyTargetKey && processed.target_key !== undefined) {
    processed.target_key = String(processed.target_key);
  }

  const transformFn = isBody ? options.transformBody : options.transformParams;
  if (transformFn) {
    processed = transformFn(processed);
  }

  return processed;
}

export function createApi<T>(endpoint: string, options: ApiFactoryOptions = {}) {
  return {
    getList: async (params?: Partial<PaginationQuery>): Promise<PaginationData<T>> => {
      const response = await get<ApiResponse<PaginationData<T>>>(endpoint, {
        params: processData(params, options, false),
      });
      return response.data;
    },

    getOne: async (id: number | string): Promise<T> => {
      const response = await get<ApiResponse<T>>(`${endpoint}/${id}`);
      return response.data;
    },

    create: async (data: any): Promise<T> => {
      const response = await post<ApiResponse<T>>(endpoint, processData(data, options, true));
      return response.data;
    },

    update: async (id: number | string, data: any): Promise<T> => {
      const response = await put<ApiResponse<T>>(
        `${endpoint}/${id}`,
        processData(data, options, true)
      );
      return response.data;
    },

    patch: async (id: number | string, data: any): Promise<T> => {
      const response = await patch<ApiResponse<T>>(
        `${endpoint}/${id}`,
        processData(data, options, true)
      );
      return response.data;
    },

    delete: async (id: number | string): Promise<void> => {
      await del(`${endpoint}/${id}`);
    },

    get: async <R = T>(url: string, params?: any): Promise<R> => {
      const response = await get<ApiResponse<R>>(`${endpoint}${url}`, {
        params: processData(params, options, false),
      });
      return response.data;
    },

    post: async <R = T>(url: string, data?: any): Promise<R> => {
      const response = await post<ApiResponse<R>>(
        `${endpoint}${url}`,
        processData(data, options, true)
      );
      return response.data;
    },

    put: async <R = T>(url: string, data?: any): Promise<R> => {
      const response = await put<ApiResponse<R>>(
        `${endpoint}${url}`,
        processData(data, options, true)
      );
      return response.data;
    },

    patchRequest: async <R = T>(url: string, data?: any): Promise<R> => {
      const response = await patch<ApiResponse<R>>(
        `${endpoint}${url}`,
        processData(data, options, true)
      );
      return response.data;
    },

    deleteRequest: async <R = void>(url: string, data?: any): Promise<R> => {
      const response = await del<ApiResponse<R>>(`${endpoint}${url}`, {
        body: processData(data, options, true),
      });
      return response.data;
    },
  };
}
