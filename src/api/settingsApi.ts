import { apiClient } from './httpClient';
import type { ThemeMode } from '../store/useThemeStore';

export interface UserSettings {
  id: string;
  userId: string;
  theme: ThemeMode;
  publicProfile: boolean;
}

export type UpdateUserSettings = Pick<
  UserSettings,
  'theme' | 'publicProfile'
>;

export const settingsApi = {
  getMe() {
    return apiClient.get<UserSettings>('/settings/me');
  },

  updateMe(data: UpdateUserSettings) {
    return apiClient.patch<UserSettings>('/settings/me', data);
  },
};
