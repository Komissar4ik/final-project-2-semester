import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import UserCard from '../components/UserCard';
import PageTransition from '../app/PageTransition';
import { cn } from '../lib/utils';

type Tab = 'all' | 'following';

export default function UsersPage() {
  const { allUsers, followedUserIds } = useAppStore();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const navigate = useNavigate();

  // TODO: GET /api/users?search={query}
  const filtered = allUsers
    .filter((u) => (tab === 'following' ? followedUserIds.has(u.id) : true))
    .filter(
      (u) =>
        !search.trim() ||
        u.displayName.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.bio.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Users size={18} className="text-brand" />
          <h1 className="text-xl font-bold text-tbank-black dark:text-white font-display">People</h1>
        </div>

        <div className="space-y-3">
          {/* Search */}
          <div
            className="flex items-center gap-2 rounded-2xl bg-tbank-gray border border-tbank-border px-4 py-3
            focus-within:border-brand focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(255,221,45,0.2)]
            dark:bg-white/[0.06] dark:border-white/[0.09] dark:focus-within:border-brand/60 transition-all"
          >
            <Search size={15} className="text-stone-400 flex-shrink-0 dark:text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username or bio..."
              className="flex-1 bg-transparent text-sm text-tbank-black placeholder-stone-400 outline-none dark:text-white dark:placeholder-white/30"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-xs text-stone-500 hover:text-tbank-black dark:text-white/30 dark:hover:text-white/60 transition-colors">
                Clear
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-2xl border border-tbank-border bg-white p-1 dark:border-white/[0.08] dark:bg-white/[0.04]">
            {(
              [['all', 'All people', <Users key="u" size={13} />], ['following', 'Following', <UserCheck key="uc" size={13} />]] as const
            ).map(([t, label, icon]) => (
              <button
                key={t}
                onClick={() => setTab(t as Tab)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-sm font-medium transition-all',
                  tab === t
                    ? 'bg-brand text-tbank-black shadow-[0_2px_8px_rgba(255,221,45,0.35)] dark:shadow-glow-dark'
                    : 'text-stone-500 hover:text-tbank-black hover:bg-brand/10 dark:text-white/45 dark:hover:text-white',
                )}
              >
                {icon}
                {label}
                {t === 'following' && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-tbank-border text-[10px] text-stone-600 dark:bg-white/[0.08] dark:text-white/40">
                    {followedUserIds.size}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-stone-500 dark:text-white/30">
            <p className="text-lg mb-2">No users found</p>
            <p className="text-sm">Try a different search query</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((user, i) => (
              <UserCard key={user.id} user={user} index={i} onClick={() => navigate(`/app/profile/${user.id}`)} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
