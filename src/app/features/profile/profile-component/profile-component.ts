import { Component, inject, signal, OnInit } from '@angular/core';
import { ProfileService } from '../../../core/services/profile-service';
import { Profile } from '../../../core/models/profile/profile.model';
import { ProfileCardComponent } from "../profile-card-component/profile-card-component";
import { HighlightsComponent } from "../highlights-component/highlights-component";
import { ProfileStatsComponent } from "../profile-stats-component/profile-stats-component";
import { NovelsListComponent } from "../novels-list-component/novels-list-component";
import { SettingsComponent } from '../../settings/settings-component/settings-component';
import { FavoriteNovelsComponent } from "../components/favorite-novels/favorite-novels";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ProfileCardComponent,
    HighlightsComponent,
    ProfileStatsComponent,
    NovelsListComponent,
    SettingsComponent,
    FavoriteNovelsComponent
],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);

  profile = signal<Profile | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: data => {
        this.profile.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('حدث خطأ في تحميل البروفايل');
        this.isLoading.set(false);
      }
    });
  }

  onProfileUpdated(): void {
    this.loadProfile();
  }
}