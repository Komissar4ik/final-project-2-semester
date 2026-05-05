import { useState } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Send, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import PostCard from '../components/PostCard';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import PageTransition from '../app/PageTransition';

export default function FeedPage() {
  const { posts, currentUser, addPost } = useAppStore();
  const [newPostText, setNewPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!newPostText.trim()) return;
    setIsPosting(true);
    // TODO: POST /api/posts { content }
    await new Promise((r) => setTimeout(r, 300));
    addPost(newPostText);
    setNewPostText('');
    setIsPosting(false);
  };

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} className="text-brand" />
          <h1 className="text-xl font-bold text-tbank-black dark:text-white font-display">Your Feed</h1>
        </div>

        {/* Post creation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-tbank-border bg-white p-5 shadow-card dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none"
        >
          <div className="flex gap-3">
            <Avatar src={currentUser.avatar} alt={currentUser.displayName} size="md" ring />
            <div className="flex-1">
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                className="w-full bg-transparent text-sm text-tbank-black placeholder-stone-400 outline-none resize-none leading-relaxed dark:text-white dark:placeholder-white/30"
              />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-tbank-border/70 dark:border-white/[0.06]">
                <button className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-tbank-black dark:text-white/30 dark:hover:text-white/60 transition-colors">
                  <ImagePlus size={15} />
                  Add image
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Send size={13} />}
                  onClick={handlePost}
                  disabled={!newPostText.trim() || isPosting}
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {sortedPosts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </PageTransition>
  );
}
