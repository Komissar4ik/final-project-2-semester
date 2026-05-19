import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import Avatar from './Avatar';
import ThemeToggle from './ThemeToggle';

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
  const navigate = useNavigate();
  const location = useLocation();
  const isFeed = location.pathname === '/app/feed';
  const showGlobalSearch = location.pathname !== '/app/users';

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
      {showGlobalSearch && (
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
      )}

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <button onClick={() => navigate('/app/profile/me')} className="flex-shrink-0">
          <Avatar src={currentUser.avatar} alt={currentUser.displayName} size="sm" ring />
        </button>
      </div>
    </motion.header>
  );
}
