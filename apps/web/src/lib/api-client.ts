import axios, { type AxiosInstance } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  // TODO: attach Bearer token from auth provider
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);
