/**
 * @module @milkboy/shared/types/user
 * User-related type definitions for the MilkBoy platform.
 */

/** User roles in the system */
export type UserRole = 'super_admin' | 'admin' | 'producer' | 'consumer' | 'lab_staff';

/** User account status */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

/** Theme preference */
export type ThemePreference = 'light' | 'dark' | 'system';

/** Supported languages */
export type Language = 'en' | 'es' | 'fr' | 'hi' | 'ta';

/** Core user entity */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  avatarUrl?: string;
  mfaEnabled: boolean;
  language: Language;
  theme: ThemePreference;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** User profile (public-safe subset) */
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  language: Language;
  theme: ThemePreference;
  mfaEnabled: boolean;
  createdAt: string;
}

/** User session */
export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  lastActiveAt: string;
  expiresAt: string;
  createdAt: string;
}

/** User device for push notifications */
export interface UserDevice {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: 'android' | 'ios' | 'web';
  pushToken?: string;
  lastActiveAt: string;
  createdAt: string;
}

/** Auth tokens returned on login */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

/** Login request */
export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
  deviceInfo?: string;
}

/** Register request */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phone?: string;
  language?: Language;
}

/** Login response */
export interface LoginResponse {
  user: UserProfile;
  tokens: AuthTokens;
  requiresMfa: boolean;
}
