import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, BadgeCheck, Send, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { formatRelativeTime, formatCount, cn } from '../lib/utils';
import Avatar from './Avatar';
import CommentCard from './CommentCard';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
  index?: number;
  expanded?: boolean;
}

export default function PostCard({ post, index = 0, expanded = false }: PostCardProps) {
  const {
    allUsers,
    currentUser,
    likedPostIds,
    bookmarkedPostIds,
    toggleLike,
    toggleBookmark,
    deletePost,
    addComment,
    comments,
  } = useAppStore();
  const [showComments, setShowComments] = useState(expanded);
  const [commentText, setCommentText] = useState('');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const author =
    post.authorId === currentUser.id
      ? currentUser
      : allUsers.find((u) => u.id === post.authorId);

  if (!author) return null;

  const isLiked = likedPostIds.has(post.id);
  const isBookmarked = bookmarkedPostIds.has(post.id);
  const canDelete = author.id === currentUser.id;
  const postComments = comments.filter((c) => c.postId === post.id);

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const handleShare = async () => {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
    const postUrl = `${window.location.origin}${basePath}/app/post/${post.id}`;
    const shareData = {
      title: `${author.displayName} on Nexus`,
      text: post.content,
      url: postUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(postUrl);
        setShareStatus('copied');
        window.setTimeout(() => setShareStatus('idle'), 1600);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setShareStatus('copied');
        window.setTimeout(() => setShareStatus('idle'), 1600);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl border border-tbank-border bg-white shadow-card overflow-hidden
        hover:border-brand/50 hover:shadow-[0_4px_20px_rgba(255,221,45,0.18)] transition-all duration-200
        dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none dark:hover:border-brand/25"
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-5 pb-3">
        <Link to={`/app/profile/${author.id}`} className="flex-shrink-0">
          <Avatar src={author.avatar} alt={author.displayName} size="md" ring />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              to={`/app/profile/${author.id}`}
              className="font-semibold text-tbank-black hover:text-stone-700 dark:text-white dark:hover:text-brand transition-colors font-display text-sm"
            >
              {author.displayName}
            </Link>
            {author.isVerified && <BadgeCheck size={14} className="text-brand flex-shrink-0" />}
          </div>
          <p className="text-xs text-stone-500 dark:text-white/40">
            @{author.username} · {formatRelativeTime(post.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share post"
          className="relative text-stone-400 hover:text-stone-700 dark:text-white/30 dark:hover:text-white/60 transition-colors p-1"
        >
          <Share2 size={14} />
          {shareStatus === 'copied' && (
            <span className="absolute right-0 top-7 rounded-lg bg-tbank-black px-2 py-1 text-[10px] font-medium text-white shadow-lg dark:bg-white dark:text-tbank-black">
              Copied
            </span>
          )}
        </button>
        {canDelete && (
          <button
            type="button"
            onClick={() => void deletePost(post.id)}
            aria-label="Delete post"
            title="Delete post"
            className="text-stone-400 hover:text-rose-600 dark:text-white/30 dark:hover:text-rose-400 transition-colors p-1"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pb-3">
        <p className="text-stone-800 dark:text-white/85 text-sm leading-relaxed">{post.content}</p>
        {post.tags && (
          <div className="flex gap-1.5 flex-wrap mt-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-stone-600 hover:text-tbank-black bg-tbank-gray hover:bg-brand/20 px-2 py-0.5 rounded-lg cursor-pointer transition-all dark:text-white/50 dark:bg-white/[0.05] dark:hover:text-brand dark:hover:bg-brand/10"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      {post.image && (
        <div className="mx-5 mb-3 overflow-hidden rounded-xl border border-tbank-border/50 dark:border-white/[0.06]">
          <img
            src={post.image}
            alt="Post"
            className="w-full h-52 object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-5 py-3 border-t border-tbank-border/60 dark:border-white/[0.06]">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => toggleLike(post.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200',
            isLiked
              ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10'
              : 'text-stone-500 hover:text-rose-500 hover:bg-rose-50 dark:text-white/40 dark:hover:text-rose-400 dark:hover:bg-rose-500/10',
          )}
        >
          <motion.div animate={isLiked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart size={15} className={cn(isLiked && 'fill-rose-500 dark:fill-rose-400')} />
          </motion.div>
          {formatCount(post.likesCount)}
        </motion.button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200',
            showComments
              ? 'text-tbank-black bg-brand/20 dark:text-brand dark:bg-brand/10'
              : 'text-stone-500 hover:text-tbank-black hover:bg-brand/12 dark:text-white/40 dark:hover:text-brand dark:hover:bg-brand/10',
          )}
        >
          <MessageCircle size={15} />
          {formatCount(post.commentsCount)}
        </button>

        <div className="ml-auto flex items-center gap-1">
          <Link
            to={`/app/post/${post.id}`}
            className="px-3 py-1.5 rounded-xl text-xs text-stone-500 hover:text-tbank-black hover:bg-tbank-gray
            dark:text-white/30 dark:hover:text-white dark:hover:bg-white/[0.07] transition-all"
          >
            View post
          </Link>
          <button
            type="button"
            onClick={() => toggleBookmark(post.id)}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
            title={isBookmarked ? 'Saved' : 'Save post'}
            className={cn(
              'p-1.5 rounded-xl transition-all',
              isBookmarked
                ? 'text-tbank-black bg-brand/20 dark:text-brand dark:bg-brand/10'
                : 'text-stone-400 hover:text-tbank-black hover:bg-tbank-gray dark:text-white/30 dark:hover:text-white dark:hover:bg-white/[0.07]',
            )}
          >
            <Bookmark size={14} className={cn(isBookmarked && 'fill-brand')} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-tbank-border/60 dark:border-white/[0.06]"
          >
            <div className="p-5 space-y-4">
              {postComments.length > 0 ? (
                postComments.map((c, i) => <CommentCard key={c.id} comment={c} index={i} />)
              ) : (
                <p className="text-sm text-stone-400 dark:text-white/30 text-center py-2">
                  No comments yet. Be the first!
                </p>
              )}

              <div className="flex gap-3 mt-4 pt-4 border-t border-tbank-border/50 dark:border-white/[0.05]">
                <Avatar src={currentUser.avatar} alt={currentUser.displayName} size="sm" className="flex-shrink-0 mt-0.5" />
                <div className="flex-1 flex items-center gap-2 rounded-xl bg-tbank-gray border border-tbank-border px-3 py-2 focus-within:border-brand focus-within:shadow-[0_0_0_2px_rgba(255,221,45,0.2)] dark:bg-white/[0.06] dark:border-white/[0.09] transition-all">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                    placeholder="Write a comment..."
                    className="flex-1 bg-transparent text-sm text-tbank-black placeholder-stone-400 outline-none dark:text-white dark:placeholder-white/25"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim()}
                    className="text-brand hover:text-brand-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Send size={14} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
