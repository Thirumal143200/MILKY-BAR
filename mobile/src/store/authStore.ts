import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
};

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setSession: (token: string, refreshToken: string, user: User) => Promise<void>;
  clearSession: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  setSession: async (token, refreshToken, user) => {
    await AsyncStorage.setItem('jwt_token', token);
    await AsyncStorage.setItem('refresh_token', refreshToken);
    await AsyncStorage.setItem('user_role', user.role);
    set({ token, refreshToken, user, isAuthenticated: true });
  },
  clearSession: async () => {
    await AsyncStorage.removeItem('jwt_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user_role');
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  },
  loadSession: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('jwt_token');
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (token && refreshToken) {
        try {
          const res = await apiClient.get('/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const user = res.data.data || res.data;
          set({ token, refreshToken, user, isAuthenticated: true });
        } catch {
          await AsyncStorage.removeItem('jwt_token');
          await AsyncStorage.removeItem('refresh_token');
          await AsyncStorage.removeItem('user_role');
          set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
        }
      }
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },
}));
