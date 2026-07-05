export interface NovelSummary {
  id: number;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  price: number;
  status: NovelStatus;
  chaptersCount: number;
  lastReadChapterId: number | null;
  createdAt: string;
}

export type NovelStatus = 'Draft' | 'PendingPayment' | 'Published';