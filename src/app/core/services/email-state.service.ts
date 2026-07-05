import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EmailStateService {
  private readonly KEY = 'sard_pending_email';

  save(email: string): void {
    sessionStorage.setItem(this.KEY, email);
  }

  get(): string {
    return sessionStorage.getItem(this.KEY) ?? '';
  }

  clear(): void {
    sessionStorage.removeItem(this.KEY);
  }
}