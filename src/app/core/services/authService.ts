import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TokenService } from './tokenService';
import { RegisterRequest } from '../models/auth/register.model';
import { LoginRequest } from '../models/auth/login.model';
import { AuthResponse } from '../models/auth/auth-response.model';
import { ConfirmEmailRequest } from '../models/auth/confirm-email.model';
import { ResendCodeRequest } from '../models/auth/resend-code.model';
import { ResetPasswordRequest } from '../models/auth/reset-password.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(response => this.tokenService.save(response))
    );
  }

  googleLogin(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/google-login`, { idToken }).pipe(
      tap(response => this.tokenService.save(response))
    );
  }

  confirmEmail(request: ConfirmEmailRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/confirm-email`, request).pipe(
      tap(response => this.tokenService.save(response))
    );
  }

  resendCode(request: ResendCodeRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/resend-code`, request);
  }

  forgotPassword(request: ResendCodeRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/forgot-password`, request, { responseType: 'text' });
  }

  resetPassword(request: ResetPasswordRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/reset-password`, request,{ responseType: 'text' });
  }
  logout(): void {
    this.tokenService.clear();
  }
}