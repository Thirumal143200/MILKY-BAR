import { apiGet, apiPatch, apiPost } from './client';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

/** Notifications API module */
export const notificationsApi = {
  list: (token: string, params?: { page?: number; limit?: number; read?: boolean }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiGet<PaginatedResponse<Notification>>(`/notifications${qs ? `?${qs}` : ''}`, token);
  },

  markRead: (token: string, notificationId: string) =>
    apiPatch<Notification>(`/notifications/${notificationId}/read`, {}, token),

  markAllRead: (token: string) => apiPost<void>('/notifications/read-all', {}, token),

  unreadCount: (token: string) => apiGet<{ count: number }>('/notifications/unread-count', token),
};
