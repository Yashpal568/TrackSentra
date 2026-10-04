import { create } from 'zustand';
import { api } from '../lib/axios';

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
  eventSource: EventSource | null;
  
  fetchNotifications: (page?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  connectSSE: () => void;
  disconnectSSE: () => void;
  clear: () => void;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  eventSource: null,

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
        const wasUnread = state.notifications.find(n => n._id === id)?.isRead === false;
        return { 
          notifications: notifs, 
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount 
        };
      });
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  },

  addNotification: (notification: Notification) => {
    set(state => {
      // Prevent duplicates in frontend state
      if (state.notifications.some(n => n._id === notification._id)) {
        return state;
      }
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    });
  },

  connectSSE: () => {
    const { eventSource, addNotification } = get();
    if (eventSource) return; // Already connected

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications/stream`;
    
    // We can't easily pass Authorization header in native EventSource.
    // Instead we rely on the access token cookie being sent if we set withCredentials.
    // Ensure CORS and backend supports credentials.
    const es = new EventSource(url, { withCredentials: true });

    es.onopen = () => {
      set({ isConnected: true, eventSource: es });
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'CONNECTED') return;
        
        // Treat as a new notification
        addNotification(data);
        
        // Optional toast could be triggered here if severity warrants it
        if (['CRITICAL', 'WARNING'].includes(data.severity)) {
          // You could use a toast library here or custom implementation
        }
      } catch (err) {
        console.error('Failed to parse SSE message', err);
      }
    };

    es.onerror = (err) => {
      console.error('SSE Error', err);
      // It will auto-reconnect, but we can update state
      set({ isConnected: false });
    };

    set({ eventSource: es });
  },

  disconnectSSE: () => {
    const { eventSource } = get();
    if (eventSource) {
      eventSource.close();
      set({ eventSource: null, isConnected: false });
    }
  },

  clear: () => {
    get().disconnectSSE();
    set({ notifications: [], unreadCount: 0 });
  }
}));
