import { Component } from '@angular/core';
import { ProfileCardComponent } from "../../features/profile/profile-card-component/profile-card-component";
import { ProfileStatsComponent } from "../../features/profile/profile-stats-component/profile-stats-component";
import { HighlightsComponent } from "../../features/profile/highlights-component/highlights-component";
import { NovelsListComponent } from "../../features/profile/novels-list-component/novels-list-component";
import { NavbarComponent } from "../components/navbar-component/navbar-component";

@Component({
  selector: 'app-profile-footer',
  standalone: true,
  templateUrl: './profile-footer-component.html',
  styleUrl: './profile-footer-component.scss',
  imports: [ProfileCardComponent, ProfileStatsComponent, HighlightsComponent, NovelsListComponent, NavbarComponent]
})
export class ProfileFooterComponent {}