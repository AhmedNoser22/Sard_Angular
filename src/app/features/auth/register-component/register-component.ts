import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/authService';
import { EmailStateService } from '../../../core/services/email-state.service';
import { environment } from '../../../../environments/environment.development';
import { RegisterRequest } from '../../../core/models/auth/register.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-component.html',
  styleUrl: './register-component.scss'
})
export class RegisterComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly emailState = inject(EmailStateService);

  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  form = this.fb.group({
    displayName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    agreeToTerms: [false, Validators.requiredTrue]
  });

  togglePassword = () => this.showPassword.update(v => !v);
  toggleConfirmPassword = () => this.showConfirmPassword.update(v => !v);

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
              error: err => this.errorMessage.set(err.error ?? 'فشل التسجيل بجوجل')
            });
          },
          ux_mode: 'popup'
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById('google-register-btn'),
          { type: 'icon', shape: 'circle', theme: 'outline', size: 'large' }
        );
      }
    }, 200);
  }

  getValidationError(): string {
    if (this.form.get('displayName')?.invalid) return 'الاسم الكامل مطلوب';
    if (this.form.get('email')?.invalid) return 'البريد الإلكتروني غير صحيح';
    if (this.form.get('password')?.invalid) return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    if (this.form.get('confirmPassword')?.invalid) return 'تأكيد كلمة المرور مطلوب';
    if (this.form.get('agreeToTerms')?.invalid) return 'يجب الموافقة على الشروط والأحكام أولاً';
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

    this.authService.register(this.form.value as RegisterRequest).subscribe({
      next: () => {
        this.emailState.save(this.form.value.email!);
        this.router.navigate(['/confirm-email']);
      },
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