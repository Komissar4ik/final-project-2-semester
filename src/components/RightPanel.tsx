import { motion } from 'framer-motion';
import { UserPlus, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { formatCount } from '../lib/utils';
import Avatar from './Avatar';
import Button from './Button';

const TRENDING_TAGS = [
  { tag: 'typescript', posts: '2.4K posts' },
  { tag: 'react', posts: '1.8K posts' },
  { tag: 'ai', posts: '5.2K posts' },
  { tag: 'design', posts: '980 posts' },
  { tag: 'saas', posts: '1.1K posts' },
];

const panelClass =
  'rounded-2xl border border-tbank-border bg-white p-4 shadow-card dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none';

export default function RightPanel() {
  const { allUsers, followedUserIds, toggleFollow } = useAppStore();
  const suggestions = allUsers.filter((u) => !followedUserIds.has(u.id)).slice(0, 4);

  return (
    <motion.aside
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="hidden lg:flex flex-col w-72 h-screen sticky top-0 p-4 gap-5 shrink-0 overflow-y-auto scrollbar-none
        border-l border-tbank-border/60 dark:border-white/[0.06]"
    >
      {/* Trending */}
      <div className={panelClass}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={15} className="text-brand dark:text-brand" />
          <h3 className="text-sm font-semibold text-tbank-black dark:text-white">Trending</h3>
        </div>
        <div className="space-y-2">
          {TRENDING_TAGS.map(({ tag, posts }, i) => (
            <div key={tag} className="flex items-center justify-between group cursor-pointer py-1">
              <div>
                <p className="text-sm font-medium text-stone-800 group-hover:text-tbank-black dark:text-white/80 dark:group-hover:text-brand transition-colors">
                  #{tag}
                </p>
                <p className="text-xs text-stone-500 dark:text-white/30">{posts}</p>
              </div>
              <span className="text-xs text-stone-400 dark:text-white/20">#{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Who to follow — TODO: GET /api/users/suggestions */}
      <div className={panelClass}>
        <div className="flex items-center gap-2 mb-3">
          <UserPlus size={15} className="text-brand dark:text-brand" />
          <h3 className="text-sm font-semibold text-tbank-black dark:text-white">Who to follow</h3>
        </div>
        <div className="space-y-3">
          {suggestions.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <Link to={`/app/profile/${user.id}`} className="flex-shrink-0">
                <Avatar src={user.avatar} alt={user.displayName} size="sm" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/app/profile/${user.id}`}
                  className="text-sm font-medium text-stone-800 hover:text-tbank-black dark:text-white/80 dark:hover:text-white transition-colors block truncate"
                >
                  {user.displayName}
                </Link>
                <p className="text-xs text-stone-500 dark:text-white/30 truncate">
                  {formatCount(user.followersCount)} followers
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toggleFollow(user.id)} className="text-xs px-2.5 py-1">
                Follow
              </Button>
            </div>
          ))}
        </div>
        <Link to="/app/users" className="block mt-3 text-xs text-stone-500 hover:text-tbank-black font-medium dark:text-brand/70 dark:hover:text-brand transition-colors">
          See all people →
        </Link>
      </div>

      <p className="text-xs text-stone-400 dark:text-white/20 px-1">Nexus Social · University Project 2026</p>
    </motion.aside>
  );
}
