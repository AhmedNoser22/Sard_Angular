import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NovelSummary } from '../../../core/models/profile/novel-summary.model';
import { NovelService } from '../../../core/services/novel-service';

@Component({
  selector: 'app-novels-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './novels-list-component.html',
  styleUrl: './novels-list-component.scss'
})
export class NovelsListComponent {
  private readonly novelService = inject(NovelService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  novels = input.required<NovelSummary[]>();
  novelChanged = output<void>();

  isCreating = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  coverPreview = signal<string | null>(null);
  private coverFile: File | null = null;

  deletingNovelId = signal<number | null>(null);
  confirmingDeleteId = signal<number | null>(null);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.maxLength(1000)]
  });

  startCreate(): void {
    this.errorMessage.set('');
    this.isCreating.set(true);
  }

  cancelCreate(): void {
    this.isCreating.set(false);
    this.form.reset();
    this.coverPreview.set(null);
    this.coverFile = null;
    this.errorMessage.set('');
  }
  askDelete(event: Event, novelId: number): void {
    event.stopPropagation();
    this.confirmingDeleteId.set(novelId);
  }

  cancelDelete(event: Event): void {
    event.stopPropagation();
    this.confirmingDeleteId.set(null);
  }

  confirmDelete(event: Event, novelId: number): void {
    event.stopPropagation();
    this.deletingNovelId.set(novelId);
    this.novelService.deleteNovel(novelId).subscribe({
      next: () => {
        this.deletingNovelId.set(null);
        this.confirmingDeleteId.set(null);
        this.novelChanged.emit();
      },
      error: () => {
        this.deletingNovelId.set(null);
        this.errorMessage.set('حدث خطأ في حذف الرواية');
      }
    });
  }

  onCoverSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.coverFile = file;
    const reader = new FileReader();
    reader.onload = e => this.coverPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  createNovel(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.novelService.createNovel({
      title: this.form.value.title!,
      description: this.form.value.description ?? null,
      price: 0
    }).subscribe({
      next: novel => {
        if (this.coverFile) {
          this.novelService.uploadCover(novel.id, this.coverFile).subscribe({
            next: () => this.afterCreate(novel.id),
            error: () => this.afterCreate(novel.id)
          });
        } else {
          this.afterCreate(novel.id);
        }
      },
      error: () => {
        this.errorMessage.set('حدث خطأ في إنشاء الرواية');
        this.isLoading.set(false);
      }
    });
  }

  private afterCreate(novelId: number): void {
    this.isCreating.set(false);
    this.isLoading.set(false);
    this.form.reset();
    this.coverPreview.set(null);
    this.coverFile = null;
    this.novelChanged.emit();
    this.router.navigate(['/novel', novelId]);
  }

  openNovel(novel: NovelSummary): void {
    if (novel.lastReadChapterId) {
      this.router.navigate(['/novel', novel.id, 'chapter', novel.lastReadChapterId]);
    } else {
      this.router.navigate(['/novel', novel.id]);
    }
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      Draft: 'مسودة',
      PendingPayment: 'في انتظار الدفع',
      Published: 'منشورة'
    };
    return map[status] ?? status;
  }
}