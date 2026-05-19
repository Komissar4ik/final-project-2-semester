export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  banner?: string;
  bio: string;
  location?: string;
  website?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  joinedAt: string;
  isVerified?: boolean;
  publicProfile?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  image?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  tags?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  likesCount: number;
  createdAt: string;
}

/** Profile fields editable in the UI (mock: avatar/banner may be data URLs until real upload API exists). */
export type EditProfileData = Pick<User, 'displayName' | 'bio' | 'location' | 'website' | 'avatar'> & {
  banner?: string;
};
