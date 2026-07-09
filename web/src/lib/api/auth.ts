import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserProfile,
  UserSession,
  AuthTokens,
} from '@milkboy/shared';

/** Auth API module */
export const authApi = {
  login: (data: LoginRequest) => apiPost<LoginResponse>('/auth/login', data),

  register: (data: RegisterRequest) => apiPost<UserProfile>('/auth/register', data),

  logout: (token: string) => apiPost<void>('/auth/logout', {}, token),

  refreshToken: (refreshToken: string) => apiPost<AuthTokens>('/auth/refresh', { refreshToken }),

  forgotPassword: (email: string) => apiPost<void>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiPost<void>('/auth/reset-password', { token, password }),

  verifyMfa: (email: string, mfaCode: string) =>
    apiPost<LoginResponse>('/auth/verify-mfa', { email, mfaCode }),

  me: (token: string) => apiGet<UserProfile>('/auth/me', token),

  setupMfa: (token: string) =>
    apiPost<{ qrCodeUrl: string; secret: string }>('/auth/mfa/setup', {}, token),

  confirmMfa: (token: string, code: string) => apiPost<void>('/auth/mfa/confirm', { code }, token),

  disableMfa: (token: string, code: string) => apiPost<void>('/auth/mfa/disable', { code }, token),

  sessions: (token: string) => apiGet<UserSession[]>('/auth/sessions', token),

  revokeSession: (token: string, sessionId: string) =>
    apiDelete(`/auth/sessions/${sessionId}`, token),

  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    apiPatch<void>('/auth/password', { currentPassword, newPassword }, token),
};
