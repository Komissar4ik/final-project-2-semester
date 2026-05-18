import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './Layout';
import LandingPage from '../pages/LandingPage';
import AuthPage from '../pages/AuthPage';
import FeedPage from '../pages/FeedPage';
import ProfilePage from '../pages/ProfilePage';
import UsersPage from '../pages/UsersPage';
import PostDetailPage from '../pages/PostDetailPage';
import SettingsPage from '../pages/SettingsPage';
import { useAuthStore } from '../store/useAuthStore';

function ProtectedRoute() {
  const location = useLocation();
  const { status, hydrateSession } = useAuthStore();

  useEffect(() => {
    if (status === 'idle') {
      void hydrateSession();
    }
  }, [hydrateSession, status]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-stone-500 dark:text-white/50">
        Loading session...
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default function AppRouter() {
  return (
    <HashRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<Layout />}>
              <Route index element={<Navigate to="/app/feed" replace />} />
              <Route path="feed" element={<FeedPage />} />
              <Route path="profile/:id" element={<ProfilePage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="post/:id" element={<PostDetailPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </HashRouter>
  );
}
