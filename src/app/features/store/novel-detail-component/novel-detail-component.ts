import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NovelService } from '../../../core/services/novel-service';
import { PublishedNovel } from '../../../core/models/novel/PublishedNovel';

@Component({
  selector: 'app-novel-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './novel-detail-component.html',
  styleUrl: './novel-detail-component.scss'
})
export class NovelDetailComponent implements OnInit {
  private readonly novelService = inject(NovelService);
  private readonly route = inject(ActivatedRoute);

  novel = signal<PublishedNovel | null>(null);
  hasPurchased = signal(false);
  isLoading = signal(true);
  isPurchasing = signal(false);
  isDownloading = signal(false);
  errorMessage = signal('');

  novelId = 0;

  ngOnInit(): void {
    this.novelId = Number(this.route.snapshot.paramMap.get('novelId'));

    this.novelService.getPublishedNovels().subscribe({
      next: novels => {
        const found = novels.find(n => n.id === this.novelId);
        if (found) this.novel.set(found);
        this.isLoading.set(false);
      }
    });

    this.novelService.hasPurchased(this.novelId).subscribe({
      next: res => this.hasPurchased.set(res.hasPurchased)
    });
  }

  purchase(): void {
    this.isPurchasing.set(true);
    this.errorMessage.set('');
    this.novelService.purchaseNovel(this.novelId).subscribe({
      next: res => {
        this.isPurchasing.set(false);
        window.location.href = res.checkoutUrl;
      },
      error: err => {
        this.errorMessage.set(err.error ?? 'حدث خطأ في عملية الشراء');
        this.isPurchasing.set(false);
      }
    });
  }

  downloadPdf(): void {
    this.isDownloading.set(true);
    this.novelService.downloadNovelPdf(this.novelId).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.novel()?.title ?? 'رواية'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.isDownloading.set(false);
      },
      error: () => {
        this.errorMessage.set('حدث خطأ في التحميل');
        this.isDownloading.set(false);
      }
    });
  }

  getInitial(name: string): string { return name ? name.charAt(0) : '؟'; }
}