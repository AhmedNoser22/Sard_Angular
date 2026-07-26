import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NabdHubService } from './core/services//nabd-hub';
import { NotificationService } from './core/services/notification';
import { TokenService } from './core/services/tokenService';
import { AdminService } from './core/services/admin-service';

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
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const token = this.tokenService.getToken();
    const user = this.tokenService.getUser();

    if (token && user) {
      this.hubService.connect(token);
      this.hubService.notification$.subscribe(n => {
        this.notificationService.add(n);
      });

      setInterval(() => {
        this.adminService.checkIsLocked(user.id).subscribe({
          next: res => {
            if (res.isLocked) {
              this.tokenService.clear();
              this.router.navigate(['/auth/login'], {
                state: { message: 'تم قفل حسابك من قِبَل الإدارة. للاستفسار تواصل مع الدعم.' }
              });
            }
          }
        });
      }, 30000);
    }
  }
}