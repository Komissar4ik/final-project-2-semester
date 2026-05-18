import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Heart, MessageCircle, Search, Settings, UserPlus, X } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = [
    {
      id: 'welcome',
      icon: UserPlus,
      title: `Welcome back, ${currentUser.displayName}`,
      body: 'Your Nexus profile is ready for new connections.',
      time: 'Now',
    },
    {
      id: 'likes',
      icon: Heart,
      title: 'Your posts are live',
      body: 'Likes and comments from other users will appear here.',
      time: 'Today',
    },
    {
      id: 'comments',
      icon: MessageCircle,
      title: 'Join the conversation',
      body: 'Reply to posts to keep your feed active.',
      time: 'Today',
    },
  ];
  const isFeed = location.pathname === '/app/feed';

  useEffect(() => {
    if (isFeed) {
      setQuery(searchParams.get('q') ?? '');
    }
  }, [isFeed, searchParams]);

  useEffect(() => {
    if (!isFeed) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const trimmedQuery = query.trim();
      const currentQuery = searchParams.get('q') ?? '';

      if (trimmedQuery === currentQuery) {
        return;
      }

      const search = trimmedQuery ? `?q=${encodeURIComponent(trimmedQuery)}` : '';
      navigate(`/app/feed${search}`, { replace: true });
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [isFeed, navigate, query, searchParams]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    const search = trimmedQuery ? `?q=${encodeURIComponent(trimmedQuery)}` : '';
    navigate(`/app/feed${search}`);
  };

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
      <form
        onSubmit={submitSearch}
        className="flex-1 max-w-lg hidden sm:flex items-center gap-2 rounded-2xl
        bg-tbank-gray border border-tbank-border px-4 py-2.5
        focus-within:border-brand focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(255,221,45,0.25)]
        dark:bg-white/[0.06] dark:border-white/[0.08] dark:focus-within:border-brand/60 transition-all"
      >
        <Search size={15} className="text-stone-400 flex-shrink-0 dark:text-white/30" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => {
            if (isFeed && !query.trim() && searchParams.has('q')) {
              navigate('/app/feed');
            }
          }}
          placeholder="Search people, posts..."
          className="flex-1 bg-transparent text-sm text-tbank-black placeholder-stone-400 outline-none dark:text-white dark:placeholder-white/30"
        />
      </form>

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
          type="button"
          onClick={() => setNotificationsOpen(true)}
          aria-label="Open notifications"
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

      <AnimatePresence>
        {isNotificationsOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-end bg-black/20 px-4 pt-20 backdrop-blur-[2px] dark:bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setNotificationsOpen(false)}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="notifications-title"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onMouseDown={(event) => event.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-tbank-border bg-white p-4 shadow-[0_20px_60px_rgba(17,17,17,0.18)]
                dark:border-white/[0.08] dark:bg-[#18191c] dark:shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-tbank-border pb-3 dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand/20 text-tbank-black dark:bg-brand/25 dark:text-brand">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h2 id="notifications-title" className="text-sm font-semibold text-tbank-black dark:text-white">
                      Notifications
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-white/35">Latest account activity</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  aria-label="Close notifications"
                  className="rounded-xl p-2 text-stone-500 transition-colors hover:bg-tbank-gray hover:text-tbank-black
                    dark:text-white/45 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {notifications.map(({ id, icon: Icon, title, body, time }) => (
                  <div key={id} className="flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-tbank-gray dark:hover:bg-white/[0.05]">
                    <div className="mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl bg-brand/15 text-tbank-black dark:bg-brand/20 dark:text-brand">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug text-tbank-black dark:text-white">{title}</p>
                        <span className="text-[11px] text-stone-400 dark:text-white/25">{time}</span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-stone-500 dark:text-white/35">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
