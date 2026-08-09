import { Component, inject, input, output, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Profile } from '../../../core/models/profile/profile.model';
import { ProfileService } from '../../../core/services/profile-service';
import { DatePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './profile-card-component.html',
  styleUrl: './profile-card-component.scss'
})
export class ProfileCardComponent {
  private readonly profileService = inject(ProfileService);
  private readonly fb = inject(FormBuilder);

  private title = inject(Title);

  profile = input.required<Profile>();
  profileUpdated = output<void>();

  isEditing = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  
  imageLoadError = signal(false);

  displayNameClean = computed(() => this.sanitizeName(this.profile()?.displayName ?? ''));
  ngOnDestroy(): void {
    this.title.setTitle('سرد');
  }
  initials = computed(() => {
    const name = this.displayNameClean();
    if (!name) return '؟';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0);
    return parts[0].charAt(0) + parts[1].charAt(0);
  });

  avatarColor = computed(() => {
    const name = this.displayNameClean();
    const palette = [
      '#c0785a', '#6b2d2d', '#4a7c6f', '#3d5a80',
      '#8e5572', '#b56576', '#7a6c5d', '#5e6472'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % palette.length;
    return palette[index];
  });

  showRealImage = computed(() => !!this.profile()?.profileImageUrl && !this.imageLoadError());

  form = this.fb.group({
    displayName: ['', [Validators.required, Validators.maxLength(100)]],
    bio: ['', Validators.maxLength(500)]
  });

  private sanitizeName(value: string): string {
    return value
      .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
      .replace(/\u00A0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  startEdit(): void {
    this.form.patchValue({
      displayName: this.sanitizeName(this.profile().displayName),
      bio: this.profile().bio ?? ''
    });
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.errorMessage.set('');
  }

  saveProfile(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.profileService.updateProfile({
      displayName: this.sanitizeName(this.form.value.displayName!),
      bio: this.form.value.bio ?? null
    }).subscribe({
      next: () => {
        this.isEditing.set(false);
        this.isLoading.set(false);
        this.profileUpdated.emit();
      },
      error: () => {
        this.errorMessage.set('حدث خطأ في التحديث');
        this.isLoading.set(false);
      }
    });
  }

  onImageError(): void {
    this.imageLoadError.set(true);
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);


    this.profileService.updateProfileImage(file).subscribe({
      next: () => this.profileUpdated.emit(),
      error: () => this.errorMessage.set('حدث خطأ في رفع الصورة')
    });

    const img = document.querySelector('.profile-card__photo') as HTMLImageElement;
    if (img) img.src = url;
  }
}