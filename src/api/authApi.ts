import { apiClient } from './httpClient';
import { mapBackendUser, type BackendUser } from './mappers';
import type { User } from '../types';

type OAuthProvider = 'GOOGLE' | 'GITHUB' | 'YANDEX';

interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: string;
  };
  accessToken: string;
}

const demoProfiles: Record<OAuthProvider, { email: string; displayName: string; avatarUrl: string }> = {
  GOOGLE: {
    email: 'student.google@example.com',
    displayName: 'Google Student',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=google-student',
  },
  GITHUB: {
    email: 'student.github@example.com',
    displayName: 'GitHub Student',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=github-student',
  },
  YANDEX: {
    email: 'student.yandex@example.com',
    displayName: 'Yandex Student',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=yandex-student',
  },
};

export const authApi = {
  async register(data: { email: string; displayName: string; password: string }): Promise<User> {
    await apiClient.post<AuthResponse>('/auth/register', data);
    return this.me();
  },

  async login(data: { email: string; password: string }): Promise<User> {
    await apiClient.post<AuthResponse>('/auth/login', data);
    return this.me();
  },

  async loginWithDemoProvider(provider: OAuthProvider): Promise<User> {
    const profile = demoProfiles[provider];

    await apiClient.post<AuthResponse>('/auth/oauth/callback', {
      provider,
      providerUserId: `demo-${provider.toLowerCase()}-student`,
      ...profile,
    });

    return this.me();
  },

  async me(): Promise<User> {
    const user = await apiClient.get<BackendUser>('/auth/me');
    return mapBackendUser(user);
  },

  async logout() {
    await apiClient.post<{ success: true }>('/auth/logout');
  },
};
