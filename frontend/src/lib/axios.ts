import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').trim().replace(/\/+$/, '');
const baseURL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login') {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = data.data;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
        }
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          useAuthStore.getState().logout();
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
