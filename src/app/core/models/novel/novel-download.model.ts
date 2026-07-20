export interface NovelDownload {
  title: string;
  authorName: string;
  description: string | null;
  coverImageUrl: string | null;
  chapters: ChapterDownload[];
}

export interface ChapterDownload {
  order: number;
  title: string;
  content: string;
}