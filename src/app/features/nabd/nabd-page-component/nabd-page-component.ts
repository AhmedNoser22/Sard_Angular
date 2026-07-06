import { Component, inject, signal, computed, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TokenService } from '../../../core/services/tokenService';
import { Post } from '../../../core/models/nabd/post.model';
import { NabdService } from '../../../core/services/nabd';
import { NabdHubService } from '../../../core/services/nabd-hub';
import { NotificationService } from '../../../core/services/notification';
import { PostCardComponent } from "../components/post-card/post-card";
import { CreatePostComponent } from "../components/create-post/create-post";


@Component({
  selector: 'app-nabd-page',
  standalone: true,
  imports: [PostCardComponent, CreatePostComponent],
  templateUrl: './nabd-page-component.html',
  styleUrl: './nabd-page-component.scss'
})
export class NabdPageComponent implements OnInit, OnDestroy {
  private readonly nabdService = inject(NabdService);
  private readonly hubService = inject(NabdHubService);
  private readonly notificationService = inject(NotificationService);
  private readonly tokenService = inject(TokenService);
  private readonly route = inject(ActivatedRoute);

  readonly notifService = this.notificationService;

  posts = signal<Post[]>([]);
  isLoading = signal(true);
  showNotifications = signal(false);

  // --- Pagination ---
  readonly pageSize = 8;
  currentPage = signal(1);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.posts().length / this.pageSize))
  );

  pagedPosts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.posts().slice(start, start + this.pageSize);
  });

  paginationRange = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  private subs = new Subscription();

  ngOnInit(): void {
    const token = this.tokenService.getToken();
    if (token) this.hubService.connect(token);

    this.loadPosts();

    this.subs.add(
      this.hubService.newPost$.subscribe(post => {
        this.posts.update(list => [post, ...list]);
        this.currentPage.set(1);
      })
    );

    this.subs.add(
      this.hubService.postDeleted$.subscribe(postId => {
        this.posts.update(list => list.filter(p => p.id !== postId));
        this.clampCurrentPage();
      })
    );

    this.subs.add(
      this.hubService.notification$.subscribe(n => {
        this.notificationService.add(n);
      })
    );

    this.route.queryParams.subscribe(params => {
      if (params['postId']) {
        setTimeout(() => {
          const el = document.getElementById(`post-${params['postId']}`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    });
  }

  loadPosts(): void {
    this.nabdService.getPosts().subscribe({
      next: posts => {
        this.posts.set(posts);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onPostCreated(post: Post): void {
    this.posts.update(list =>
      list.some(p => p.id === post.id) ? list : [post, ...list]
    );
    this.currentPage.set(1);
  }

  onPostDeleted(postId: number): void {
    this.posts.update(list => list.filter(p => p.id !== postId));
    this.clampCurrentPage();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
    document.querySelector('.nabd-feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  nextPage(): void { this.goToPage(this.currentPage() + 1); }
  prevPage(): void { this.goToPage(this.currentPage() - 1); }

  private clampCurrentPage(): void {
    const total = this.totalPages();
    if (this.currentPage() > total) this.currentPage.set(total);
  }

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
    if (this.showNotifications()) this.notificationService.markAllRead();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-wrapper')) {
      this.showNotifications.set(false);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}