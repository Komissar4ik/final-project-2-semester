import { motion } from 'framer-motion';
import { UserPlus, UserCheck, MapPin, ExternalLink, BadgeCheck } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { formatCount } from '../lib/utils';
import Avatar from './Avatar';
import Button from './Button';
import type { User } from '../types';

interface UserCardProps {
  user: User;
  index?: number;
  onClick?: () => void;
}

export default function UserCard({ user, index = 0, onClick }: UserCardProps) {
  const { followedUserIds, toggleFollow } = useAppStore();
  const isFollowing = followedUserIds.has(user.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-tbank-border bg-white p-5 shadow-card
        hover:border-brand/60 hover:shadow-glow transition-all duration-200
        dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none dark:hover:border-brand/30"
    >
      <div className="flex items-start gap-4">
        <div className="cursor-pointer" onClick={onClick}>
          <Avatar src={user.avatar} alt={user.displayName} size="lg" ring />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={onClick}
              className="font-semibold text-tbank-black hover:text-stone-700 dark:text-white dark:hover:text-brand transition-colors font-display truncate"
            >
              {user.displayName}
            </button>
            {user.isVerified && <BadgeCheck size={15} className="text-brand flex-shrink-0" />}
          </div>
          <p className="text-xs text-stone-500 dark:text-white/40 mb-2">@{user.username}</p>
          <p className="text-sm text-stone-600 dark:text-white/60 leading-relaxed line-clamp-2 mb-3">
            {user.bio}
          </p>
          <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-white/40 flex-wrap">
            {user.location && (
              <span className="flex items-center gap-1"><MapPin size={11} />{user.location}</span>
            )}
            {user.website && (
              <a
                href={user.website}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 hover:text-brand transition-colors"
              >
                <ExternalLink size={11} />Website
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-tbank-border/70 dark:border-white/[0.07]">
        <div className="flex gap-4 text-xs">
          <span className="text-stone-500 dark:text-white/50">
            <span className="font-semibold text-tbank-black dark:text-white">{formatCount(user.followersCount)}</span> followers
          </span>
          <span className="text-stone-500 dark:text-white/50">
            <span className="font-semibold text-tbank-black dark:text-white">{formatCount(user.followingCount)}</span> following
          </span>
        </div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant={isFollowing ? 'secondary' : 'primary'}
            size="sm"
            icon={isFollowing ? <UserCheck size={13} /> : <UserPlus size={13} />}
            onClick={(e) => { e.stopPropagation(); toggleFollow(user.id); }}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
