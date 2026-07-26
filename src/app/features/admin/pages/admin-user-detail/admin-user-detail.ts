import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../../../core/services/admin-service';
import { AdminUserDetail } from '../../../../core/models/admin/admin-user.model';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-admin-user-detail',
  standalone: true,
  imports: [RouterLink,SlicePipe],
  templateUrl: './admin-user-detail.html',
  styleUrl: './admin-user-detail.scss'
})
export class AdminUserDetailComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly route = inject(ActivatedRoute);

  user = signal<AdminUserDetail | null>(null);
  isLoading = signal(true);
  isLockLoading = signal(false);
  activeTab = signal<'posts' | 'novels' | 'followers' | 'following'>('posts');

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId')!;
    this.adminService.getUserDetail(userId).subscribe({
      next: u => { this.user.set(u); this.isLoading.set(false); }
    });
  }

  toggleLock(): void {
    const u = this.user();
    if (!u || this.isLockLoading()) return;

    this.isLockLoading.set(true);
    this.adminService.toggleLock(u.id).subscribe({
      next: res => {
        this.user.update(prev => prev ? { ...prev, isLocked: res.isLocked } : prev);
        this.isLockLoading.set(false);
      },
      error: () => this.isLockLoading.set(false)
    });
  }

  getInitial(name: string): string { return name ? name.charAt(0) : '؟'; }
}