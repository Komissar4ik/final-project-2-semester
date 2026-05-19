import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn, formatRelativeTime } from '../lib/utils';
import Avatar from './Avatar';
import type { Comment } from '../types';

interface CommentCardProps {
  comment: Comment;
  index?: number;
}

export default function CommentCard({ comment, index = 0 }: CommentCardProps) {
  const { allUsers, currentUser, likedCommentIds, toggleCommentLike } = useAppStore();
  const author =
    comment.authorId === currentUser.id
      ? currentUser
      : allUsers.find((u) => u.id === comment.authorId);

  if (!author) return null;

  const isLiked = likedCommentIds.has(comment.id);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex gap-3"
    >
      <Avatar src={author.avatar} alt={author.displayName} size="sm" className="mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl bg-tbank-gray border border-tbank-border px-4 py-3 dark:bg-white/[0.05] dark:border-white/[0.07]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold text-tbank-black dark:text-white">{author.displayName}</span>
            <span className="text-xs text-stone-400 dark:text-white/30">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-stone-700 dark:text-white/75 leading-relaxed">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1.5 px-2">
          <button
            type="button"
            onClick={() => void toggleCommentLike(comment.id)}
            className={cn(
              'flex items-center gap-1 text-xs transition-colors group/like',
              isLiked
                ? 'text-rose-500 dark:text-rose-400'
                : 'text-stone-400 hover:text-rose-500 dark:text-white/30 dark:hover:text-rose-400',
            )}
          >
            <Heart
              size={12}
              className={cn(
                'transition-colors group-hover/like:fill-rose-500',
                isLiked && 'fill-rose-500 dark:fill-rose-400',
              )}
            />
            {comment.likesCount > 0 && comment.likesCount}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
