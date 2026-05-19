import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Lock, LogOut, Palette, Save, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../app/PageTransition';
import { cn } from '../lib/utils';
import { settingsApi, type UpdateUserSettings } from '../api/settingsApi';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore, type ThemeMode } from '../store/useThemeStore';

function ToggleRow({
  label,
  description,
  pressed,
  onToggle,
}: {
  label: string;
  description?: string;
  pressed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-tbank-border/80 last:border-0 dark:border-white/[0.06]">
      <div className="min-w-0">
        <p className="text-sm font-medium text-tbank-black dark:text-white">{label}</p>
        {description ? (
          <p className="text-xs text-stone-500 mt-1 dark:text-white/40">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={pressed}
        onClick={onToggle}
        className={cn(
          'relative h-8 w-[52px] shrink-0 rounded-full transition-colors',
          pressed ? 'bg-brand' : 'bg-stone-200 dark:bg-white/[0.12]',
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200',
            pressed ? 'translate-x-[22px]' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Palette;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-tbank-border bg-white p-5 shadow-card dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none"
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={18} className="text-brand" />
        <h2 className="text-base font-bold text-tbank-black dark:text-white font-display">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

const defaultSettings: UpdateUserSettings = {
  theme: 'light',
  publicProfile: true,
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const setThemeMode = useThemeStore((state) => state.setMode);
  const [settings, setSettings] = useState<UpdateUserSettings>(defaultSettings);
  const [savedSettings, setSavedSettings] = useState<UpdateUserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      setIsLoading(true);
      setMessage(null);

      try {
        const next = await settingsApi.getMe();
        const formSettings = {
          theme: next.theme,
          publicProfile: next.publicProfile,
        };

        if (!isMounted) return;

        setSettings(formSettings);
        setSavedSettings(formSettings);
        setThemeMode(next.theme);
      } catch (error) {
        if (!isMounted) return;
        setMessage(error instanceof Error ? error.message : 'Failed to load settings.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, [setThemeMode]);

  const updateSetting = <Key extends keyof UpdateUserSettings>(
    key: Key,
    value: UpdateUserSettings[Key],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));

    if (key === 'theme') {
      setThemeMode(value as ThemeMode);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const next = await settingsApi.updateMe(settings);
      const formSettings = {
        theme: next.theme,
        publicProfile: next.publicProfile,
      };

      setSettings(formSettings);
      setSavedSettings(formSettings);
      setThemeMode(next.theme);
      setMessage('Settings saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <PageTransition>
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Settings size={18} className="text-brand" />
          <h1 className="text-xl font-bold text-tbank-black dark:text-white font-display">Settings</h1>
        </div>
        {message ? (
          <p className="rounded-xl border border-tbank-border bg-white px-4 py-3 text-sm text-stone-600 shadow-card dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/60 dark:shadow-none">
            {message}
          </p>
        ) : null}

        <Section icon={Palette} title="Appearance">
          <div className="flex items-center justify-between gap-4 pt-2">
            <div>
              <p className="text-sm font-medium text-tbank-black dark:text-white">Theme</p>
              <p className="text-xs text-stone-500 mt-1 dark:text-white/40">Saved to your account</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateSetting('theme', 'light')}
                className={cn(
                  'rounded-xl border px-3 py-2 text-sm transition-colors',
                  settings.theme === 'light'
                    ? 'border-brand bg-brand text-tbank-black'
                    : 'border-tbank-border bg-white text-stone-600 hover:border-brand/60 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/60',
                )}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => updateSetting('theme', 'dark')}
                className={cn(
                  'rounded-xl border px-3 py-2 text-sm transition-colors',
                  settings.theme === 'dark'
                    ? 'border-brand bg-brand text-tbank-black'
                    : 'border-tbank-border bg-white text-stone-600 hover:border-brand/60 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/60',
                )}
              >
                Dark
              </button>
            </div>
          </div>
        </Section>

        <Section icon={Lock} title="Privacy">
          <div className="mt-2">
            <ToggleRow
              label="Public profile"
              description="When disabled, other users cannot see your profile details or posts"
              pressed={settings.publicProfile}
              onToggle={() => updateSetting('publicProfile', !settings.publicProfile)}
            />
          </div>
        </Section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void saveSettings()}
            disabled={isLoading || isSaving || !isDirty}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-tbank-black shadow-glow transition-opacity disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-glow-dark"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save settings'}
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
