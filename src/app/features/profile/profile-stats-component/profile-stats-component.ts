import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Profile } from '../../../core/models/profile/profile.model';
import { ProfileService } from '../../../core/services/profile-service';
import { FollowUser } from '../../../core/models/profile/FollowUser';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile-stats-component.html',
  styleUrl: './profile-stats-component.scss'
})
export class ProfileStatsComponent {
  private readonly profileService = inject(ProfileService);

  profile = input.required<Profile>();

  showModal = signal(false);
  modalTitle = signal('');
  modalUsers = signal<FollowUser[]>([]);
  isModalLoading = signal(false);

  showFollowers(): void {
    const id = this.profile().id;
    this.modalTitle.set('المتابعون');
    this.showModal.set(true);
    this.isModalLoading.set(true);
    this.profileService.getFollowers(id).subscribe({
      next: users => { this.modalUsers.set(users); this.isModalLoading.set(false); },
      error: () => this.isModalLoading.set(false)
    });
  }

  showFollowing(): void {
    const id = this.profile().id;
    this.modalTitle.set('يتابع');
    this.showModal.set(true);
    this.isModalLoading.set(true);
    this.profileService.getFollowing(id).subscribe({
      next: users => { this.modalUsers.set(users); this.isModalLoading.set(false); },
      error: () => this.isModalLoading.set(false)
    });
  }

  closeModal(): void { this.showModal.set(false); this.modalUsers.set([]); }

  getInitial(name: string): string { return name ? name.charAt(0) : '؟'; }
}