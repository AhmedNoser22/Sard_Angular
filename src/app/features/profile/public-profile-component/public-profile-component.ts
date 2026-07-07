import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Subject, of } from 'rxjs';
import { exhaustMap, catchError, finalize } from 'rxjs/operators';
import { ProfileService } from '../../../core/services/profile-service';
import { PublicProfile } from '../../../core/models/profile/public-profile.model';
import { FollowUser } from '../../../core/models/profile/FollowUser';
import { TokenService } from '../../../core/services/tokenService';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './public-profile-component.html',
  styleUrl: './public-profile-component.scss'
})
export class PublicProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly route = inject(ActivatedRoute);
  private readonly tokenService = inject(TokenService);
  private readonly titleService = inject(Title);

  profile = signal<PublicProfile | null>(null);
  isLoading = signal(true);
  isFollowLoading = signal(false);
  currentUserId = this.tokenService.getUser()?.id ?? '';

  showModal = signal(false);
  modalTitle = signal('');
  modalUsers = signal<FollowUser[]>([]);
  isModalLoading = signal(false);

  private readonly followClicks$ = new Subject<string>();

  constructor() {
    this.followClicks$
      .pipe(
        exhaustMap(profileId => {
          this.isFollowLoading.set(true);

          this.profile.update(prev => prev ? {
            ...prev,
            isFollowedByMe: !prev.isFollowedByMe,
            followersCount: !prev.isFollowedByMe ? prev.followersCount + 1 : prev.followersCount - 1
          } : prev);

          return this.profileService.toggleFollow(profileId).pipe(
            catchError(() => {
              this.profile.update(prev => prev ? {
                ...prev,
                isFollowedByMe: !prev.isFollowedByMe,
                followersCount: prev.isFollowedByMe ? prev.followersCount + 1 : prev.followersCount - 1
              } : prev);
              return of(null);
            }),
            finalize(() => this.isFollowLoading.set(false))
          );
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId')!;
    this.profileService.getPublicProfile(userId).subscribe({
      next: p => {
        this.profile.set(p);
        this.isLoading.set(false);
        this.titleService.setTitle(`${p.displayName} - سرد`);
      },
      error: () => this.isLoading.set(false)
    });
  }

  toggleFollow(): void {
    const p = this.profile();
    if (!p || this.isFollowLoading()) return;
    this.followClicks$.next(p.id);
  }

  showFollowers(): void {
    const p = this.profile();
    if (!p || !this.isMyProfile()) return;
    this.modalTitle.set('المتابعون');
    this.showModal.set(true);
    this.isModalLoading.set(true);
    this.profileService.getFollowers(p.id).subscribe({
      next: users => { this.modalUsers.set(users); this.isModalLoading.set(false); },
      error: () => this.isModalLoading.set(false)
    });
  }

  showFollowing(): void {
    const p = this.profile();
    if (!p || !this.isMyProfile()) return;
    this.modalTitle.set('يتابع');
    this.showModal.set(true);
    this.isModalLoading.set(true);
    this.profileService.getFollowing(p.id).subscribe({
      next: users => { this.modalUsers.set(users); this.isModalLoading.set(false); },
      error: () => this.isModalLoading.set(false)
    });
  }

  closeModal(): void { this.showModal.set(false); this.modalUsers.set([]); }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeModal(); }

  isMyProfile(): boolean { return this.profile()?.id === this.currentUserId; }
  getInitial(name: string): string { return name ? name.charAt(0) : '؟'; }
}