import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Profile } from '../models/profile/profile.model';
import { UpdateProfileRequest } from '../models/profile/update-profile.model';
import { AddHighlightRequest } from '../models/profile/add-highlight.model';
import { Highlight } from '../models/profile/Highlight.model';
import { FavoriteNovel, PublicProfile } from '../models/profile/public-profile.model';
import { FollowUser } from '../models/profile/FollowUser';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/profile`;

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(this.baseUrl);
  }

  updateProfile(request: UpdateProfileRequest): Observable<Profile> {
    return this.http.put<Profile>(this.baseUrl, request);
  }

  updateProfileImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.put<{ imageUrl: string }>(`${this.baseUrl}/image`, formData);
  }

  addHighlight(request: AddHighlightRequest): Observable<Highlight> {
    return this.http.post<Highlight>(`${this.baseUrl}/highlights`, request);
  }

  deleteHighlight(id: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/highlights/${id}`);
  }
  getPublicProfile(userId: string): Observable<PublicProfile> {
    return this.http.get<PublicProfile>(`${this.baseUrl}/public/${userId}`);
  }

  toggleFollow(userId: string): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/follow/${userId}`, {});
  }

  addFavoriteNovel(title: string, authorName: string | null, cover: File | null): Observable<FavoriteNovel> {
    const formData = new FormData();
    formData.append('title', title);
    if (authorName) formData.append('authorName', authorName);
    if (cover) formData.append('cover', cover);
    return this.http.post<FavoriteNovel>(`${this.baseUrl}/favorite-novels`, formData);
  }

  deleteFavoriteNovel(novelId: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/favorite-novels/${novelId}`);
  }
  getFollowers(userId: string): Observable<FollowUser[]> {
    return this.http.get<FollowUser[]>(`${this.baseUrl}/${userId}/followers`);
  }

  getFollowing(userId: string): Observable<FollowUser[]> {
    return this.http.get<FollowUser[]>(`${this.baseUrl}/${userId}/following`);
  }
}