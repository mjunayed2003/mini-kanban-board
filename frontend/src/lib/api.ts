import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute =
      err.config?.url?.includes('/auth/login') ||
      err.config?.url?.includes('/auth/register');

    const isAuthPage =
      typeof window !== 'undefined' &&
      (window.location.pathname === '/login' || window.location.pathname === '/register');

    if (
      err.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !isAuthRoute &&
      !isAuthPage
    ) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);
