import { create } from 'zustand';
import type { User, Post, Comment, EditProfileData } from '../types';
import { currentUser, mockUsers, mockPosts, mockComments } from '../data/mock';
import { socialApi } from '../api/socialApi';
import { useAuthStore } from './useAuthStore';

// ─── Store Shape ───────────────────────────────────────────────────────────────
interface AppState {
  // Auth / current user
  currentUser: User;
  isBootstrapping: boolean;
  isLoadingFeed: boolean;
  isLoadingUsers: boolean;
  isSavingProfile: boolean;
  error: string | null;

  // Users
  allUsers: User[];
  followedUserIds: Set<string>;

  // Posts
  posts: Post[];
  likedPostIds: Set<string>;
  bookmarkedPostIds: Set<string>;

  // Comments
  comments: Comment[];
  likedCommentIds: Set<string>;

  // Profile editing
  isEditingProfile: boolean;

  // Actions
  setCurrentUser: (user: User) => void;
  bootstrapApp: (user?: User | null) => Promise<void>;
  loadFeed: () => Promise<void>;
  loadUsers: (search?: string) => Promise<void>;
  loadPostDetails: (postId: string) => Promise<void>;
  loadProfile: (userId: string) => Promise<User | null>;
  toggleFollow: (userId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  toggleCommentLike: (commentId: string) => Promise<void>;
  toggleBookmark: (postId: string) => void;
  addComment: (postId: string, content: string) => Promise<void>;
  addPost: (content: string, image?: File) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  updateProfile: (data: EditProfileData, avatarFile?: File | null) => Promise<void>;
  setEditingProfile: (value: boolean) => void;
  clearError: () => void;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

function mergeUsers(existing: User[], incoming: User[]) {
  const byId = new Map(existing.map((user) => [user.id, user]));
  incoming.forEach((user) => byId.set(user.id, { ...byId.get(user.id), ...user }));
  return [...byId.values()];
}

function applyFollowLocal(state: AppState, userId: string) {
  const next = new Set(state.followedUserIds);
  const isFollowing = next.has(userId);
  isFollowing ? next.delete(userId) : next.add(userId);

  const updatedUsers = state.allUsers.map((u) =>
    u.id === userId
      ? { ...u, followersCount: u.followersCount + (isFollowing ? -1 : 1) }
      : u,
  );

  return {
    followedUserIds: next,
    allUsers: updatedUsers,
    currentUser: {
      ...state.currentUser,
      followingCount: state.currentUser.followingCount + (isFollowing ? -1 : 1),
    },
  };
}

function applyLikeLocal(state: AppState, postId: string) {
  const next = new Set(state.likedPostIds);
  const isLiked = next.has(postId);
  isLiked ? next.delete(postId) : next.add(postId);

  const updatedPosts = state.posts.map((p) =>
    p.id === postId ? { ...p, likesCount: p.likesCount + (isLiked ? -1 : 1) } : p,
  );

  return { likedPostIds: next, posts: updatedPosts };
}

function applyCommentLikeLocal(state: AppState, commentId: string) {
  const next = new Set(state.likedCommentIds);
  const isLiked = next.has(commentId);
  isLiked ? next.delete(commentId) : next.add(commentId);

  const updatedComments = state.comments.map((comment) =>
    comment.id === commentId
      ? { ...comment, likesCount: Math.max(0, comment.likesCount + (isLiked ? -1 : 1)) }
      : comment,
  );

  return { likedCommentIds: next, comments: updatedComments };
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser,
  isBootstrapping: false,
  isLoadingFeed: false,
  isLoadingUsers: false,
  isSavingProfile: false,
  error: null,
  allUsers: mockUsers,

  // Pre-follow a few users for demo richness
  followedUserIds: new Set(['u1', 'u2', 'u5']),

  posts: mockPosts,
  likedPostIds: new Set(['p2', 'p4']),
  bookmarkedPostIds: new Set(),

  comments: mockComments,
  likedCommentIds: new Set(),
  isEditingProfile: false,

  setCurrentUser: (user) =>
    set((state) => ({
      currentUser: user,
      allUsers: state.allUsers.filter((candidate) => candidate.id !== user.id),
    })),

  bootstrapApp: async (providedUser) => {
    set({ isBootstrapping: true, error: null });

    try {
      const authUser = providedUser ?? useAuthStore.getState().user ?? (await useAuthStore.getState().hydrateSession());

      if (authUser) {
        get().setCurrentUser(authUser);
        await Promise.all([get().loadFeed(), get().loadUsers()]);

        const following = await socialApi.getFollowing(authUser.id);
        set({
          followedUserIds: new Set(following.map((user) => user.id)),
          allUsers: mergeUsers(get().allUsers, following),
        });
      }
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isBootstrapping: false });
    }
  },

