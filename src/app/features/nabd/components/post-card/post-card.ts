import { Component, inject, input, output, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Post, Reply } from '../../../../core/models/nabd/post.model';
import { TokenService } from '../../../../core/services/tokenService';
import { NabdService } from '../../../../core/services/nabd';
import { NabdHubService } from '../../../../core/services/nabd-hub';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss'
})
export class PostCardComponent implements OnInit, OnDestroy {
  private readonly nabdService = inject(NabdService);
  private readonly hubService = inject(NabdHubService);
  private readonly tokenService = inject(TokenService);
  private readonly fb = inject(FormBuilder);
  private subs = new Subscription();

  post = input.required<Post>();
  postDeleted = output<number>();

  localPost = signal<Post | null>(null);
  isReplying = signal(false);
  showReplies = signal(false);
  isLikeLoading = signal(false);
  replyingToId = signal<number | null>(null);
  likedByTooltip = signal('');
  showMenu = signal(false);
  showReplyMenu = signal<number | null>(null);

  isShared = signal(false);
  isShareLoading = signal(false);

  showDeletePostConfirm = signal(false);
  showDeleteReplyConfirm = signal<number | null>(null);

  currentUserId = this.tokenService.getUser()?.id ?? '';

  replyForm = this.fb.group({
    content: ['', [Validators.required, Validators.maxLength(1000)]]
  });
  @HostListener('document:click')
  onDocumentClick(): void {
    this.showMenu.set(false);
    this.showReplyMenu.set(null);
  }
  isPostOwner(): boolean {
    return this.localPost()?.authorId === this.currentUserId;
  }


  isReplyOwner(reply: Reply): boolean {
    return reply.authorId === this.currentUserId;
  }

  canDeleteReply(reply: Reply): boolean {
    return reply.authorId === this.currentUserId || this.isPostOwner();
  }
  confirmDeletePost(): void {
    this.showMenu.set(false);
    this.showDeletePostConfirm.set(true);
  }

  confirmDeleteReply(replyId: number): void {
    this.showReplyMenu.set(null);
    this.showDeleteReplyConfirm.set(replyId);
  }
  executeDeletePost(): void {
    this.showDeletePostConfirm.set(false);
    this.deletePost();
  }

  executeDeleteReply(replyId: number): void {
    this.showDeleteReplyConfirm.set(null);
    this.deleteReply(replyId);
  }

  toggleShare(): void {
    if (this.isShareLoading()) return;
    this.isShareLoading.set(true);

    this.nabdService.sharePost(this.post().id).subscribe({
      next: res => {
        this.isShared.update(v => !v);
        this.isShareLoading.set(false);
      },
      error: () => this.isShareLoading.set(false)
    });
  }
  getLikedByText(p: Post): string {
    const names = p.likedByNames;
    const currentUser = this.tokenService.getUser();
    const myName = currentUser?.displayName ?? '';

    const isMe = p.isLikedByMe;
    const others = names.filter(n => n !== myName);

    if (isMe) {
      if (others.length === 0) return 'أعجبك هذا';
      if (others.length === 1) return `أعجبك وأعجب ${others[0]}`;
      return `أعجبك وأعجب ${others[0]} و${others.length - 1} آخرين`;
    } else {
      if (names.length === 1) return `أعجب ${names[0]}`;
      if (names.length === 2) return `أعجب ${names[0]} و${names[1]}`;
      return `أعجب ${names[0]} و${names.length - 1} آخرين`;
    }
  }
  ngOnInit(): void {
    this.localPost.set({ ...this.post(), replies: [...this.post().replies] });
    this.hubService.joinPost(this.post().id);

    this.subs.add(this.hubService.newReply$.subscribe(data => {
      if (data.postId === this.post().id) {
        this.localPost.update(p => p ? {
          ...p,
          replies: [...p.replies, data.reply],
          commentsCount: p.commentsCount + 1
        } : p);
        this.showReplies.set(true);
      }
    }));

    this.subs.add(this.hubService.replyDeleted$.subscribe(data => {
      if (data.postId === this.post().id) {
        this.localPost.update(p => p ? {
          ...p,
          replies: p.replies.filter(r => r.id !== data.replyId),
          commentsCount: Math.max(0, p.commentsCount - 1)
        } : p);
      }
    }));

    this.subs.add(this.hubService.likeUpdated$.subscribe(data => {
      if (data.postId === this.post().id) {
        this.localPost.update(p => p ? { ...p, likesCount: data.likesCount } : p);
      }
    }));
  }
  toggleMenu(): void { this.showMenu.update(v => !v); }
  toggleReplyMenu(id: number): void {
    this.showReplyMenu.update(v => v === id ? null : id);
  }

  ngOnDestroy(): void {
    this.hubService.leavePost(this.post().id);
    this.subs.unsubscribe();
  }

  toggleLike(): void {
    if (this.isLikeLoading()) return;
    this.isLikeLoading.set(true);

    const wasLiked = this.localPost()?.isLikedByMe ?? false;
    this.localPost.update(p => p ? {
      ...p,
      isLikedByMe: !wasLiked,
      likesCount: wasLiked ? p.likesCount - 1 : p.likesCount + 1
    } : p);

    this.nabdService.toggleLike(this.post().id).subscribe({
      next: res => {
        this.localPost.update(p => p ? { ...p, isLikedByMe: res.isLiked, likesCount: res.likesCount } : p);
        this.isLikeLoading.set(false);
      },
      error: () => {
        this.localPost.update(p => p ? {
          ...p,
          isLikedByMe: wasLiked,
          likesCount: wasLiked ? (p.likesCount + 1) : (p.likesCount - 1)
        } : p);
        this.isLikeLoading.set(false);
      }
    });
  }

  toggleReplies(): void { this.showReplies.update(v => !v); }
  startReply(): void { this.isReplying.set(true); }
  cancelReply(): void { this.isReplying.set(false); this.replyForm.reset(); }

  /** Toggle behavior: clicking the comment icon while the composer is open
   * closes it; clicking while it's closed opens it and reveals replies. */
  onCommentButtonClick(): void {
    if (this.isReplying()) {
      this.isReplying.set(false);
      this.replyForm.reset();
    } else {
      this.isReplying.set(true);
      this.showReplies.set(true);
    }
  }

  submitReply(): void {
    if (this.replyForm.invalid) return;
    this.nabdService.addReply(this.post().id, {
      content: this.replyForm.value.content!
    }).subscribe({
      next: () => { this.replyForm.reset(); this.isReplying.set(false); this.showReplies.set(true); }
    });
  }

  deletePost(): void {
    this.nabdService.deletePost(this.post().id).subscribe({
      next: () => this.postDeleted.emit(this.post().id)
    });
  }

  deleteReply(replyId: number): void {
    this.nabdService.deleteReply(this.post().id, replyId).subscribe({
      next: () => {
        this.localPost.update(p => p ? {
          ...p,
          replies: p.replies.filter(r => r.id !== replyId),
          commentsCount: Math.max(0, p.commentsCount - 1)
        } : p);
      }
    });
  }

  getInitial(name: string): string { return name ? name.charAt(0) : '؟'; }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('ar-EG', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isMyPost(): boolean {
    return this.localPost()?.authorId === this.currentUserId;
  }
}