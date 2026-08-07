import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { inject } from '@angular/core';

@Component({
  selector: 'app-admin-jobs',
  standalone: true,
  imports: [],
  template: `
    <div class="jobs-page">
      <h1 class="jobs-page__title">مهام الخلفية</h1>
      <div class="jobs-page__frame-wrap">
        <iframe
          [src]="hangfireUrl"
          class="jobs-page__frame"
          title="Hangfire Dashboard">
        </iframe>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Amiri', serif; direction: rtl; }

    .jobs-page {
      &__title {
        font-size: 22px;
        font-weight: 700;
        color: #6b2d2d;
        margin: 0 0 20px;
      }

      &__frame-wrap {
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid #ecdfd2;
        box-shadow: 0 4px 20px rgba(107,45,45,0.08);
        height: calc(100vh - 140px);
      }

      &__frame {
        width: 100%;
        height: 100%;
        border: none;
      }
    }
  `]
})
export class AdminJobsComponent {
  private readonly sanitizer = inject(DomSanitizer);

  hangfireUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://localhost:7002/hangfire'
  );
}