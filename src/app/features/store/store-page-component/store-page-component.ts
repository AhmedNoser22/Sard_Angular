import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NovelService } from '../../../core/services/novel-service';
import { PublishedNovel } from '../../../core/models/novel/PublishedNovel';

@Component({
  selector: 'app-store-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './store-page-component.html',
  styleUrl: './store-page-component.scss'
})
export class StorePageComponent implements OnInit {
  private readonly novelService = inject(NovelService);

  novels = signal<PublishedNovel[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.novelService.getPublishedNovels().subscribe({
      next: novels => { this.novels.set(novels); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  getInitial(name: string): string { return name ? name.charAt(0) : '؟'; }
}