import { create } from 'zustand';
import { apiClient } from '../api/client.js';

export type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (prefs: NotificationState['preferences']) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  preferences: { email: true, push: true, sms: false },
  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/notifications');
      const list = res.data.data || res.data || [];
      const unread = list.filter((n: Notification) => !n.read).length;
      set({ notifications: list, unreadCount: unread });
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },
  markAsRead: async (id) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        );
        const unread = updated.filter((n) => !n.read).length;
        return { notifications: updated, unreadCount: unread };
      });
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
      set({ preferences: res.data.data || res.data });
    } catch {
      // ignore
    }
  },
  updatePreferences: async (prefs) => {
    try {
      await apiClient.put('/notifications/preferences', prefs);
      set({ preferences: prefs });
    } catch {
      // ignore
    }
  },
}));
