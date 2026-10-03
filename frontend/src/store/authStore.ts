import { create } from 'zustand';
import { api } from '../lib/axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isDemoUser?: boolean;
  subscription?: {
    status: string;
    planId: string;
  };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      set({ user: response.data.user, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Login failed',
        isLoading: false 
      });
      throw error;
    }
  },

  demoLogin: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/demo');
      set({ user: response.data.user, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Demo login failed',
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', data);
      set({ user: response.data.user, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error?.message || 'Registration failed',
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
    } finally {
      set({ user: null, isLoading: false });
      window.location.href = '/login';
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, isLoading: false });
    } catch (error) {
      set({ user: null, isLoading: false });
    }
  },

  updateProfile: async (data: any) => {
    try {
      const response = await api.put('/auth/me', data);
      set({ user: response.data.user });
    } catch (error: any) {
      throw error;
    }
  }
}));
