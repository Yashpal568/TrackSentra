import { create } from 'zustand';
import { api } from '../lib/axios';
import { useNotificationStore } from './notificationStore';

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
  isCheckingAuth: boolean;
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
  isCheckingAuth: true,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      set({ user: response.data.user, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.userMessage || 'Login failed',
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
        error: error.userMessage || 'Demo login failed',
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
        error: error.userMessage || 'Registration failed',
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
      // Clear notifications on logout
      useNotificationStore.getState().clear();
      set({ user: null, isLoading: false });
      window.location.href = '/login';
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, isCheckingAuth: false, isLoading: false });
    } catch (error) {
      set({ user: null, isCheckingAuth: false, isLoading: false });
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
