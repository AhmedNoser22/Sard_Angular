import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { NovelSummary } from '../models/profile/novel-summary.model';
import { Chapter } from '../models/novel/chapter.model';
import { CreateNovelRequest } from '../models/novel/create-novel.model';
import { UpdateNovelRequest } from '../models/novel/update-novel.model';
import { SaveChapterRequest } from '../models/novel/save-chapter.model';
import { PublishedNovel } from '../models/novel/PublishedNovel';
import { UpdateNovelSettingsRequest } from '../models/novel/UpdateNovelSettingsRequest';

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
  updateSettings(novelId: number, request: UpdateNovelSettingsRequest): Observable<NovelSummary> {
    return this.http.put<NovelSummary>(`${this.baseUrl}/${novelId}/settings`, request);
  }

  getPublishedNovels(page = 1, pageSize = 20): Observable<PublishedNovel[]> {
    return this.http.get<PublishedNovel[]>(`${this.baseUrl}/published?page=${page}&pageSize=${pageSize}`);
  }

  initiatePublish(novelId: number): Observable<{ iframeUrl: string }> {
    return this.http.post<{ iframeUrl: string }>(
      `${this.baseUrl}/${novelId}/initiate-publish`, {});
  }
  purchaseNovel(novelId: number): Observable<{ checkoutUrl: string }> {
    return this.http.post<{ checkoutUrl: string }>(`${this.baseUrl}/${novelId}/purchase`, {});
  }

  hasPurchased(novelId: number): Observable<{ hasPurchased: boolean }> {
    return this.http.get<{ hasPurchased: boolean }>(`${this.baseUrl}/${novelId}/has-purchased`);
  }
  getPurchasedNovels(): Observable<PublishedNovel[]> {
    return this.http.get<PublishedNovel[]>(`${this.baseUrl}/purchased`);
  }

  downloadNovelPdf(novelId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${novelId}/download/pdf`, {
      responseType: 'blob'
    });
  }
  confirmPurchase(novelId: number, sessionId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${novelId}/confirm-purchase`, { sessionId });
  }
}