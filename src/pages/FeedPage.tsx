import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Search, Send, Sparkles, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import PostCard from '../components/PostCard';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import PageTransition from '../app/PageTransition';

export default function FeedPage() {
  const { posts, currentUser, allUsers, addPost, loadFeed, isLoadingFeed, error } = useAppStore();
  const [newPostText, setNewPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const searchQuery = searchParams.get('q')?.trim() ?? '';

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const handlePost = async () => {
    if (!newPostText.trim()) return;
    setIsPosting(true);
    await addPost(newPostText, selectedImage ?? undefined);
    setNewPostText('');
    setSelectedImage(null);
    setIsPosting(false);
  };

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const normalizedQuery = searchQuery.toLowerCase();
  const filteredPosts = normalizedQuery
    ? sortedPosts.filter((post) => {
        const author =
          post.authorId === currentUser.id
            ? currentUser
            : allUsers.find((user) => user.id === post.authorId);
        const searchableText = [
          post.content,
          post.tags?.join(' '),
          author?.displayName,
          author?.username,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
    : sortedPosts;

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} className="text-brand" />
          <h1 className="text-xl font-bold text-tbank-black dark:text-white font-display">
            {searchQuery ? 'Search Results' : 'Your Feed'}
          </h1>
        </div>

        {searchQuery && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-tbank-border bg-white px-4 py-3 text-sm shadow-card dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
            <div className="flex min-w-0 items-center gap-2 text-stone-600 dark:text-white/55">
              <Search size={15} className="flex-shrink-0 text-brand" />
              <span className="truncate">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found for "{searchQuery}"
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/app/feed')}
              className="flex flex-shrink-0 items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-stone-500 transition-colors hover:bg-tbank-gray hover:text-tbank-black dark:text-white/35 dark:hover:bg-white/[0.06] dark:hover:text-white"
            >
              <X size={13} />
              Clear
            </button>
          </div>
        )}

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
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => setSelectedImage(event.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-tbank-black dark:text-white/30 dark:hover:text-white/60 transition-colors"
                >
                  <ImagePlus size={15} />
                  {selectedImage ? selectedImage.name : 'Add image'}
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

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        {isLoadingFeed ? (
          <div className="py-16 text-center text-sm text-stone-500 dark:text-white/40">Loading feed...</div>
        ) : sortedPosts.length === 0 ? (
          <div className="py-16 text-center text-sm text-stone-500 dark:text-white/40">
            No posts yet. Create the first one.
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center text-sm text-stone-500 dark:text-white/40">
            Nothing matched your search.
          </div>
        ) : (
          filteredPosts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
        )}
      </div>
    </PageTransition>
  );
}
