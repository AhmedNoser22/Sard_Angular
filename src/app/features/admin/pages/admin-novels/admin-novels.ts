import { Component, inject, signal, OnInit } from '@angular/core';
import { AdminService } from '../../../../core/services/admin-service';
import { AdminNovel } from '../../../../core/models/admin/admin-novel.model';

@Component({
  selector: 'app-admin-novels',
  standalone: true,
  imports: [],
  templateUrl: './admin-novels.html',
  styleUrl: './admin-novels.scss'
})
export class AdminNovelsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  novels = signal<AdminNovel[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.adminService.getNovels().subscribe({
      next: n => { this.novels.set(n); this.isLoading.set(false); }
    });
  }
}