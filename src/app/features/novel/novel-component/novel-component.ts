import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NovelService } from '../../../core/services/novel-service';
import { ProfileService } from '../../../core/services/profile-service';
import { NovelSummary } from '../../../core/models/profile/novel-summary.model';
import { Chapter } from '../../../core/models/novel/chapter.model';
import { ChapterEditorComponent } from '../components/chapter-editor/chapter-editor';
import { NovelsListComponent } from '../../profile/novels-list-component/novels-list-component';
import { NovelSettingsComponent } from "../components/novel-settings/novel-settings";

type SidebarTab = 'chapters' | 'settings';

@Component({
  selector: 'app-novel',
  standalone: true,
  imports: [RouterLink, ChapterEditorComponent, NovelsListComponent, NovelSettingsComponent],
  templateUrl: './novel-component.html',
  styleUrl: './novel-component.scss'
})
export class NovelComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly novelService = inject(NovelService);
  private readonly profileService = inject(ProfileService);

  hasNovelId = signal(false);

  allNovels = signal<NovelSummary[]>([]);
  isLoadingList = signal(true);

  novel = signal<NovelSummary | null>(null);
  chapters = signal<Chapter[]>([]);
  activeChapter = signal<Chapter | null>(null);
  isLoading = signal(true);
  isCreatingChapter = signal(false);
  isSidebarOpen = signal(false);
  activeSidebarTab = signal<SidebarTab>('chapters');

  novelId = signal(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('novelId');

    if (!idParam) {
      this.hasNovelId.set(false);
      this.loadAllNovels();
      return;
    }

    this.hasNovelId.set(true);
    const id = Number(idParam);
    const chapterId = Number(this.route.snapshot.paramMap.get('chapterId'));
    this.novelId.set(id);

    this.profileService.getProfile().subscribe({
      next: profile => {
        const found = profile.novels.find(n => n.id === id);
        if (!found) { this.router.navigate(['/novel']); return; }
        this.novel.set(found);
        this.loadChapters(chapterId || found.lastReadChapterId || null);
      }
    });
  }

  loadAllNovels(): void {
    this.profileService.getProfile().subscribe({
      next: profile => {
        this.allNovels.set(profile.novels);
        this.isLoadingList.set(false);
      },
      error: () => this.isLoadingList.set(false)
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
    this.isSidebarOpen.set(false);
  }

  onChapterSaved(chapter: Chapter): void {
    this.novelService.setLastReadChapter(this.novelId(), chapter.id).subscribe();
    this.loadChapters();
    this.activeChapter.set(chapter);
  }

  startNewChapter(): void {
    this.activeChapter.set(null);
    this.isCreatingChapter.set(true);
    this.isSidebarOpen.set(false);
  }

  onNewChapterSaved(chapter: Chapter): void {
    this.isCreatingChapter.set(false);
    this.activeChapter.set(chapter);
    this.loadChapters();
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  setSidebarTab(tab: SidebarTab): void {
    this.activeSidebarTab.set(tab);
  }

  onNovelUpdated(updated: NovelSummary): void {
    this.novel.set(updated);
  }
}