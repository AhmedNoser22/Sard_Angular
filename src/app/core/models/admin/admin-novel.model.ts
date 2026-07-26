export interface AdminNovel {
  id: number;
  title: string;
  authorName: string;
  coverImageUrl: string | null;
  price: number;
  chaptersCount: number;
  readCount: number;
  createdAt: string;
}