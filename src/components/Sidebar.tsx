import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, User, Users, Settings, LogOut, BadgeCheck } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';
import Avatar from './Avatar';

const NAV_ITEMS = [
  { to: '/app/feed', icon: Home, label: 'Feed' },
  { to: '/app/profile/me', icon: User, label: 'Profile' },
  { to: '/app/users', icon: Users, label: 'People' },
];

// T-Bank logo text mark
function TBankLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shadow-glow dark:shadow-glow-dark flex-shrink-0">
        <span className="text-tbank-black font-bold text-base font-display leading-none">T</span>
      </div>
      <span className="text-lg font-bold text-tbank-black dark:text-white font-display tracking-tight">
        Nexus
      </span>
    </div>
  );
}

export default function Sidebar() {
  const { currentUser } = useAppStore();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="hidden md:flex flex-col w-64 h-screen sticky top-0 p-4 gap-4 shrink-0
        border-r border-tbank-border/60 dark:border-white/[0.06]"
    >
      {/* Logo */}
      <div className="px-3 py-2">
        <TBankLogo />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand text-tbank-black shadow-[0_2px_8px_rgba(255,221,45,0.4)] dark:shadow-glow-dark'
                  : 'text-stone-600 hover:text-tbank-black hover:bg-brand/12 dark:text-white/60 dark:hover:text-white dark:hover:bg-brand/10',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-tbank-black' : ''} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="space-y-1">
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200',
              isActive
                ? 'bg-brand text-tbank-black shadow-[0_2px_8px_rgba(255,221,45,0.4)] dark:shadow-glow-dark'
                : 'text-stone-500 hover:text-tbank-black hover:bg-tbank-gray/80 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/[0.05]',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Settings size={16} className={isActive ? 'text-tbank-black' : ''} />
              Settings
            </>
          )}
        </NavLink>
        <button
          onClick={() => void handleLogout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm
          text-stone-500 hover:text-rose-600 hover:bg-rose-50
          dark:text-white/40 dark:hover:text-rose-400 dark:hover:bg-rose-500/[0.08] transition-all duration-200"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>

      {/* Current user mini card */}
      <div
        className="flex items-center gap-3 p-3 rounded-2xl border border-tbank-border bg-tbank-gray/60
          hover:border-brand/50 hover:bg-brand/8 transition-all duration-200 cursor-pointer
          dark:border-white/[0.07] dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
        onClick={() => navigate('/app/profile/me')}
      >
        <Avatar src={currentUser.avatar} alt={currentUser.displayName} size="sm" ring />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 truncate">
            <p className="text-sm font-medium text-tbank-black dark:text-white truncate">
              {currentUser.displayName}
            </p>
            <BadgeCheck size={12} className="text-brand flex-shrink-0" />
          </div>
          <p className="text-xs text-stone-500 dark:text-white/40 truncate">@{currentUser.username}</p>
        </div>
      </div>
    </motion.aside>
  );
}
