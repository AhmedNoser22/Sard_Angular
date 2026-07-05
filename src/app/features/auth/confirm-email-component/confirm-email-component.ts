import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/authService';
import { EmailStateService } from '../../../core/services/email-state.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './confirm-email-component.html',
  styleUrl: './confirm-email-component.scss'
})
export class ConfirmEmailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly emailState = inject(EmailStateService);

  isLoading = signal(false);
  isResending = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  email = signal('');
  countdown = signal(0);

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  ngOnInit(): void {
    const email = this.emailState.get();
    if (!email) {
      this.router.navigate(['/profile']);
      return;
    }
    this.email.set(email);
    this.startCountdown();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.confirmEmail({
      email: this.email(),
      code: this.form.value.code!
    }).subscribe({
      next: () => {
        this.emailState.clear();
        this.router.navigate(['/profile']);
      },
      error: err => {
        this.errorMessage.set(err.status === 0 ? 'تعذر الاتصال بالخادم، تحقق من اتصالك' : err.error ?? 'الرمز غير صحيح');
        this.isLoading.set(false);
      }
    });
  }
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  resendCode(): void {
    if (this.countdown() > 0) return;

    this.isResending.set(true);
    this.authService.resendCode({ email: this.email() }).subscribe({
      next: () => {
        this.successMessage.set('تم إرسال الرمز مرة أخرى ');
        this.isResending.set(false);
        this.startCountdown();
      },
      error: err => {
        this.errorMessage.set(err.status === 0 ? 'تعذر الاتصال بالخادم، تحقق من اتصالك' : err.error ?? 'حدث خطأ');
        this.isResending.set(false);
      }
    });
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
}