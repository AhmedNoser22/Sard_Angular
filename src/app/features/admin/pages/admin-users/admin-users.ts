import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../../core/services/admin-service';
import { AdminUser } from '../../../../core/models/admin/admin-user.model';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [FormsModule, RouterLink,SlicePipe],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss'
})
export class AdminUsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  users = signal<AdminUser[]>([]);
  isLoading = signal(true);
  search = signal('');

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.adminService.getUsers(this.search()).subscribe({
      next: u => { this.users.set(u); this.isLoading.set(false); }
    });
  }

  toggleLock(userId: string): void {
    this.adminService.toggleLock(userId).subscribe({
      next: () => {
        this.users.update(list => list.map(u =>
          u.id === userId ? { ...u, isLocked: !u.isLocked } : u
        ));
      }
    });
  }

  getInitial(name: string): string { return name ? name.charAt(0) : '؟'; }
}