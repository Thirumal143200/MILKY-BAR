import { apiGet, apiPatch, apiPost, apiDelete, apiPut } from './client';
import type { User, UserProfile } from '@milkboy/shared';

interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface AdminUser extends Omit<User, 'role' | 'status'> {
  roleId?: string;
  role: string;
  status: string;
}

interface AuditLog {
  id: string;
  userId: string;
  userEmail?: string;
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

  createUser: (token: string, data: Record<string, unknown>) =>
    apiPost<AdminUser>('/admin/users', data, token),

  updateUser: (token: string, userId: string, data: Record<string, unknown>) =>
    apiPatch<AdminUser>(`/admin/users/${userId}`, data, token),

  updateUserRole: (token: string, userId: string, role: string) =>
    apiPatch<AdminUser>(`/admin/users/${userId}`, { role }, token),

  updateUserStatus: (token: string, userId: string, status: string) =>
    apiPatch<AdminUser>(`/admin/users/${userId}`, { status }, token),

  deleteUser: (token: string, userId: string) => apiDelete<null>(`/admin/users/${userId}`, token),

  deactivateUser: (token: string, userId: string) =>
    apiPost<null>(`/admin/users/${userId}/deactivate`, {}, token),

  reactivateUser: (token: string, userId: string) =>
    apiPost<null>(`/admin/users/${userId}/reactivate`, {}, token),

  auditLogs: (
    token: string,
    params?: { page?: number; limit?: number; userId?: string; action?: string; search?: string },
  ) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiGet<PaginatedResponse<AuditLog>>(`/admin/audit-logs${qs ? `?${qs}` : ''}`, token);
  },

  systemHealth: (token: string) => apiGet<SystemHealth>('/admin/system/health', token),

  systemMonitoring: (token: string) => apiGet<Record<string, unknown>>('/admin/monitoring', token),

  databaseStatus: (token: string) =>
    apiGet<Record<string, unknown>>('/admin/system/database', token),

  aiModelMonitoring: (token: string) => apiGet<Record<string, unknown>>('/admin/system/ai', token),

  analytics: (token: string) => apiGet<AnalyticsMetrics>('/admin/analytics', token),

  producersAnalytics: (token: string) =>
    apiGet<Record<string, unknown>>('/admin/analytics/producers', token),

  consumersAnalytics: (token: string) =>
    apiGet<Record<string, unknown>>('/admin/analytics/consumers', token),

  labAnalytics: (token: string) => apiGet<Record<string, unknown>>('/admin/analytics/lab', token),

  reportAnalytics: (token: string) =>
    apiGet<Record<string, unknown>>('/admin/analytics/reports', token),

  featureFlags: (token: string) => apiGet<Record<string, unknown>[]>('/admin/feature-flags', token),

  updateFeatureFlag: (token: string, name: string, enabled: boolean) =>
    apiPut<Record<string, unknown>>('/admin/feature-flags', { name, enabled }, token),

  backupsList: (token: string) => apiGet<Record<string, unknown>[]>('/admin/backups', token),

  triggerBackup: (token: string) => apiPost<Record<string, unknown>>('/admin/backups', {}, token),
};
