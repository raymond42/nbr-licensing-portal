import axios, { AxiosHeaders, type AxiosInstance, isAxiosError } from 'axios';

import { clearSession, getAccessToken } from '@/shared/utils/auth-storage';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 60_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    const headers = AxiosHeaders.from(config.headers ?? {});
    headers.setContentType(false);
    config.headers = headers;
  }
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    const msg = data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
