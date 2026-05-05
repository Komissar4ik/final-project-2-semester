import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'nexus-theme';

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  root.dataset.theme = mode;
  localStorage.setItem(STORAGE_KEY, mode);
}

function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  // Accept only explicit 'dark', everything else → light
  return stored === 'dark' ? 'dark' : 'light';
}

/**
 * Call ONCE before React mounts.
 * Syncs the <html class="dark"> with the stored preference.
 * Also removes any stale class that may remain from old code.
 */
export function initThemeClass() {
  const mode = readStoredTheme();
  applyTheme(mode);
}

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: readStoredTheme(),

  toggle: () => {
    const rootIsDark = document.documentElement.classList.contains('dark');
    const next: ThemeMode = rootIsDark ? 'light' : 'dark';
    applyTheme(next);
    set({ mode: next });
  },

  setMode: (mode) => {
    applyTheme(mode);
    set({ mode });
  },
}));
