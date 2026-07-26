import { AdminNovel } from "./admin-novel.model";
import { AdminPost } from "./admin-post.model";

export interface AdminUser {
  id: string;
  displayName: string;
  email: string;
  profileImageUrl: string | null;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  publishedNovelsCount: number;
  postsCount: number;
  isLocked: boolean;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUser {
  followers: FollowUser[];
  following: FollowUser[];
  publishedNovels: AdminNovel[];
  recentPosts: AdminPost[];
}

export interface FollowUser {
  id: string;
  displayName: string;
  profileImageUrl: string | null;
}