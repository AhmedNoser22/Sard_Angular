import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationService } from '../../../core/services/notification';
import { NotificationsPanelComponent } from "../../../features/nabd/components/notifications-panel/notifications-panel";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NotificationsPanelComponent],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.scss'
})
export class NavbarComponent {
  readonly notifService = inject(NotificationService);

  showNotifications = signal(false);

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
    if (this.showNotifications()) this.notifService.markAllRead();
  }
}