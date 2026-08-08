import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar-component/navbar-component';
import { GroupService } from '../../../core/services/group-service';
import { TokenService } from '../../../core/services/tokenService';
import { GroupHubService } from '../../../core/services/group-hub-service';
import { Group } from '../../../core/models/group/group.model';

@Component({
  selector: 'app-groups-page',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule],
  templateUrl: './groups-page-component.html',
  styleUrl: './groups-page-component.scss'
})
export class GroupsPageComponent implements OnInit {
  private readonly groupService = inject(GroupService);
  private readonly groupHubService = inject(GroupHubService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  groups = signal<Group[]>([]);
  isLoading = signal(true);
  isCreating = signal(false);
  isSubmitting = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)]
  });

  ngOnInit(): void {
    const token = this.tokenService.getToken();
    if (token) this.groupHubService.connect(token);

    this.groupService.getMyGroups().subscribe({
      next: groups => { this.groups.set(groups); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  startCreate(): void { this.isCreating.set(true); }
  cancelCreate(): void { this.isCreating.set(false); this.form.reset(); }

  createGroup(): void {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);

    this.groupService.createGroup({
      name: this.form.value.name!,
      description: this.form.value.description ?? null
    }).subscribe({
      next: group => {
        this.groups.update(list => [group, ...list]);
        this.isCreating.set(false);
        this.isSubmitting.set(false);
        this.form.reset();
        this.router.navigate(['/groups', group.id]);
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  openGroup(groupId: number): void {
    this.router.navigate(['/groups', groupId]);
  }

  getInitial(name: string): string { return name ? name.charAt(0) : '؟'; }
}