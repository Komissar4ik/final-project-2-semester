import type { Comment, EditProfileData, Post, User } from '../types';
import { apiClient } from './httpClient';
import {
  mapBackendComment,
  mapBackendPost,
  mapBackendUser,
  type BackendProfile,
  type BackendComment,
  type BackendPost,
  type BackendUser,
} from './mappers';

export interface TrendingTag {
  tag: string;
  postsCount: number;
}

interface PaginatedPostsResponse {
  items: BackendPost[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

type BackendProfileResponse = BackendProfile & {
  user: BackendUser;
};

function collectAuthors(posts: BackendPost[], comments: BackendComment[] = []) {
  const authors = new Map<string, User>();

  posts.forEach((post) => {
    if (post.author) authors.set(post.author.id, mapBackendUser(post.author));
    post.comments?.forEach((comment) => {
      if (comment.author) authors.set(comment.author.id, mapBackendUser(comment.author));
    });
  });

  comments.forEach((comment) => {
    if (comment.author) authors.set(comment.author.id, mapBackendUser(comment.author));
  });

  return [...authors.values()];
}

export const socialApi = {
  async getUsers(search?: string): Promise<User[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const users = await apiClient.get<BackendUser[]>(`/users${query}`);
    return users.map(mapBackendUser);
  },

  async getUser(id: string): Promise<User> {
    const user = await apiClient.get<BackendUser>(`/users/${id}`);
    return mapBackendUser(user);
  },

  async getFollowing(userId: string): Promise<User[]> {
    const users = await apiClient.get<BackendUser[]>(`/users/${userId}/following`);
    return users.map(mapBackendUser);
  },

  async updateProfile(data: EditProfileData): Promise<User> {
    const profile = await apiClient.patch<BackendProfileResponse>('/profiles/me', {
      displayName: data.displayName,
      bio: data.bio,
      location: data.location || undefined,
      website: data.website || undefined,
    });

    return mapBackendUser({ ...profile.user, profile });
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    const user = await apiClient.post<BackendUser>('/profiles/me/avatar', formData);
    return mapBackendUser(user);
  },

  async getFeed(): Promise<{ posts: Post[]; users: User[] }> {
    const response = await apiClient.get<BackendPost[] | PaginatedPostsResponse>('/posts');
    const posts = Array.isArray(response) ? response : response.items;

    return {
      posts: posts.map(mapBackendPost),
      users: collectAuthors(posts),
    };
  },

  async getTrendingTags(): Promise<TrendingTag[]> {
    return apiClient.get<TrendingTag[]>('/posts/trending-tags');
  },

  async getPost(id: string): Promise<{ post: Post; comments: Comment[]; users: User[] }> {
    const post = await apiClient.get<BackendPost>(`/posts/${id}`);
    const comments = post.comments ?? [];

    return {
      post: mapBackendPost(post),
      comments: comments.map(mapBackendComment),
      users: collectAuthors([post], comments),
    };
  },

  async createPost(content: string, image?: File): Promise<{ post: Post; users: User[] }> {
    let imageUrl: string | undefined;

    if (image) {
      const formData = new FormData();
      formData.append('image', image);
      const uploaded = await apiClient.post<{ imageUrl: string }>('/posts/upload-image', formData);
      imageUrl = uploaded.imageUrl;
    }

    const post = await apiClient.post<BackendPost>('/posts', { content, imageUrl });
    return {
      post: mapBackendPost(post),
      users: collectAuthors([post]),
    };
  },

  async createComment(postId: string, content: string): Promise<{ comment: Comment; users: User[] }> {
    const comment = await apiClient.post<BackendComment>(`/posts/${postId}/comments`, { content });
    return {
      comment: mapBackendComment(comment),
      users: collectAuthors([], [comment]),
    };
  },

  async deletePost(postId: string) {
    await apiClient.delete(`/posts/${postId}`);
  },

  async likePost(postId: string) {
    await apiClient.post(`/posts/${postId}/likes`);
  },

  async unlikePost(postId: string) {
    await apiClient.delete(`/posts/${postId}/likes`);
  },

  async likeComment(commentId: string) {
    await apiClient.post(`/comments/${commentId}/likes`);
  },

  async unlikeComment(commentId: string) {
    await apiClient.delete(`/comments/${commentId}/likes`);
  },

  async followUser(userId: string) {
    await apiClient.post(`/users/${userId}/follow`);
  },

  async unfollowUser(userId: string) {
    await apiClient.delete(`/users/${userId}/follow`);
  },
};
