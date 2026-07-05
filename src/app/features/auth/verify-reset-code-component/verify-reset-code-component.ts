import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/authService';
import { EmailStateService } from '../../../core/services/email-state.service';

@Component({
  selector: 'app-verify-reset-code',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './verify-reset-code-component.html',
  styleUrl: './verify-reset-code-component.scss'
})
export class VerifyResetCodeComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly router = inject(Router);
  private readonly emailState = inject(EmailStateService);

  isLoading = signal(false);
  errorMessage = signal('');
  email = signal('');
  countdown = signal(0);
  isResending = signal(false);
  successMessage = signal('');

  private readonly authService = inject(AuthService);

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });
  goBack(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
  ngOnInit(): void {
    const email = this.emailState.get();
    if (!email) {
      this.router.navigate(['/auth/forgot-password']);
      return;
    }
    this.email.set(email);
    this.startCountdown();
  }

  private startCountdown(): void {
    this.countdown.set(45);
    const interval = setInterval(() => {
      this.countdown.update(v => {
        if (v <= 1) { clearInterval(interval); return 0; }
        return v - 1;
      });
    }, 1000);
  }

  resendCode(): void {
    if (this.countdown() > 0) return;
    this.isResending.set(true);
    this.authService.forgotPassword({ email: this.email() }).subscribe({
      next: () => {
        this.successMessage.set('تم إرسال الرمز مرة أخرى');
        this.isResending.set(false);
        this.startCountdown();
      },
      error: (err) => {
        this.errorMessage.set(err.status === 0 ? 'تعذر الاتصال بالخادم، تحقق من اتصالك' : 'حدث خطأ أثناء إعادة الإرسال');
        this.isResending.set(false);
      }
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMessage.set('أدخل الرمز المكون من 6 أرقام');
      return;
    }

    sessionStorage.setItem('sard_reset_code', this.form.value.code!);
    this.router.navigate(['/auth/reset-password']);
  }
}