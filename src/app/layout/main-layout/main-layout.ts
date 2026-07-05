import { Component } from '@angular/core';
import { NavbarComponent } from "../../shared/components/navbar-component/navbar-component";
import { RouterOutlet } from "@angular/router";
import { ProfileFooterComponent } from "../../shared/profile-footer-component/profile-footer-component";

@Component({
  selector: 'app-main-layout',
  imports: [NavbarComponent, RouterOutlet, ProfileFooterComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {

}
