import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TokenService } from '../../../core/services/tokenService';
import { inject } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout-component.html',
  styleUrl: './admin-layout-component.scss'
})
export class AdminLayoutComponent {
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  isSidebarOpen = signal(false);

  toggleSidebar(): void { this.isSidebarOpen.update(v => !v); }

  closeSidebar(): void { this.isSidebarOpen.set(false); }

  logout(): void {
    this.tokenService.clear();
    this.router.navigate(['/auth/login']);
  }
}