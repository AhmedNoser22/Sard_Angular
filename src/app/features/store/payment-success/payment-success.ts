import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NovelService } from '../../../core/services/novel-service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="result">
      <div class="result__icon"></div>
      <h1 class="result__title">{{ title }}</h1>
      <p class="result__text">{{ message }}</p>
      <a [routerLink]="link" class="result__btn">{{ linkText }}</a>
    </div>
  `,
  styles: [`
    .result {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100vh;
      font-family: 'Amiri', serif; direction: rtl;
      background: #faf3ec; gap: 16px; text-align: center; padding: 24px;
    }
    .result__icon { font-size: 64px; }
    .result__title { font-size: 28px; font-weight: 700; color: #6b2d2d; margin: 0; }
    .result__text { font-size: 16px; color: #8a7264; margin: 0; }
    .result__btn {
      background: #c0785a; color: #fff; text-decoration: none;
      padding: 12px 32px; border-radius: 999px; font-weight: 700;
      font-size: 15px; margin-top: 8px;
    }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly novelService = inject(NovelService);

  title = '';
  message = '';
  link = '/store';
  linkText = '';

  ngOnInit(): void {
    const type = this.route.snapshot.queryParamMap.get('type');
    const novelId = this.route.snapshot.queryParamMap.get('novelId');
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (type === 'read' && novelId && sessionId) {
      this.novelService.confirmPurchase(Number(novelId), sessionId).subscribe({
        next: () => {
          setTimeout(() => {
            this.router.navigate(['/my-novels'], {
              queryParams: { purchased: novelId }
            });
          }, 2000);
        }
      });

      this.title = 'تم الشراء بنجاح!';
      this.message = 'جارٍ تحويلك لمكتبتك...';
      this.link = '/my-novels';
      this.linkText = 'اذهب لمكتبتي';
    } else {
      this.title = 'تم نشر روايتك بنجاح!';
      this.message = 'روايتك الآن متاحة في مكتبة سرد';
      this.link = '/store';
      this.linkText = 'اذهب للمكتبة';
      setTimeout(() => this.router.navigate(['/store']), 2000);
    }
  }
}