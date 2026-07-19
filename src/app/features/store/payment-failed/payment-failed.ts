import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-failed',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="result">
      <div class="result__icon">❌</div>
      <h1 class="result__title">فشلت عملية الدفع</h1>
      <p class="result__text">حدث خطأ أثناء الدفع، يرجى المحاولة مرة أخرى</p>
      <a routerLink="/novel" class="result__btn">رجوع لرواياتي</a>
    </div>
  `,
  styles: [`
    .result {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: 'Amiri', serif;
      direction: rtl;
      background: #faf3ec;
      gap: 16px;
      text-align: center;
      padding: 24px;
    }
    .result__icon { font-size: 64px; }
    .result__title { font-size: 28px; font-weight: 700; color: #6b2d2d; margin: 0; }
    .result__text { font-size: 16px; color: #8a7264; margin: 0; }
    .result__btn {
      background: #c0785a;
      color: #fff;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 15px;
      margin-top: 8px;
    }
  `]
})
export class PaymentFailedComponent {}