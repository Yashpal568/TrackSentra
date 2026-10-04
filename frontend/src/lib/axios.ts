import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
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
    // Format the error into a consistent, user-friendly structure
    let userMessage = 'Something went wrong. Please try again.';
    const status = error.response?.status;
    const backendMessage = error.response?.data?.error?.message;
    const errorCode = error.response?.data?.error?.code;
    const requestId = error.response?.data?.error?.requestId;

    if (!error.response) {
      userMessage = "We couldn't connect to TrackSentra. Check your internet connection and try again.";
      error.isNetworkError = true;
    } else if (status === 401) {
      userMessage = 'Please sign in again to continue.';
    } else if (status === 403) {
      userMessage = "You don't have permission to access this area.";
    } else if (status === 404) {
      userMessage = "The resource you're looking for doesn't exist.";
    } else if (status === 408) {
      userMessage = "The request timed out. Please try again.";
    } else if (status === 409) {
      userMessage = "The requested action could not be completed because the data has changed.";
    } else if (status === 422) {
      userMessage = backendMessage || "Please check the information and try again.";
    } else if (status === 429) {
      userMessage = "Too many attempts. Please wait a moment and try again.";
    } else if (status === 500 || status === 502) {
      userMessage = "Our servers couldn't complete this request.";
    } else if (status === 503 || status === 504) {
      userMessage = "TrackSentra is temporarily unavailable. Please try again shortly.";
    } else if (status === 400 && backendMessage) {
      // 400 Business logic errors are usually safe to show
      userMessage = backendMessage;
    }

    // Attach safe properties to the error object so components can just use err.userMessage
    error.userMessage = userMessage;
    error.requestId = requestId;
    error.code = errorCode;

    return Promise.reject(error);
  }
);
