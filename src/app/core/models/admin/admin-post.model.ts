export interface AdminPost {
  id: number;
  content: string;
  authorId: string;
  authorName: string;
  authorImageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  status: string;
  createdAt: string;
  replies: AdminReply[];
  likedByNames: string[];
}

export interface AdminReply {
  id: number;
  content: string;
  authorId: string;
  authorName: string;
  authorImageUrl: string | null;
  createdAt: string;
}