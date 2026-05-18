import { create } from 'zustand';
import { authApi } from '../api/authApi';
import { ApiError } from '../api/httpClient';
import type { User } from '../types';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous';
type OAuthProvider = 'GOOGLE' | 'GITHUB' | 'YANDEX';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  hydrateSession: () => Promise<User | null>;
  login: (data: { email: string; password: string }) => Promise<User>;
  register: (data: { email: string; displayName: string; password: string }) => Promise<User>;
  loginWithProvider: (provider: OAuthProvider) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    return 'You need to sign in first.';
  }

  return error instanceof Error ? error.message : 'Something went wrong.';
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  error: null,

  setUser: (user) => set({ user, status: user ? 'authenticated' : 'anonymous', error: null }),

  hydrateSession: async () => {
    set({ status: 'loading', error: null });

    try {
      const user = await authApi.me();
      set({ user, status: 'authenticated', error: null });
      return user;
    } catch (error) {
      const isUnauthorized = error instanceof ApiError && error.status === 401;
      set({ user: null, status: 'anonymous', error: isUnauthorized ? null : getErrorMessage(error) });
      return null;
    }
  },

  loginWithProvider: async (provider) => {
    set({ status: 'loading', error: null });

    try {
      authApi.redirectToProvider(provider);
      return await new Promise<User>(() => {});
    } catch (error) {
      set({ user: null, status: 'anonymous', error: getErrorMessage(error) });
      throw error;
    }
  },

  login: async (data) => {
    set({ status: 'loading', error: null });

    try {
      const user = await authApi.login(data);
      set({ user, status: 'authenticated', error: null });
      return user;
    } catch (error) {
      set({ user: null, status: 'anonymous', error: getErrorMessage(error) });
      throw error;
    }
  },

  register: async (data) => {
    set({ status: 'loading', error: null });

    try {
      const user = await authApi.register(data);
      set({ user, status: 'authenticated', error: null });
      return user;
    } catch (error) {
      set({ user: null, status: 'anonymous', error: getErrorMessage(error) });
      throw error;
    }
  },

  logout: async () => {
    set({ status: 'loading', error: null });

    try {
      await authApi.logout();
    } finally {
      set({ user: null, status: 'anonymous', error: null });
    }
  },
}));
