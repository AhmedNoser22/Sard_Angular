import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
  private readonly router = inject(Router);

  novels = signal<PublishedNovel[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');

  filteredNovels = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.novels();

    return this.novels().filter(novel =>
      novel.title.toLowerCase().includes(term) ||
      novel.authorName.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.novelService.getPublishedNovels().subscribe({
      next: novels => { this.novels.set(novels); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  addToLibrary(novel: PublishedNovel): void {
    this.router.navigate(['/store', novel.id]);
  }

  getInitial(name: string): string {
    return name ? name.charAt(0) : '؟';
  }
}