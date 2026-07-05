import { Component, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification';

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './notifications-panel.html',
  styleUrl: './notifications-panel.scss'
})
export class NotificationsPanelComponent {
  private readonly router = inject(Router);
  readonly notificationService = inject(NotificationService);

  close = output<void>();

  markAllRead(): void {
    this.notificationService.markAllRead();
  }

  openPost(postId: number | null): void {
    if (!postId) return;
    this.notificationService.markAllRead();
    this.router.navigate(['/nabd'], { queryParams: { postId } });
    this.close.emit();
  }
}