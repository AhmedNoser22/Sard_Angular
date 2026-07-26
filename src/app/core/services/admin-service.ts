import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { AdminStats } from '../models/admin/admin-stats.model';
import { AdminUser, AdminUserDetail } from '../models/admin/admin-user.model';
import { AdminPost } from '../models/admin/admin-post.model';
import { AdminNovel } from '../models/admin/admin-novel.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.baseUrl}/stats`);
  }

  getUsers(search?: string): Observable<AdminUser[]> {
    const url = search ? `${this.baseUrl}/users?search=${search}` : `${this.baseUrl}/users`;
    return this.http.get<AdminUser[]>(url);
  }

  getUserDetail(userId: string): Observable<AdminUserDetail> {
    return this.http.get<AdminUserDetail>(`${this.baseUrl}/users/${userId}`);
  }

  toggleLock(userId: string): Observable<{ isLocked: boolean }> {
    return this.http.post<{ isLocked: boolean }>(`${this.baseUrl}/users/${userId}/toggle-lock`, {});
  }

  deleteReply(replyId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/replies/${replyId}`);
  }

  getPosts(): Observable<AdminPost[]> {
    return this.http.get<AdminPost[]>(`${this.baseUrl}/posts`);
  }

  deletePost(postId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/posts/${postId}`);
  }


  checkIsLocked(userId: string): Observable<{ isLocked: boolean }> {
    return this.http.get<{ isLocked: boolean }>(`${this.baseUrl}/users/${userId}/is-locked`);
  }
  getNovels(): Observable<AdminNovel[]> {
    return this.http.get<AdminNovel[]>(`${this.baseUrl}/novels`);
  }
}