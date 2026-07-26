import { Component, inject, signal, OnInit } from '@angular/core';
import { AdminService } from '../../../../core/services/admin-service';
import { AdminPost } from '../../../../core/models/admin/admin-post.model';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [],
  templateUrl: './admin-posts.html',
  styleUrl: './admin-posts.scss'
})
export class AdminPostsComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  posts = signal<AdminPost[]>([]);
  isLoading = signal(true);
  expandedPost = signal<number | null>(null);
  deleteConfirm = signal<{ type: 'post' | 'reply'; id: number } | null>(null);

  ngOnInit(): void {
    this.adminService.getPosts().subscribe({
      next: p => { this.posts.set(p); this.isLoading.set(false); }
    });
  }

  toggleExpand(postId: number): void {
    this.expandedPost.update(v => v === postId ? null : postId);
  }

  confirmDelete(type: 'post' | 'reply', id: number): void {
    this.deleteConfirm.set({ type, id });
  }

  cancelDelete(): void { this.deleteConfirm.set(null); }

  executeDelete(): void {
    const conf = this.deleteConfirm();
    if (!conf) return;

    if (conf.type === 'post') {
      this.adminService.deletePost(conf.id).subscribe({
        next: () => {
          this.posts.update(list => list.filter(p => p.id !== conf.id));
          this.deleteConfirm.set(null);

          const el = document.getElementById(`post-${conf.id}`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        },
        error: () => this.deleteConfirm.set(null)
      });
    } else {
      this.adminService.deleteReply(conf.id).subscribe({
        next: () => {
          this.posts.update(list => list.map(p => ({
            ...p,
            replies: p.replies.filter(r => r.id !== conf.id),
            commentsCount: p.replies.some(r => r.id === conf.id)
              ? Math.max(0, p.commentsCount - 1)
              : p.commentsCount
          })));
          this.deleteConfirm.set(null);
        },
        error: () => this.deleteConfirm.set(null)
      });
    }
  }

  getInitial(name: string): string { return name ? name.charAt(0) : '؟'; }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('ar-EG', {
      timeZone: 'Africa/Cairo',
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}