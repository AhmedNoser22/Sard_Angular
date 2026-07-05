import { Highlight } from "./Highlight.model";
import { NovelSummary } from "./novel-summary.model";

export interface Profile {
  id: string;
  displayName: string;
  bio: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  publishedNovelsCount: number;
  totalReadsCount: number;
  novels: NovelSummary[];
  highlights: Highlight[];
}