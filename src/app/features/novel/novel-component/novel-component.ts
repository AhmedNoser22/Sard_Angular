import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NovelService } from '../../../core/services/novel-service';
import { ProfileService } from '../../../core/services/profile-service';
import { NovelSummary } from '../../../core/models/profile/novel-summary.model';
import { Chapter } from '../../../core/models/novel/chapter.model';
import { ChapterEditorComponent } from '../components/chapter-editor/chapter-editor';
import { NavbarComponent } from "../../../shared/components/navbar-component/navbar-component";

@Component({
  selector: 'app-novel',
  standalone: true,
  imports: [RouterLink, ChapterEditorComponent, NavbarComponent],
  templateUrl: './novel-component.html',
  styleUrl: './novel-component.scss'
})
export class NovelComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly novelService = inject(NovelService);
  private readonly profileService = inject(ProfileService);

  novel = signal<NovelSummary | null>(null);
  chapters = signal<Chapter[]>([]);
  activeChapter = signal<Chapter | null>(null);
  isLoading = signal(true);
  isCreatingChapter = signal(false);

  novelId = signal(0);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('novelId'));
    const chapterId = Number(this.route.snapshot.paramMap.get('chapterId'));
    this.novelId.set(id);

    this.profileService.getProfile().subscribe({
      next: profile => {
        const found = profile.novels.find(n => n.id === id);
        if (!found) { this.router.navigate(['/profile']); return; }
        this.novel.set(found);
        this.loadChapters(chapterId || found.lastReadChapterId || null);
      }
    });
  }

  loadChapters(openChapterId: number | null = null): void {
    this.novelService.getChapters(this.novelId()).subscribe({
      next: chapters => {
        this.chapters.set(chapters);
        this.isLoading.set(false);

        if (openChapterId) {
          const found = chapters.find(c => c.id === openChapterId);
          if (found) this.openChapter(found);
        }
      }
    });
  }

  openChapter(chapter: Chapter): void {
    this.activeChapter.set(chapter);
    this.novelService.setLastReadChapter(this.novelId(), chapter.id).subscribe();
    this.router.navigate(['/novel', this.novelId(), 'chapter', chapter.id], { replaceUrl: true });
  }

  onChapterSaved(chapter: Chapter): void {
    this.novelService.setLastReadChapter(this.novelId(), chapter.id).subscribe();
    this.loadChapters();
    this.activeChapter.set(chapter);
  }

  startNewChapter(): void {
    this.activeChapter.set(null);
    this.isCreatingChapter.set(true);
  }

  onNewChapterSaved(chapter: Chapter): void {
    this.isCreatingChapter.set(false);
    this.activeChapter.set(chapter);
    this.loadChapters();
  }
}