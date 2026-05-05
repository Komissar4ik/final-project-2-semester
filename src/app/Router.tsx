import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './Layout';
import LandingPage from '../pages/LandingPage';
import AuthPage from '../pages/AuthPage';
import FeedPage from '../pages/FeedPage';
import ProfilePage from '../pages/ProfilePage';
import UsersPage from '../pages/UsersPage';
import PostDetailPage from '../pages/PostDetailPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          <Route path="/app" element={<Layout />}>
            <Route index element={<Navigate to="/app/feed" replace />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="profile/:id" element={<ProfilePage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="post/:id" element={<PostDetailPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
