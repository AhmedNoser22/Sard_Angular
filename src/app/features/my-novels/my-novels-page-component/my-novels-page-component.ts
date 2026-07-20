import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar-component/navbar-component';
import { NovelService } from '../../../core/services/novel-service';
import { PublishedNovel } from '../../../core/models/novel/PublishedNovel';

@Component({
  selector: 'app-my-novels-page',
  standalone: true,
  imports: [NavbarComponent, RouterLink],
  templateUrl: './my-novels-page-component.html',
  styleUrl: './my-novels-page-component.scss'
})
export class MyNovelsPageComponent implements OnInit {
  private readonly novelService = inject(NovelService);
  private readonly route = inject(ActivatedRoute);

  novels = signal<PublishedNovel[]>([]);
  isLoading = signal(true);
  isDownloading = signal<number | null>(null);
  justPurchasedId = signal<number | null>(null);

  ngOnInit(): void {
    const purchased = this.route.snapshot.queryParamMap.get('purchased');
    if (purchased) this.justPurchasedId.set(Number(purchased));

    this.novelService.getPurchasedNovels().subscribe({
      next: (novels: PublishedNovel[]) => {
        this.novels.set(novels);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  downloadPdf(novel: PublishedNovel): void {
    this.isDownloading.set(novel.id);
    this.novelService.downloadNovelPdf(novel.id).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${novel.title} — سرد.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.isDownloading.set(null);
      },
      error: () => this.isDownloading.set(null)
    });
  }

  getInitial(name: string): string { return name ? name.charAt(0) : '؟'; }
}