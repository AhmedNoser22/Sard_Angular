import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationService } from '../../../core/services/notification';
import { NabdHubService } from '../../../core/services/nabd-hub';
import { NotificationsPanelComponent } from "../../../features/nabd/components/notifications-panel/notifications-panel";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NotificationsPanelComponent],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.scss'
})
export class NavbarComponent {
  private readonly router = inject(Router);
  readonly notifService = inject(NotificationService);
  private readonly nabdHub = inject(NabdHubService);

  showNotifications = signal(false);

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
    if (this.showNotifications()) this.notifService.markAllRead();
  }

  isHomeActive(): boolean {
    return this.router.url.split('?')[0] === '/profile';
  }
}