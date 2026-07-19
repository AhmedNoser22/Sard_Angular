export interface PublishedNovel {
  id: number;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  price: number;
  authorId: string;
  authorName: string;
  authorImageUrl: string | null;
  chaptersCount: number;
  readCount: number;
  createdAt: string;
}