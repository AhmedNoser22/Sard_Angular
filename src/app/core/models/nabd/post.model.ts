export interface Post {
  id: number;
  content: string;
  authorId: string;
  authorName: string;
  authorImageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  status: string;
  createdAt: string;
  replies: Reply[];
}

export interface Reply {
  id: number;
  content: string;
  authorId: string;
  authorName: string;
  authorImageUrl: string | null;
  createdAt: string;
}

export interface CreatePostRequest {
  content: string;
}

export interface CreateReplyRequest {
  content: string;
}
export interface Post {
  likedByNames: string[];
}