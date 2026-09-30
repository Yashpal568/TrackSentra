import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Don't intercept auth endpoints to prevent infinite refresh loops or unexpected redirects on public pages
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/me' &&
      originalRequest.url !== '/auth/refresh' &&
      originalRequest.url !== '/auth/register'
    ) {
      originalRequest._retry = true;
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails on a protected API call, redirect to login
        if (window.location.pathname !== '/' && window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/pricing' && window.location.pathname !== '/features' && window.location.pathname !== '/faq') {
           window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
