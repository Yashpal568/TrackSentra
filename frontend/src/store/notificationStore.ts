import { create } from 'zustand';
import { api } from '../lib/axios';
import { io, Socket } from 'socket.io-client';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  entityType?: 'Patrol' | 'Checkpoint' | 'Incident' | 'Guard' | 'System';
  entityId?: string;
  siteId?: string;
  patrolId?: string;
  guardId?: string;
  checkpointId?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  socket: Socket | null;
  
  fetchNotifications: (page?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
  clear: () => void;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  socket: null,

  fetchNotifications: async (page = 1) => {
    try {
      const res = await api.get(`/notifications?page=${page}&limit=30`);
      set({ notifications: res.data.notifications });
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      set({ unreadCount: res.data.unreadCount });
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set(state => {
        const notifs = state.notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        );
        return { 
          notifications: notifs
        };
      });
      // Do not decrement here! The server will emit 'notification:read'
      // which will trigger fetchUnreadCount or update unreadCount authoritatively.
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      }));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  },

  addNotification: (notification: Notification) => {
    set(state => {
      // Prevent duplicates
      if (state.notifications.some(n => n._id === notification._id)) {
        return state;
      }
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    });
  },

  connectSocket: () => {
    const { socket, addNotification, fetchUnreadCount } = get();
    if (socket) return; 

    // Find the token to authenticate the socket
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;

    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    const newSocket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      set({ isConnected: true });
    });

    newSocket.on('notification:new', (notification: Notification) => {
      addNotification(notification);
    });

    newSocket.on('notification:read', (data: { notificationId: string, unreadCount: number }) => {
      set(state => ({
        unreadCount: data.unreadCount,
        notifications: state.notifications.map(n => 
          n._id === data.notificationId ? { ...n, isRead: true } : n
        )
      }));
    });

    newSocket.on('notification:read-all', (data: { unreadCount: number }) => {
      set(state => ({
        unreadCount: data.unreadCount,
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      }));
    });

    newSocket.on('disconnect', () => {
      set({ isConnected: false });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  clear: () => {
    get().disconnectSocket();
    set({ notifications: [], unreadCount: 0 });
  }
}));
