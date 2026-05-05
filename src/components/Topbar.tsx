import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Settings } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import Avatar from './Avatar';
import ThemeToggle from './ThemeToggle';
import { cn } from '../lib/utils';

function TBankLogo() {
  return (
    <Link to="/app/feed" className="md:hidden flex items-center gap-2">
      <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center shadow-glow dark:shadow-glow-dark">
        <span className="text-tbank-black font-bold text-sm font-display leading-none">T</span>
      </div>
      <span className="text-base font-bold text-tbank-black dark:text-white font-display">Nexus</span>
    </Link>
  );
}

export default function Topbar() {
  const { currentUser } = useAppStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3.5
        border-b border-tbank-border/70 bg-white/95 backdrop-blur-sm
        dark:border-white/[0.07] dark:bg-[#111214]/90 dark:backdrop-blur-xl"
    >
      <TBankLogo />

      {/* Search — TODO: GET /api/search?q={query} */}
      <div
        className="flex-1 max-w-lg hidden sm:flex items-center gap-2 rounded-2xl
        bg-tbank-gray border border-tbank-border px-4 py-2.5
        focus-within:border-brand focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(255,221,45,0.25)]
        dark:bg-white/[0.06] dark:border-white/[0.08] dark:focus-within:border-brand/60 transition-all"
      >
        <Search size={15} className="text-stone-400 flex-shrink-0 dark:text-white/30" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people, posts..."
          className="flex-1 bg-transparent text-sm text-tbank-black placeholder-stone-400 outline-none dark:text-white dark:placeholder-white/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <NavLink
          to="/app/settings"
          title="Settings"
          aria-label="Settings"
          className={({ isActive }) =>
            cn(
              'p-2.5 rounded-xl transition-all',
              isActive
                ? 'text-tbank-black bg-brand shadow-[0_2px_6px_rgba(255,221,45,0.35)] dark:text-tbank-black dark:shadow-glow-dark'
                : 'text-stone-500 hover:text-tbank-black hover:bg-brand/12 dark:text-white/50 dark:hover:text-white dark:hover:bg-brand/10',
            )
          }
        >
          <Settings size={18} />
        </NavLink>
        <ThemeToggle />

        <button
          className="relative p-2.5 rounded-xl text-stone-500 hover:text-tbank-black hover:bg-brand/12
            dark:text-white/50 dark:hover:text-white dark:hover:bg-brand/10 transition-all"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand" />
        </button>

        <button onClick={() => navigate('/app/profile/me')} className="flex-shrink-0">
          <Avatar src={currentUser.avatar} alt={currentUser.displayName} size="sm" ring />
        </button>
      </div>
    </motion.header>
  );
}
