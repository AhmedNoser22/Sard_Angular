import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ai`;

  correctText(text: string): Observable<{ corrected: string }> {
    return this.http.post<{ corrected: string }>(`${environment.apiUrl}/ai/correct`, { text });
  }
}