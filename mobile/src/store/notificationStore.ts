import { create } from 'zustand';
import { apiClient } from '../api/client.js';
import type {
  NotificationItem,
  NotificationCategory,
  NotificationPreferences,
} from '@milkboy/shared';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  activeCategory: NotificationCategory | 'all';
  searchQuery: string;
  preferences: NotificationPreferences;

  setActiveCategory: (category: NotificationCategory | 'all') => void;
  setSearchQuery: (query: string) => void;

  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;

  fetchPreferences: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  registerPushToken: (token: string, deviceType?: 'android' | 'ios' | 'web') => Promise<void>;
}

const DEFAULT_PREFS: NotificationPreferences = {
  enableNotifications: true,
  enablePush: true,
  enableLocal: true,
  enableEmail: true,
  enableSms: false,
  soundEnabled: true,
  vibrationEnabled: true,
  priorityThreshold: 'low',
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '07:00',
  },
  categories: {
    auth: true,
    scan: true,
    report: true,
    sync: true,
    laboratory: true,
    admin: true,
    system: true,
  },
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  activeCategory: 'all',
  searchQuery: '',
  preferences: DEFAULT_PREFS,

  setActiveCategory: (category) => {
    set({ activeCategory: category });
    get().fetchNotifications();
  },

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().fetchNotifications();
  },

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { activeCategory, searchQuery } = get();
      const params: Record<string, string> = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiClient.get('/notifications', { params });
      const list: NotificationItem[] = res.data.data || res.data || [];
      set({ notifications: list });
      await get().fetchUnreadCount();
    } catch {
      // ignore network errors
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await apiClient.get('/notifications/unread');
      const count = res.data.meta?.unreadCount ?? (res.data.data || []).length;
      set({ unreadCount: count });
    } catch {
      // fallback
    }
  },

  markAsRead: async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      set((state) => {
        const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
        const unread = Math.max(0, state.unreadCount - 1);
        return { notifications: updated, unreadCount: unread };
      });
    } catch {
      // ignore
    }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.put('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch {
      // ignore
    }
  },

  deleteNotification: async (id) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      set((state) => {
        const filtered = state.notifications.filter((n) => n.id !== id);
        return { notifications: filtered };
      });
      await get().fetchUnreadCount();
    } catch {
      // ignore
    }
  },

  clearAll: async () => {
    try {
      await apiClient.delete('/notifications');
      set({ notifications: [], unreadCount: 0 });
    } catch {
      // ignore
    }
  },

  fetchPreferences: async () => {
    try {
      const res = await apiClient.get('/notifications/preferences');
      set({ preferences: res.data.data || res.data || DEFAULT_PREFS });
    } catch {
      // ignore
    }
  },

  updatePreferences: async (prefs) => {
    try {
      const res = await apiClient.put('/notifications/preferences', prefs);
      set({ preferences: res.data.data || res.data });
    } catch {
      // ignore
    }
  },

  registerPushToken: async (token, deviceType = 'android') => {
    try {
      await apiClient.post('/notifications/tokens', {
        token,
        deviceType,
        deviceName: 'Mobile App Device',
      });
    } catch {
      // ignore
    }
  },
}));
