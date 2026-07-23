import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NabdHubService } from './core/services/nabd-hub';
import { NotificationService } from './core/services/notification';
import { TokenService } from './core/services/tokenService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class App implements OnInit {
  private readonly hubService = inject(NabdHubService);
  private readonly notificationService = inject(NotificationService);
  private readonly tokenService = inject(TokenService);

  ngOnInit(): void {
    const token = this.tokenService.getToken();
    if (token) {
      this.hubService.connect(token);

      this.hubService.notification$.subscribe(n => {
        this.notificationService.add(n);
      });
    }
  }
}