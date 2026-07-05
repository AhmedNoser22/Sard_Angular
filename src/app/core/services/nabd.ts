import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Post, CreatePostRequest, CreateReplyRequest, Reply } from '../models/nabd/post.model';

@Injectable({ providedIn: 'root' })
export class NabdService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/nabd`;

  getPosts(page = 1, pageSize = 20): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}?page=${page}&pageSize=${pageSize}`);
  }

  createPost(request: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(this.baseUrl, request);
  }

  addReply(postId: number, request: CreateReplyRequest): Observable<Reply> {
    return this.http.post<Reply>(`${this.baseUrl}/${postId}/reply`, request);
  }

  toggleLike(postId: number): Observable<{ isLiked: boolean; likesCount: number }> {
    return this.http.post<{ isLiked: boolean; likesCount: number }>(`${this.baseUrl}/${postId}/like`, {});
  }

  deletePost(postId: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/${postId}`);
  }
  deleteReply(postId: number, replyId: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/${postId}/reply/${replyId}`);
  }
}