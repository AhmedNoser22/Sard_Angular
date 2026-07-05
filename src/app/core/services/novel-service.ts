import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { NovelSummary } from '../models/profile/novel-summary.model';
import { Chapter } from '../models/novel/chapter.model';
import { CreateNovelRequest } from '../models/novel/create-novel.model';
import { UpdateNovelRequest } from '../models/novel/update-novel.model';
import { SaveChapterRequest } from '../models/novel/save-chapter.model';

@Injectable({ providedIn: 'root' })
export class NovelService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/novels`;

  createNovel(request: CreateNovelRequest): Observable<NovelSummary> {
    return this.http.post<NovelSummary>(this.baseUrl, request);
  }

  updateNovel(novelId: number, request: UpdateNovelRequest): Observable<NovelSummary> {
    return this.http.put<NovelSummary>(`${this.baseUrl}/${novelId}`, request);
  }

  uploadCover(novelId: number, file: File): Observable<{ coverImageUrl: string }> {
  const formData = new FormData();
  formData.append('cover', file);
  return this.http.post<{ coverImageUrl: string }>(`${this.baseUrl}/${novelId}/cover`, formData);
}

  getChapters(novelId: number): Observable<Chapter[]> {
    return this.http.get<Chapter[]>(`${this.baseUrl}/${novelId}/chapters`);
  }

  getChapter(novelId: number, chapterId: number): Observable<Chapter> {
    return this.http.get<Chapter>(`${this.baseUrl}/${novelId}/chapters/${chapterId}`);
  }

  saveChapter(novelId: number, request: SaveChapterRequest, chapterId?: number): Observable<Chapter> {
    const url = `${this.baseUrl}/${novelId}/chapters${chapterId ? `?chapterId=${chapterId}` : ''}`;
    return this.http.post<Chapter>(url, request);
  }

  setLastReadChapter(novelId: number, chapterId: number): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/${novelId}/last-chapter/${chapterId}`, {});
  }
}