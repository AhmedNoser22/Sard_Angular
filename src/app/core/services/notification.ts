import { Injectable, signal } from '@angular/core';
import { AppNotification } from '../models/nabd/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications = signal<AppNotification[]>([]);
  unreadCount = signal(0);

  add(notification: AppNotification): void {
    this.notifications.update(list => [notification, ...list]);
    this.unreadCount.update(c => c + 1);
  }

  markAllRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
    this.unreadCount.set(0);
  }

  clear(): void {
    this.notifications.set([]);
    this.unreadCount.set(0);
  }
}