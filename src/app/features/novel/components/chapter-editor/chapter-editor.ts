import { Component, inject, input, output, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Chapter } from '../../../../core/models/novel/chapter.model';
import { NovelService } from '../../../../core/services/novel-service';
import { AiService } from '../../../../core/services/ai.service';

@Component({
  selector: 'app-chapter-editor',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './chapter-editor.html',
  styleUrl: './chapter-editor.scss'
})
export class ChapterEditorComponent implements OnInit, OnDestroy {
  private readonly novelService = inject(NovelService);
  private readonly aiService = inject(AiService);
  private readonly fb = inject(FormBuilder);

  chapter = input<Chapter | null>(null);
  novelId = input.required<number>();
  nextOrder = input<number>(1);
  chapterSaved = output<Chapter>();

  isLoading = signal(false);
  isCorrectingAi = signal(false);
  isSaved = signal(false);
  errorMessage = signal('');
  private autoSaveTimer: any;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    content: ['', Validators.required],
    order: [1, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    if (this.chapter()) {
      this.form.patchValue({
        title: this.chapter()!.title,
        content: this.chapter()!.content,
        order: this.chapter()!.order
      });
    } else {
      this.form.patchValue({ order: this.nextOrder() });
    }

    this.form.valueChanges.subscribe(() => {
      this.isSaved.set(false);
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = setTimeout(() => this.save(), 30000);
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.autoSaveTimer);
  }

  save(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.novelService.saveChapter(
      this.novelId(),
      {
        title: this.form.value.title!,
        content: this.form.value.content!,
        order: this.form.value.order!
      },
      this.chapter()?.id
    ).subscribe({
      next: saved => {
        this.isLoading.set(false);
        this.isSaved.set(true);
        this.chapterSaved.emit(saved);
      },
      error: () => {
        this.errorMessage.set('حدث خطأ في الحفظ');
        this.isLoading.set(false);
      }
    });
  }

  correctWithAi(): void {
    const content = this.form.value.content;
    if (!content) return;

    this.isCorrectingAi.set(true);
    this.errorMessage.set('');

    this.aiService.correctText(content).subscribe({
      next: res => {
        this.form.patchValue({ content: res.corrected });
        this.isCorrectingAi.set(false);
      },
      error: (err) => {
        const serverMessage = typeof err?.error === 'string' ? err.error : null;
        this.errorMessage.set(serverMessage ?? 'حدث خطأ في التصحيح');
        console.error('AI correction failed:', err);
        this.isCorrectingAi.set(false);
      }
    });
  }
}