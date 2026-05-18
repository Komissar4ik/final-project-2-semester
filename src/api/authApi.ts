import { apiClient } from './httpClient';
import { API_BASE_URL } from './httpClient';
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

export const authApi = {
  async register(data: { email: string; displayName: string; password: string }): Promise<User> {
    await apiClient.post<AuthResponse>('/auth/register', data);
    return this.me();
  },

  async login(data: { email: string; password: string }): Promise<User> {
    await apiClient.post<AuthResponse>('/auth/login', data);
    return this.me();
  },

  redirectToProvider(provider: OAuthProvider) {
    window.location.assign(`${API_BASE_URL}/auth/${provider.toLowerCase()}`);
  },

  async me(): Promise<User> {
    const user = await apiClient.get<BackendUser>('/auth/me');
    return mapBackendUser(user);
  },

  async logout() {
    await apiClient.post<{ success: true }>('/auth/logout');
  },
};
