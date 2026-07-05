import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/authService';
import { EmailStateService } from '../../../core/services/email-state.service';
import { parseHttpError } from '../../../core/utils/parse-error.util';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password-component.html',
  styleUrl: './forgot-password-component.scss'
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly emailState = inject(EmailStateService);

  isLoading = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMessage.set('أدخل بريد إلكتروني صحيح');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.forgotPassword({ email: this.form.value.email! }).subscribe({
      next: (res: any) => {
        this.emailState.save(this.form.value.email!);
        this.router.navigate(['/auth/verify-reset-code']);
      },
      error: err => {
        console.log('error fired', err);
        this.errorMessage.set(parseHttpError(err));
        this.isLoading.set(false);
      }
    });
  }
}