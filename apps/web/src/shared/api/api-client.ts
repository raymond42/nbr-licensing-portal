import axios, { AxiosHeaders, type AxiosInstance, isAxiosError } from 'axios';

import { clearSession, getAccessToken } from '@/shared/utils/auth-storage';

const devBaseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api' : undefined;
const baseURL = process.env.NEXT_PUBLIC_API_URL ?? devBaseURL;
const SESSION_AUTH_ERROR_MESSAGES = new Set(['Authentication required', 'User not found or inactive']);

if (!baseURL) {
  throw new Error('NEXT_PUBLIC_API_URL is required outside local development.');
}

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 20_000,
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
    if (isSessionAuthError(error)) {
      clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export function isSessionAuthError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  if (status !== 403) return false;

  const message = getApiErrorResponseMessage(error);
  return message !== undefined && SESSION_AUTH_ERROR_MESSAGES.has(message);
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError(error)) {
    const msg = getApiErrorResponseMessage(error);
    if (msg) return msg;
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

function getApiErrorResponseMessage(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined;
  const data = error.response?.data as { message?: unknown } | undefined;
  return formatApiMessage(data?.message);
}

function formatApiMessage(message: unknown): string | undefined {
  if (Array.isArray(message)) {
    return message.map((item) => formatApiMessage(item)).filter(Boolean).join(', ') || undefined;
  }

  if (typeof message === 'string') {
    return message;
  }

  if (message && typeof message === 'object' && 'message' in message) {
    return formatApiMessage((message as { message?: unknown }).message);
  }

  return undefined;
}
