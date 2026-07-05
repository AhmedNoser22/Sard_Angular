export interface AppNotification {
  type: string;
  message: string;
  actorName: string;
  postId: number | null;
  createdAt: string;
  isRead: boolean;
}