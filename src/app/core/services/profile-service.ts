import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Profile } from '../models/profile/profile.model';
import { UpdateProfileRequest } from '../models/profile/update-profile.model';
import { AddHighlightRequest } from '../models/profile/add-highlight.model';
import { Highlight } from '../models/profile/Highlight.model';

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
}