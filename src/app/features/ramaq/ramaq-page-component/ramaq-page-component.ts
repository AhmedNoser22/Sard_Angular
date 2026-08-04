import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NabdService } from '../../../core/services/nabd';
import { SharedPost } from '../../../core/models/nabd/SharedPost';

@Component({
  selector: 'app-ramaq-page',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './ramaq-page-component.html',
  styleUrl: './ramaq-page-component.scss'
})
export class RamaqPageComponent implements OnInit {
  private readonly nabdService = inject(NabdService);

  shares = signal<SharedPost[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.nabdService.getMyShares().subscribe({
      next: s => { this.shares.set(s); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  removeShare(shareId: number): void {
    const share = this.shares().find(s => s.shareId === shareId);
    if (!share) return;

    this.nabdService.sharePost(share.postId).subscribe({
      next: () => {
        this.shares.update(list => list.filter(s => s.shareId !== shareId));
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('ar-EG', {
      timeZone: 'Africa/Cairo',
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getInitial(name: string): string { return name ? name.charAt(0) : '؟'; }
}