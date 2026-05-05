import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import PostCard from '../components/PostCard';
import CommentCard from '../components/CommentCard';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import PageTransition from '../app/PageTransition';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { posts, comments, currentUser, addComment } = useAppStore();
  const [commentText, setCommentText] = useState('');

  // TODO: GET /api/posts/:id
  const post = posts.find((p) => p.id === id);
  const postComments = comments.filter((c) => c.postId === id);

  const handleSubmit = () => {
    if (!commentText.trim() || !id) return;
    addComment(id, commentText);
    setCommentText('');
  };

  if (!post) {
    return (
      <div className="text-center py-24 text-stone-500 dark:text-white/40">
        <p className="text-lg">Post not found</p>
        <Link to="/app/feed" className="text-brand text-sm mt-2 block hover:underline">Back to feed</Link>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/app/feed" className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-tbank-black dark:text-white/40 dark:hover:text-white transition-colors">
          <ArrowLeft size={15} />Back to feed
        </Link>

        <PostCard post={post} expanded />

        {/* Comments section */}
        <div className="rounded-2xl border border-tbank-border bg-white p-5 shadow-card dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
          <div className="flex items-center gap-2 mb-5">
            <MessageCircle size={16} className="text-brand" />
            <h2 className="text-sm font-semibold text-tbank-black dark:text-white">
              Comments · {postComments.length}
            </h2>
          </div>

          {/* Comment input */}
          <div className="flex gap-3 mb-6 pb-6 border-b border-tbank-border/70 dark:border-white/[0.07]">
            <Avatar src={currentUser.avatar} alt={currentUser.displayName} size="sm" className="mt-0.5 flex-shrink-0" />
            <div className="flex-1 flex items-center gap-2 rounded-2xl bg-tbank-gray border border-tbank-border px-4 py-3
              focus-within:border-brand focus-within:shadow-[0_0_0_3px_rgba(255,221,45,0.2)]
              dark:bg-white/[0.06] dark:border-white/[0.09] dark:focus-within:border-brand/60 transition-all">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Share your thoughts..."
                className="flex-1 bg-transparent text-sm text-tbank-black placeholder-stone-400 outline-none dark:text-white dark:placeholder-white/30"
              />
              <Button variant="primary" size="sm" icon={<Send size={13} />} onClick={handleSubmit} disabled={!commentText.trim()}>
                Post
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {postComments.length === 0 ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-stone-500 dark:text-white/30 text-center py-6">
                  No comments yet. Start the conversation!
                </motion.p>
              ) : (
                postComments.map((c, i) => <CommentCard key={c.id} comment={c} index={i} />)
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
