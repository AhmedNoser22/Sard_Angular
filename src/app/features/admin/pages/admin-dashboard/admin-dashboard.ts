import { Component, inject, signal, OnInit } from '@angular/core';
import { AdminService } from '../../../../core/services/admin-service';
import { AdminStats } from '../../../../core/models/admin/admin-stats.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  stats = signal<AdminStats | null>(null);

  ngOnInit(): void {
    this.adminService.getStats().subscribe({
      next: s => this.stats.set(s)
    });
  }
}