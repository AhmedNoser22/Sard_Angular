export interface SharedPost {
  shareId: number;
  postId: number;
  content: string;
  authorName: string;
  authorImageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  originalCreatedAt: string;
  sharedAt: string;
}