import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Highlight } from '../../../core/models/profile/Highlight.model';
import { ProfileService } from '../../../core/services/profile-service';

@Component({
  selector: 'app-highlights',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './highlights-component.html',
  styleUrl: './highlights-component.scss'
})
export class HighlightsComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly fb = inject(FormBuilder);

  // No longer synced via ngOnChanges — this component owns its own state
  // once it fetches from the server, so a stale parent re-render can't
  // ever overwrite a local delete/add again.
  showBackLink = input<boolean>(true);
  highlightChanged = output<void>();

  localHighlights = signal<Highlight[]>([]);
  isLoadingList = signal(true);

  isAdding = signal(false);
  isClosing = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    content: ['', [Validators.required, Validators.maxLength(1000)]],
    novelTitle: ['', Validators.maxLength(200)],
    novelAuthor: ['', Validators.maxLength(100)]
  });

  ngOnInit(): void {
    this.fetchHighlights();
  }

  private fetchHighlights(): void {
    this.isLoadingList.set(true);
    this.profileService.getProfile().subscribe({
      next: profile => {
        this.localHighlights.set(profile.highlights ?? []);
        this.isLoadingList.set(false);
      },
      error: () => this.isLoadingList.set(false)
    });
  }

  startAdd(): void {
    this.isAdding.set(true);
    this.isClosing.set(false);
  }

  cancelAdd(): void {
    if (this.isLoading()) return;
    this.isClosing.set(true);
    setTimeout(() => {
      this.isAdding.set(false);
      this.isClosing.set(false);
      this.form.reset();
    }, 180);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.cancelAdd();
  }

  addHighlight(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.profileService.addHighlight({
      content: this.form.value.content!,
      novelTitle: this.form.value.novelTitle ?? null,
      novelAuthor: this.form.value.novelAuthor ?? null
    }).subscribe({
      next: newHighlight => {
        this.localHighlights.update(list => [newHighlight, ...list]);
        this.isLoading.set(false);
        this.form.reset();
        this.highlightChanged.emit();
        this.cancelAdd();
      },
      error: () => this.isLoading.set(false)
    });
  }

  deleteHighlight(id: number): void {
    const previous = this.localHighlights();
    this.localHighlights.update(list => list.filter(h => h.id !== id));
    this.errorMessage.set('');

    this.profileService.deleteHighlight(id).subscribe({
      next: () => {
        // tell the parent (profile page, etc.) to refresh its own copy
        // so it doesn't hand us a stale list again later
        this.highlightChanged.emit();
      },
      error: () => {
        this.localHighlights.set(previous);
        this.errorMessage.set('حدث خطأ أثناء حذف الأثر');
      }
    });
  }
}