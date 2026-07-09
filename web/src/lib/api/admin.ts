import { apiGet, apiPatch, apiPost } from './client';
import type { User, UserProfile } from '@milkboy/shared';

interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface AdminUser extends User {
  roleId: string;
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

interface SystemHealth {
  status: string;
  database: string;
  storage: string;
  uptime: number;
  memory: { heapUsed: number; heapTotal: number };
}

interface AnalyticsMetrics {
  totalUsers: number;
  totalScans: number;
  totalReports: number;
  averageConfidence: number;
  scansByStatus: Record<string, number>;
  scansByQuality: Record<string, number>;
  recentActivity: { date: string; scans: number }[];
}

/** Users API module */
export const usersApi = {
  me: (token: string) => apiGet<UserProfile>('/users/me', token),

  updateProfile: (token: string, data: Partial<UserProfile>) =>
    apiPatch<UserProfile>('/users/me', data, token),

  uploadAvatar: async (token: string, formData: FormData) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'}/users/me/avatar`,
      { method: 'POST', body: formData, headers: { Authorization: `Bearer ${token}` } },
    );
    const body = (await res.json()) as { data: { avatarUrl: string } };
    return body.data;
  },
};

/** Admin API module */
export const adminApi = {
  listUsers: (
    token: string,
    params?: { page?: number; limit?: number; role?: string; status?: string; search?: string },
  ) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiGet<PaginatedResponse<AdminUser>>(`/admin/users${qs ? `?${qs}` : ''}`, token);
  },

  updateUserRole: (token: string, userId: string, role: string) =>
    apiPatch<AdminUser>(`/admin/users/${userId}/role`, { role }, token),

  updateUserStatus: (token: string, userId: string, status: string) =>
    apiPatch<AdminUser>(`/admin/users/${userId}/status`, { status }, token),

  auditLogs: (
    token: string,
    params?: { page?: number; limit?: number; userId?: string; action?: string },
  ) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiGet<PaginatedResponse<AuditLog>>(`/admin/audit-logs${qs ? `?${qs}` : ''}`, token);
  },

  systemHealth: (token: string) => apiGet<SystemHealth>('/admin/health', token),

  analytics: (token: string) => apiGet<AnalyticsMetrics>('/admin/analytics', token),

  backup: (token: string) =>
    apiPost<{ message: string; downloadUrl: string }>('/admin/backup', {}, token),
};
