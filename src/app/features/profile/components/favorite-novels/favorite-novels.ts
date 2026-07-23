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
  coverPreview = signal<string | null>(null);
  private coverFile: File | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    authorName: ['', Validators.maxLength(100)]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['favoriteNovels']) {
      this.localNovels.set([...this.favoriteNovels()]);
    }
  }

  startAdd(): void { this.isAdding.set(true); }

  cancelAdd(): void {
    this.isAdding.set(false);
    this.form.reset();
    this.coverPreview.set(null);
    this.coverFile = null;
  }

  onCoverSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.coverFile = file;
    const reader = new FileReader();
    reader.onload = e => this.coverPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  addNovel(): void {
    if (this.form.invalid) return;
    this.isLoading.set(true);

    this.profileService.addFavoriteNovel(
      this.form.value.title!,
      this.form.value.authorName ?? null,
      this.coverFile
    ).subscribe({
      next: novel => {
        this.localNovels.update(list => [novel, ...list]);
        this.isAdding.set(false);
        this.isLoading.set(false);
        this.form.reset();
        this.coverPreview.set(null);
        this.coverFile = null;
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