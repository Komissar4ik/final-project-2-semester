import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Grid3X3, List } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import ProfileHeader from '../components/ProfileHeader';
import PostCard from '../components/PostCard';
import PageTransition from '../app/PageTransition';
import { cn } from '../lib/utils';

type ViewMode = 'list' | 'grid';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, allUsers, posts } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const user = id === 'me' ? currentUser : allUsers.find((u) => u.id === id);

  if (!user) {
    return (
      <div className="text-center py-24 text-stone-500 dark:text-white/40">
        <p className="text-lg">User not found</p>
      </div>
    );
  }

  const isCurrentUser = user.id === currentUser.id || id === 'me';
  // TODO: GET /api/users/:id/posts
  const userPosts = posts.filter((p) => p.authorId === user.id || (isCurrentUser && p.authorId === 'me'));

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        <ProfileHeader user={user} isCurrentUser={isCurrentUser} />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-stone-500 dark:text-white/50 uppercase tracking-wider">
              Posts · {userPosts.length}
            </h2>
            <div className="flex items-center gap-1 rounded-xl border border-tbank-border dark:border-white/[0.09] p-1">
              {(['list', 'grid'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'p-1.5 rounded-lg transition-all',
                    viewMode === mode
                      ? 'bg-brand text-tbank-black shadow-[0_1px_4px_rgba(255,221,45,0.4)]'
                      : 'text-stone-400 hover:text-tbank-black dark:text-white/30 dark:hover:text-white',
                  )}
                >
                  {mode === 'list' ? <List size={14} /> : <Grid3X3 size={14} />}
                </button>
              ))}
            </div>
          </div>

          {userPosts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-stone-500 dark:text-white/30">
              <p>No posts yet</p>
            </motion.div>
          ) : viewMode === 'list' ? (
            <div className="space-y-4">
              {userPosts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {userPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.03 }}
                  className="aspect-square rounded-2xl overflow-hidden border border-tbank-border bg-tbank-gray relative cursor-pointer dark:border-white/[0.08] dark:bg-white/[0.04]"
                >
                  {post.image ? (
                    <img src={post.image} alt="Post" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-3">
                      <p className="text-xs text-stone-600 dark:text-white/50 text-center line-clamp-4 leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
