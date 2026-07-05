import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/authService';

declare const google: any;

@Component({
  selector: 'app-google-callback',
  standalone: true,
  templateUrl: './google-callback-component.html',
  styleUrl: './google-callback-component.scss'
})
export class GoogleCallbackComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID',
      callback: (response: any) => this.handleCredential(response)
    });

    google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      { theme: 'outline', size: 'large', width: '100%' }
    );
  }

  private handleCredential(response: any): void {
    this.authService.googleLogin(response.credential).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: (err) => {
        if (err.status === 0) alert('تعذر الاتصال بالخادم، تحقق من اتصالك');
        else this.router.navigate(['/auth/login']);
      }
    });
  }
}