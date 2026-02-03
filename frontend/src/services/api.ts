// services/api.ts - API service client using Axios

import axios, { AxiosError } from 'axios';
import i18n from '../i18n';
import type {
  CitySearchResponse,
  ExportPDFRequest,
  ExportPDFResponse,
  SystemStatusResponse,
  ErrorResponse,
  // 003-flow-redesign: 新流程类型
  GetIngredientsResponse,
  GetRecipesByIngredientsRequest,
  GetRecipesByIngredientsResponse,
  GetNewRecipeDetailResponse,
  ImageURLResponse,
} from '../types';

// API base URL - defaults to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for LLM calls
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to set Accept-Language header
api.interceptors.request.use((config) => {
  // Get current language from i18n
  const lang = i18n.language || 'zh';
  config.headers['Accept-Language'] = lang;
  return config;
});

// Error handler helper
function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response?.data) {
      throw new Error(axiosError.response.data.message || '请求失败');
    }
    if (axiosError.code === 'ECONNABORTED') {
      throw new Error('请求超时，请稍后重试');
    }
    if (!axiosError.response) {
      throw new Error('无法连接到服务器，请检查网络连接');
    }
  }
  throw new Error('未知错误');
}

// City API
export async function searchCity(query: string): Promise<CitySearchResponse> {
  try {
    const response = await api.get<CitySearchResponse>('/city/search', {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getCitySuggestions(): Promise<string[]> {
  try {
    const response = await api.get<{ suggestions: string[] }>('/city/suggestions');
    return response.data.suggestions;
  } catch (error) {
    handleApiError(error);
  }
}

// PDF API
export async function exportRecipePDF(recipeId: string, request: ExportPDFRequest): Promise<ExportPDFResponse> {
  try {
    const response = await api.post<ExportPDFResponse>(`/recipes/${recipeId}/pdf`, request);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// System API
export async function getSystemStatus(): Promise<SystemStatusResponse> {
  try {
    const response = await api.get<SystemStatusResponse>('/system/status');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    await api.get('/system/health');
    return true;
  } catch {
    return false;
  }
}

// --- 003-flow-redesign-improvements: 新增 API 函数 ---

// 获取应季食材列表
export async function getSeasonalIngredients(city: string): Promise<GetIngredientsResponse> {
  try {
    const response = await api.post<GetIngredientsResponse>('/ingredients', { city }, {
      timeout: 90000, // 90 seconds for AI generation (can be slow)
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// 根据食材获取菜谱推荐
export async function getRecipesByIngredients(request: GetRecipesByIngredientsRequest): Promise<GetRecipesByIngredientsResponse> {
  try {
    const response = await api.post<GetRecipesByIngredientsResponse>('/recipes/by-ingredients', request, {
      timeout: 60000,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// 获取新版菜谱详情
export async function getNewRecipeDetail(recipeId: string, title: string): Promise<GetNewRecipeDetailResponse> {
  try {
    const response = await api.get<GetNewRecipeDetailResponse>(`/recipes/${recipeId}/detail`, {
      params: { title },
      timeout: 60000,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// 获取菜谱图片 URL
export async function getRecipeImageUrl(recipeId: string): Promise<ImageURLResponse> {
  try {
    const response = await api.get<ImageURLResponse>(`/recipes/${recipeId}/image-url`, {
      timeout: 120000, // 2 minutes for image generation
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// 获取菜谱图片代理 URL（用于 PDF 导出，解决跨域问题）
export function getRecipeImageProxyUrl(recipeId: string): string {
  return `${API_BASE_URL}/recipes/${recipeId}/image-proxy`;
}

export default api;
