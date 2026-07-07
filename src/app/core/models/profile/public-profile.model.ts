import { Highlight } from './Highlight.model';
export interface PublicProfile {
  id: string;
  displayName: string;
  bio: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  isFollowedByMe: boolean;
  highlights: Highlight[];
  favoriteNovels: FavoriteNovel[];
}

export interface FavoriteNovel {
  id: number;
  title: string;
  authorName: string | null;
  coverImageUrl: string | null;
  price: number;
}