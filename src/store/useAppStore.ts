import { create } from 'zustand';
import type { User, Post, Comment, EditProfileData } from '../types';
import { currentUser, mockUsers, mockPosts, mockComments } from '../data/mock';

// ─── Store Shape ───────────────────────────────────────────────────────────────
interface AppState {
  // Auth / current user
  currentUser: User;

  // Users
  allUsers: User[];
  followedUserIds: Set<string>;

  // Posts
  posts: Post[];
  likedPostIds: Set<string>;

  // Comments
  comments: Comment[];

  // Profile editing
  isEditingProfile: boolean;

  // Actions
  toggleFollow: (userId: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  addPost: (content: string) => void;
  updateProfile: (data: EditProfileData) => void;
  setEditingProfile: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser,
  allUsers: mockUsers,

  // Pre-follow a few users for demo richness
  followedUserIds: new Set(['u1', 'u2', 'u5']),

  posts: mockPosts,
  likedPostIds: new Set(['p2', 'p4']),

  comments: mockComments,
  isEditingProfile: false,

  // ── toggleFollow ──────────────────────────────────────────────────────────
  // TODO: POST /api/users/:id/follow  |  DELETE /api/users/:id/follow
  toggleFollow: (userId) =>
    set((state) => {
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
    }),

  // ── toggleLike ────────────────────────────────────────────────────────────
  // TODO: POST /api/posts/:id/like  |  DELETE /api/posts/:id/like
  toggleLike: (postId) =>
    set((state) => {
      const next = new Set(state.likedPostIds);
      const isLiked = next.has(postId);
      isLiked ? next.delete(postId) : next.add(postId);

      const updatedPosts = state.posts.map((p) =>
        p.id === postId ? { ...p, likesCount: p.likesCount + (isLiked ? -1 : 1) } : p,
      );

      return { likedPostIds: next, posts: updatedPosts };
    }),

  // ── addComment ────────────────────────────────────────────────────────────
  // TODO: POST /api/posts/:id/comments  { content }
  addComment: (postId, content) => {
    if (!content.trim()) return;
    const newComment: Comment = {
      id: `c${Date.now()}`,
      postId,
      authorId: get().currentUser.id,
      content: content.trim(),
      likesCount: 0,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      comments: [...state.comments, newComment],
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p,
      ),
    }));
  },

  // ── addPost ───────────────────────────────────────────────────────────────
  // TODO: POST /api/posts  { content }
  addPost: (content) => {
    if (!content.trim()) return;
    const newPost: Post = {
      id: `p${Date.now()}`,
      authorId: get().currentUser.id,
      content: content.trim(),
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      posts: [newPost, ...state.posts],
      currentUser: { ...state.currentUser, postsCount: state.currentUser.postsCount + 1 },
    }));
  },

  // ── updateProfile ─────────────────────────────────────────────────────────
  // TODO: PATCH /api/users/me  { displayName, bio, location, website, avatarUrl, bannerUrl }
  // TODO: POST /api/users/me/avatar  (multipart) — вернёт публичный URL вместо data: URL
  // TODO: POST /api/users/me/banner  (multipart)
  updateProfile: (data) =>
    set((state) => {
      const next = { ...state.currentUser, ...data };
      if (data.banner !== undefined) {
        next.banner = data.banner.trim() || undefined;
      }
      return { currentUser: next, isEditingProfile: false };
    }),

  setEditingProfile: (value) => set({ isEditingProfile: value }),
}));
