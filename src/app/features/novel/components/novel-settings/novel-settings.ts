import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NovelSummary } from '../../../../core/models/profile/novel-summary.model';
import { NovelService } from '../../../../core/services/novel-service';

@Component({
  selector: 'app-novel-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './novel-settings.html',
  styleUrl: './novel-settings.scss'
})
export class NovelSettingsComponent implements OnInit {
  private readonly novelService = inject(NovelService);
  private readonly fb = inject(FormBuilder);

  novel = input.required<NovelSummary>();
  novelUpdated = output<NovelSummary>();
  publishClicked = output<void>();

  isLoading = signal(false);
  isSaved = signal(false);
  isPublishing = signal(false);
  errorMessage = signal('');
  coverPreview = signal<string | null>(null);
  private coverFile: File | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.maxLength(1000)],
    price: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    const n = this.novel();
    this.form.patchValue({
      title: n.title,
      description: n.description ?? '',
      price: n.price
    });
    this.coverPreview.set(n.coverImageUrl);
  }

  onCoverSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.coverFile = file;
    const reader = new FileReader();
    reader.onload = e => this.coverPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  save(): void {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set('');

    const saveSettings = () => {
      this.novelService.updateSettings(this.novel().id, {
        title: this.form.value.title!,
        description: this.form.value.description ?? null,
        price: this.form.value.price!
      }).subscribe({
        next: updated => {
          this.isSaved.set(true);
          this.isLoading.set(false);
          this.novelUpdated.emit(updated);
          setTimeout(() => this.isSaved.set(false), 3000);
        },
        error: () => {
          this.errorMessage.set('حدث خطأ في الحفظ');
          this.isLoading.set(false);
        }
      });
    };

    if (this.coverFile) {
      this.novelService.uploadCover(this.novel().id, this.coverFile).subscribe({
        next: () => saveSettings(),
        error: () => saveSettings()
      });
    } else {
      saveSettings();
    }
  }

  initiatePublish(): void {
    this.isPublishing.set(true);
    this.errorMessage.set('');
    this.novelService.initiatePublish(this.novel().id).subscribe({
      next: res => {
        this.isPublishing.set(false);
        window.location.href = res.iframeUrl;
      },
      error: (err) => {
        this.errorMessage.set(err.error ?? 'حدث خطأ في عملية النشر');
        this.isPublishing.set(false);
      }
    });
  }
}