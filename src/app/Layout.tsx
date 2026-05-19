import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import RightPanel from '../components/RightPanel';
import MobileNav from '../components/MobileNav';
import AnimatedBackground from '../components/AnimatedBackground';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { settingsApi } from '../api/settingsApi';
import { useThemeStore } from '../store/useThemeStore';

export default function Layout() {
  const authUser = useAuthStore((state) => state.user);
  const { bootstrapApp, isBootstrapping } = useAppStore();
  const setThemeMode = useThemeStore((state) => state.setMode);

  useEffect(() => {
    void bootstrapApp(authUser);
  }, [authUser, bootstrapApp]);

  useEffect(() => {
    if (!authUser) return;

    let isMounted = true;

    async function syncAccountSettings() {
      try {
        const settings = await settingsApi.getMe();
        if (isMounted) {
          setThemeMode(settings.theme);
        }
      } catch {
        // Keep the locally stored theme if account settings cannot be loaded.
      }
    }

    void syncAccountSettings();

    return () => {
      isMounted = false;
    };
  }, [authUser, setThemeMode]);

  return (
    <div className="min-h-screen font-sans text-tbank-black dark:text-white">
      <AnimatedBackground />

      <div className="flex max-w-[1400px] mx-auto">
        <Sidebar />

        <main className="flex-1 min-w-0 flex flex-col">
          <Topbar />
          <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
            {isBootstrapping ? (
              <div className="py-24 text-center text-sm text-stone-500 dark:text-white/40">
                Loading workspace...
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </main>

        <RightPanel />
      </div>

      <MobileNav />
    </div>
  );
}
