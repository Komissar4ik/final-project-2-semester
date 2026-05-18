import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Github, Chrome, ArrowLeft } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Button from '../components/Button';
import ThemeToggle from '../components/ThemeToggle';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

function YandexIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.4 3H12.6C9.4 3 7.5 4.7 7.5 7.5c0 2.4 1.1 3.9 3.2 5.3L8 21h2.3l2.5-7.7.7.4L16.4 21H19l-3.2-8.2C17.6 11.2 18.5 9.5 18.5 7.5 18.5 4.6 16.8 3 14.4 3zm-1.6 8.8l-.6-.4C10.6 10.1 9.8 9 9.8 7.5 9.8 5.9 10.8 5 12.7 5h1.6C15.9 5 16.8 5.9 16.8 7.5c0 1.7-.9 2.8-2.5 3.9l-.5.4z" />
    </svg>
  );
}

const AUTH_PROVIDERS = [
  { id: 'GOOGLE', label: 'Continue with Google', icon: <Chrome size={18} />, hoverClass: 'hover:border-[#4285F4]/40 hover:bg-[#4285F4]/8' },
  { id: 'GITHUB', label: 'Continue with GitHub', icon: <Github size={18} />, hoverClass: 'hover:border-stone-400/50 hover:bg-stone-50 dark:hover:border-white/25 dark:hover:bg-white/8' },
  { id: 'YANDEX', label: 'Continue with Yandex', icon: <YandexIcon size={18} />, hoverClass: 'hover:border-[#FC3F1D]/40 hover:bg-[#FC3F1D]/8' },
] as const;

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithProvider, login, register, status, error } = useAuthStore();
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const isLoading = status === 'loading';
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    password: '',
  });

  const handleAuth = async (provider: (typeof AUTH_PROVIDERS)[number]['id']) => {
    const user = await loginWithProvider(provider);
    setCurrentUser(user);
    navigate((location.state as { from?: string } | null)?.from ?? '/app/feed', { replace: true });
  };

  const handlePasswordAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const user =
      mode === 'login'
        ? await login({ email: formData.email, password: formData.password })
        : await register({
            email: formData.email,
            displayName: formData.displayName,
            password: formData.password,
          });

    setCurrentUser(user);
    navigate((location.state as { from?: string } | null)?.from ?? '/app/feed', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans text-tbank-black dark:text-white">
      <AnimatedBackground />

      <div className="fixed top-6 left-6 right-6 z-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-sm text-stone-600 hover:text-tbank-black dark:text-white/40 dark:hover:text-white transition-colors">
          <ArrowLeft size={16} />Back
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md pt-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex w-16 h-16 rounded-3xl bg-brand items-center justify-center mb-4 shadow-glow dark:shadow-glow-dark">
            <span className="text-tbank-black font-bold text-3xl font-display leading-none">T</span>
          </div>
          <h1 className="text-3xl font-bold text-tbank-black dark:text-white font-display">Welcome to Nexus</h1>
          <p className="text-stone-600 dark:text-white/45 mt-2">Sign in to start connecting</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="rounded-3xl border border-tbank-border bg-white p-8 shadow-[0_8px_48px_rgba(15,23,42,0.10)]
            dark:border-white/[0.09] dark:bg-white/[0.05] dark:backdrop-blur-2xl dark:shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        >
          <h2 className="text-xs font-semibold text-stone-500 dark:text-white/50 text-center mb-6 uppercase tracking-widest">
            Sign in with email
          </h2>

          <form className="space-y-3 mb-6" onSubmit={(event) => void handlePasswordAuth(event)}>
            <div className="flex gap-1 rounded-2xl border border-tbank-border bg-tbank-gray/70 p-1 dark:border-white/[0.08] dark:bg-white/[0.04]">
              {(['login', 'register'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    mode === item
                      ? 'bg-brand text-tbank-black shadow-[0_2px_8px_rgba(255,221,45,0.35)]'
                      : 'text-stone-500 hover:text-tbank-black dark:text-white/45 dark:hover:text-white'
                  }`}
                >
                  {item === 'login' ? 'Login' : 'Register'}
                </button>
              ))}
            </div>

            {mode === 'register' && (
              <input
                value={formData.displayName}
                onChange={(event) => setFormData((data) => ({ ...data, displayName: event.target.value }))}
                placeholder="Display name"
                className="w-full rounded-2xl border border-tbank-border bg-tbank-gray/70 px-4 py-3 text-sm text-tbank-black outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,221,45,0.2)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
                minLength={2}
                required
              />
            )}

            <input
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((data) => ({ ...data, email: event.target.value }))}
              placeholder="Email"
              className="w-full rounded-2xl border border-tbank-border bg-tbank-gray/70 px-4 py-3 text-sm text-tbank-black outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,221,45,0.2)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
              required
            />
            <input
              type="password"
              value={formData.password}
              onChange={(event) => setFormData((data) => ({ ...data, password: event.target.value }))}
              placeholder="Password"
              className="w-full rounded-2xl border border-tbank-border bg-tbank-gray/70 px-4 py-3 text-sm text-tbank-black outline-none transition-all focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,221,45,0.2)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
              minLength={6}
              required
            />
            <Button variant="primary" size="md" type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
            </Button>
          </form>

          <h2 className="text-xs font-semibold text-stone-500 dark:text-white/50 text-center mb-4 uppercase tracking-widest">
            Or use OAuth
          </h2>

          <div className="space-y-3">
            {AUTH_PROVIDERS.map(({ id, label, icon, hoverClass }, i) => (
              <motion.button
                key={id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => void handleAuth(id)}
                disabled={isLoading}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl
                  border border-tbank-border bg-tbank-gray/70 text-tbank-black text-sm font-medium
                  dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/85
                  transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-wait ${hoverClass}`}
              >
                <span className="text-stone-600 dark:text-white/60">{icon}</span>
                {isLoading ? 'Signing in...' : label}
              </motion.button>
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </p>
          )}

          <div className="mt-6 pt-6 border-t border-tbank-border dark:border-white/[0.07]">
            <p className="text-xs text-stone-500 dark:text-white/30 text-center leading-relaxed">
              By continuing, you agree to Nexus's{' '}
              <span className="text-tbank-black font-medium hover:underline dark:text-brand/80 dark:hover:text-brand cursor-pointer transition-colors">Terms of Service</span>
              {' '}and{' '}
              <span className="text-tbank-black font-medium hover:underline dark:text-brand/80 dark:hover:text-brand cursor-pointer transition-colors">Privacy Policy</span>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-xs text-stone-400 dark:text-white/25 mb-2">or</p>
          <Button variant="ghost" size="sm" onClick={() => void handleAuth('GOOGLE')} disabled={isLoading}>
            Continue with Google →
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
