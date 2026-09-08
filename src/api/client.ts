import axios, { AxiosError, type AxiosResponse } from 'axios';
import type { ApiError } from '@/types';
import { useAuth } from '@/store/auth';
// `||`, not `??`: an env var set to an empty string must fall back too.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const STORE_URL = import.meta.env.VITE_STORE_URL || 'http://localhost:5173';
export const http = axios.create({ baseURL: API_BASE_URL, timeout: 20_000 });
http.interceptors.request.use((c) => { const t = useAuth.getState().token; if (t && t !== 'mock') c.headers.Authorization = `Bearer ${t}`; return c; });

/**
 * A misrouted API call answers 200 with the SPA's own index.html: a wrong or
 * empty base URL, a catch-all rewrite, a dev proxy pointing nowhere. Axios
 * does not throw for that, so the HTML would reach the UI as if it were data.
 * Treat it as "server unreachable" instead, which is what the fixture
 * fallback in services.ts already knows how to handle.
 */
function assertJson(res: AxiosResponse): AxiosResponse {
  const wantsJson = !res.config?.responseType || res.config.responseType === 'json';
  const isJson = String(res.headers?.['content-type'] ?? '').includes('json');
  if (res.status !== 204 && wantsJson && !isJson) {
    throw { message: 'The API returned a non-JSON response, is VITE_API_BASE_URL correct?' } satisfies ApiError;
  }
  return res;
}

http.interceptors.response.use(assertJson, (e: AxiosError<ApiError>) => Promise.reject({ message: e.response?.data?.message ?? e.message, status: e.response?.status, errors: e.response?.data?.errors } satisfies ApiError));
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'auto') !== 'false';