  loadFeed: async () => {
    set({ isLoadingFeed: true, error: null });

    try {
      const { posts, users } = await socialApi.getFeed();
      set((state) => ({
        posts,
        allUsers: mergeUsers(state.allUsers, users).filter((user) => user.id !== state.currentUser.id),
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoadingFeed: false });
    }
  },

  loadUsers: async (search) => {
    set({ isLoadingUsers: true, error: null });

    try {
      const users = await socialApi.getUsers(search);
      set((state) => ({
        allUsers: users.filter((user) => user.id !== state.currentUser.id),
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoadingUsers: false });
    }
  },

  loadPostDetails: async (postId) => {
    set({ error: null });

    try {
      const { post, comments, users } = await socialApi.getPost(postId);
      set((state) => ({
        posts: [post, ...state.posts.filter((candidate) => candidate.id !== post.id)],
        comments: [
          ...state.comments.filter((comment) => comment.postId !== postId),
          ...comments,
        ],
        allUsers: mergeUsers(state.allUsers, users).filter((user) => user.id !== state.currentUser.id),
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },

  loadProfile: async (userId) => {
    set({ error: null });

    try {
      const user = await socialApi.getUser(userId);
      if (user.id === get().currentUser.id) {
        get().setCurrentUser(user);
        useAuthStore.getState().setUser(user);
      } else {
        set((state) => ({ allUsers: mergeUsers(state.allUsers, [user]) }));
      }
      return user;
    } catch (error) {
      set({ error: getErrorMessage(error) });
      return null;
    }
  },

  // ── toggleFollow ──────────────────────────────────────────────────────────
  toggleFollow: async (userId) => {
    const wasFollowing = get().followedUserIds.has(userId);

    set((state) => applyFollowLocal(state, userId));

    try {
      if (wasFollowing) {
        await socialApi.unfollowUser(userId);
      } else {
        await socialApi.followUser(userId);
      }
    } catch (error) {
      set((state) => applyFollowLocal(state, userId));
      set({ error: getErrorMessage(error) });
    }
  },

  // ── toggleLike ────────────────────────────────────────────────────────────
  toggleLike: async (postId) => {
    const wasLiked = get().likedPostIds.has(postId);

    set((state) => applyLikeLocal(state, postId));

    try {
      if (wasLiked) {
        await socialApi.unlikePost(postId);
      } else {
        await socialApi.likePost(postId);
      }
    } catch (error) {
      set((state) => applyLikeLocal(state, postId));
      set({ error: getErrorMessage(error) });
    }
  },

  toggleBookmark: (postId) => {
    set((state) => {
      const next = new Set(state.bookmarkedPostIds);

      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }

      return { bookmarkedPostIds: next };
    });
  },

  toggleCommentLike: async (commentId) => {
    const wasLiked = get().likedCommentIds.has(commentId);

    set((state) => applyCommentLikeLocal(state, commentId));

    try {
      if (wasLiked) {
        await socialApi.unlikeComment(commentId);
      } else {
        await socialApi.likeComment(commentId);
      }
    } catch (error) {
      set((state) => applyCommentLikeLocal(state, commentId));
      set({ error: getErrorMessage(error) });
    }
  },

  // ── addComment ────────────────────────────────────────────────────────────
  addComment: async (postId, content) => {
    if (!content.trim()) return;

    try {
      const { comment, users } = await socialApi.createComment(postId, content);
      set((state) => ({
        comments: [...state.comments, comment],
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p,
        ),
        allUsers: mergeUsers(state.allUsers, users),
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },

  // ── addPost ───────────────────────────────────────────────────────────────
  addPost: async (content, image) => {
    if (!content.trim()) return;

    try {
      const { post, users } = await socialApi.createPost(content, image);
      set((state) => ({
        posts: [post, ...state.posts],
        allUsers: mergeUsers(state.allUsers, users),
        currentUser: { ...state.currentUser, postsCount: state.currentUser.postsCount + 1 },
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },

  deletePost: async (postId) => {
    const { posts, comments, likedPostIds, bookmarkedPostIds } = get();
    const post = posts.find((candidate) => candidate.id === postId);
    const removedComments = comments.filter((comment) => comment.postId === postId);
    const wasLiked = likedPostIds.has(postId);
    const wasBookmarked = bookmarkedPostIds.has(postId);

    if (!post) return;

    set((state) => ({
      posts: state.posts.filter((candidate) => candidate.id !== postId),
      comments: state.comments.filter((comment) => comment.postId !== postId),
      likedPostIds: new Set([...state.likedPostIds].filter((id) => id !== postId)),
      bookmarkedPostIds: new Set([...state.bookmarkedPostIds].filter((id) => id !== postId)),
      currentUser:
        post.authorId === state.currentUser.id
          ? { ...state.currentUser, postsCount: Math.max(0, state.currentUser.postsCount - 1) }
          : state.currentUser,
    }));

    try {
      await socialApi.deletePost(postId);
    } catch (error) {
      set((state) => ({
        posts: [post, ...state.posts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
        comments: [...state.comments, ...removedComments],
        likedPostIds: wasLiked ? new Set([...state.likedPostIds, postId]) : state.likedPostIds,
        bookmarkedPostIds: wasBookmarked
          ? new Set([...state.bookmarkedPostIds, postId])
          : state.bookmarkedPostIds,
        currentUser:
          post.authorId === state.currentUser.id
            ? { ...state.currentUser, postsCount: state.currentUser.postsCount + 1 }
            : state.currentUser,
        error: getErrorMessage(error),
      }));
    }
  },

  // ── updateProfile ─────────────────────────────────────────────────────────
  updateProfile: async (data, avatarFile) => {
    set({ isSavingProfile: true, error: null });

    try {
      let next = await socialApi.updateProfile(data);
      if (avatarFile) {
        next = await socialApi.uploadAvatar(avatarFile);
      }

      const currentUser = {
        ...get().currentUser,
        ...next,
        banner: data.banner?.trim() || get().currentUser.banner,
      };

      set({ currentUser, isEditingProfile: false });
      useAuthStore.getState().setUser(currentUser);
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isSavingProfile: false });
    }
  },

  setEditingProfile: (value) => set({ isEditingProfile: value }),
  clearError: () => set({ error: null }),
}));
