import axios, { AxiosError } from 'axios';
import type { ApiError } from '@/types';
import { useAuth } from '@/store/auth';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
export const STORE_URL = import.meta.env.VITE_STORE_URL ?? 'http://localhost:5173';
export const http = axios.create({ baseURL: API_BASE_URL, timeout: 20_000 });
http.interceptors.request.use((c) => { const t = useAuth.getState().token; if (t && t !== 'mock') c.headers.Authorization = `Bearer ${t}`; return c; });
http.interceptors.response.use((r) => r, (e: AxiosError<ApiError>) => Promise.reject({ message: e.response?.data?.message ?? e.message, status: e.response?.status, errors: e.response?.data?.errors } satisfies ApiError));
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'auto') !== 'false';
