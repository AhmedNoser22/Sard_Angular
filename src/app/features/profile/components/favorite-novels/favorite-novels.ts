import { Component, inject, input, output, signal, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FavoriteNovel } from '../../../../core/models/profile/public-profile.model';
import { ProfileService } from '../../../../core/services/profile-service';

@Component({
  selector: 'app-favorite-novels',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './favorite-novels.html',
  styleUrl: './favorite-novels.scss'
})
export class FavoriteNovelsComponent implements OnChanges {
  private readonly profileService = inject(ProfileService);
  private readonly fb = inject(FormBuilder);

  favoriteNovels = input.required<FavoriteNovel[]>();
  changed = output<void>();

  localNovels = signal<FavoriteNovel[]>([]);
  isAdding = signal(false);
  isLoading = signal(false);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    authorName: ['', Validators.maxLength(100)],
    coverImageUrl: ['', Validators.maxLength(500)]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['favoriteNovels']) {
      this.localNovels.set([...this.favoriteNovels()]);
    }
  }

  startAdd(): void { this.isAdding.set(true); }
  cancelAdd(): void { this.isAdding.set(false); this.form.reset(); }

  addNovel(): void {
    if (this.form.invalid) return;
    this.isLoading.set(true);

    this.profileService.addFavoriteNovel({
      title: this.form.value.title!,
      authorName: this.form.value.authorName ?? null,
      coverImageUrl: this.form.value.coverImageUrl ?? null
    }).subscribe({
      next: novel => {
        this.localNovels.update(list => [novel, ...list]);
        this.isAdding.set(false);
        this.isLoading.set(false);
        this.form.reset();
      },
      error: () => this.isLoading.set(false)
    });
  }

  deleteNovel(id: number): void {
    this.localNovels.update(list => list.filter(n => n.id !== id));
    this.profileService.deleteFavoriteNovel(id).subscribe({
      error: () => this.localNovels.set([...this.favoriteNovels()])
    });
  }
}