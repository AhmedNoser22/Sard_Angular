import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/authService';
import { environment } from '../../../../environments/environment';
import { LoginRequest } from '../../../core/models/auth/login.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss'
})
export class LoginComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  lockedMessage = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  ngOnInit(): void {
    const state = history.state;
    if (state?.message) {
      this.lockedMessage.set(state.message);
    }
  }

  togglePassword = () => this.showPassword.update(v => !v);

  ngAfterViewInit(): void {
    this.initGoogleButton();
  }

  private initGoogleButton(): void {
    const wait = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        clearInterval(wait);
        (window as any).google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (response: any) => {
            this.authService.googleLogin(response.credential).subscribe({
              next: () => this.router.navigate(['/profile']),
              error: err => this.errorMessage.set(err.status === 0 ? 'تعذر الاتصال بالخادم، تحقق من اتصالك' : 'فشل تسجيل الدخول بجوجل')
            });
          },
          ux_mode: 'popup'
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById('google-login-btn'),
          { type: 'icon', shape: 'circle', theme: 'outline', size: 'large' }
        );
      }
    }, 200);
  }

  getValidationError(): string {
    if (this.form.get('email')?.invalid) return 'البريد الإلكتروني غير صحيح';
    if (this.form.get('password')?.invalid) return 'كلمة المرور مطلوبة';
    return '';
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMessage.set(this.getValidationError());
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.form.value as LoginRequest).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: err => {
        const msg = typeof err.error === 'string'
          ? err.error
          : err.status === 0
            ? 'تعذر الاتصال بالخادم، تحقق من اتصالك'
            : 'حدث خطأ، حاول مرة أخرى';
        this.errorMessage.set(msg);
        this.isLoading.set(false);
      }
    });
  }
}