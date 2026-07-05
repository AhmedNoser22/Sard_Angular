import { Component, input } from '@angular/core';
import { Profile } from '../../../core/models/profile/profile.model';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  templateUrl: './profile-stats-component.html',
  styleUrl: './profile-stats-component.scss'
})
export class ProfileStatsComponent {
  profile = input.required<Profile>();
}