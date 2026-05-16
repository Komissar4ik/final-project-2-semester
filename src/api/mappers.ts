import type { Comment, Post, User } from '../types';
import { toAbsoluteMediaUrl } from './httpClient';

export interface BackendProfile {
  bio?: string | null;
  location?: string | null;
  website?: string | null;
}

export interface BackendUser {
  id: string;
  email?: string;
  displayName: string;
  avatarUrl?: string | null;
  createdAt?: string;
  profile?: BackendProfile | null;
  _count?: {
    posts?: number;
    followers?: number;
    following?: number;
  };
}

export interface BackendPost {
  id: string;
  authorId: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  author?: BackendUser;
  _count?: {
    comments?: number;
    likes?: number;
  };
  comments?: BackendComment[];
}

export interface BackendComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author?: BackendUser;
}

function usernameFromUser(user: BackendUser) {
  const source = user.email?.split('@')[0] || user.displayName || user.id;
  return source.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || user.id;
}

export function mapBackendUser(user: BackendUser): User {
  return {
    id: user.id,
    username: usernameFromUser(user),
    displayName: user.displayName,
    avatar:
      toAbsoluteMediaUrl(user.avatarUrl) ??
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user.id)}`,
    bio: user.profile?.bio ?? 'No bio yet.',
    location: user.profile?.location ?? undefined,
    website: user.profile?.website ?? undefined,
    followersCount: user._count?.followers ?? 0,
    followingCount: user._count?.following ?? 0,
    postsCount: user._count?.posts ?? 0,
    joinedAt: user.createdAt ?? new Date().toISOString(),
  };
}

export function mapBackendPost(post: BackendPost): Post {
  return {
    id: post.id,
    authorId: post.authorId,
    content: post.content,
    image: toAbsoluteMediaUrl(post.imageUrl),
    likesCount: post._count?.likes ?? 0,
    commentsCount: post._count?.comments ?? post.comments?.length ?? 0,
    createdAt: post.createdAt,
  };
}

export function mapBackendComment(comment: BackendComment): Comment {
  return {
    id: comment.id,
    postId: comment.postId,
    authorId: comment.authorId,
    content: comment.content,
    likesCount: 0,
    createdAt: comment.createdAt,
  };
}
