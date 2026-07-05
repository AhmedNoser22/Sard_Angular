import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/authService';
import { EmailStateService } from '../../../core/services/email-state.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password-component.html',
  styleUrl: './reset-password-component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly emailState = inject(EmailStateService);

  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  email = signal('');

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  ngOnInit(): void {
    this.email.set(this.emailState.get());
    const code = sessionStorage.getItem('sard_reset_code');
    if (!code || !this.email()) {
      this.router.navigate(['/auth/forgot-password']);
      return;
    }
    this.form.patchValue({ code });
  }

  togglePassword = () => this.showPassword.update(v => !v);
  toggleConfirmPassword = () => this.showConfirmPassword.update(v => !v);
  goBack(): void {
    this.router.navigate(['/auth/verify-reset-code']);
  }
  private parseError(err: any): string {
    if (err.status === 0) return 'تعذر الاتصال بالخادم، تحقق من اتصالك';  // ← السطر ده بس
    let message = 'حدث خطأ، حاول مرة أخرى';

    const error = err.error;

    if (!error) return message;

    if (typeof error === 'string') {
      try {
        const parsed = JSON.parse(error);
        message = parsed.errors?.[0] ?? parsed.message ?? message;
      } catch {
        message = error;
      }
    } else if (Array.isArray(error.errors)) {
      message = error.errors[0];
    } else {
      message = error.message ?? error.title ?? message;
    }

    // ترجمة رسائل ASP.NET Identity
    if (message.includes('Passwords must have at least one non alphanumeric character'))
      return 'يجب أن تحتوي كلمة المرور على رمز خاص مثل @ أو # أو !';

    if (message.includes('Passwords must have at least one uppercase'))
      return 'يجب أن تحتوي كلمة المرور على حرف كبير.';

    if (message.includes('Passwords must have at least one lowercase'))
      return 'يجب أن تحتوي كلمة المرور على حرف صغير.';

    if (message.includes('Passwords must have at least one digit'))
      return 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل.';

    if (message.includes('Passwords must be at least'))
      return 'يجب ألا تقل كلمة المرور عن 8 أحرف.';

    return message;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.errorMessage.set('كلمتا المرور غير متطابقتين');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.resetPassword({
      email: this.email(),
      code: this.form.value.code!,
      newPassword: this.form.value.newPassword!,
      confirmPassword: this.form.value.confirmPassword!
    }).subscribe({
      next: () => {
        this.emailState.clear();
        this.router.navigate(['/auth/login']);
      },
      error: err => {
        console.log(err.error);
        console.log(typeof err.error);
        this.errorMessage.set(this.parseError(err));
        this.isLoading.set(false);
      }
    });
  }
}