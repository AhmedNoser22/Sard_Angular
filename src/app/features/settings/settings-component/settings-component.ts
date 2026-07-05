import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../../core/services/profile-service';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './settings-component.html',
  styleUrl: './settings-component.scss'
})
export class SettingsComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly fb = inject(FormBuilder);

  isOpen = signal(false);
  isClosing = signal(false);

  isLoading = signal(false);
  isSaved = signal(false);
  errorMessage = signal('');
  isDarkMode = signal(false);

  profileImageUrl = signal<string | null>(null);
  displayName = signal('');
  imageLoadError = signal(false);

  // نفس منطق البروفايل بالضبط
  initials = computed(() => {
    const name = this.displayName().trim();
    if (!name) return '؟';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0);
    return parts[0].charAt(0) + parts[1].charAt(0);
  });

  avatarColor = computed(() => {
    const name = this.displayName();
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

  showRealImage = computed(() => !!this.profileImageUrl() && !this.imageLoadError());

  form = this.fb.group({
    displayName: ['', [Validators.required, Validators.maxLength(100)]],
    bio: ['', Validators.maxLength(500)]
  });

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('sard_theme');
    this.isDarkMode.set(savedTheme === 'dark');
    this.applyTheme(this.isDarkMode());
  }

  open(): void {
    this.isOpen.set(true);
    this.isClosing.set(false);
    this.isSaved.set(false);
    this.errorMessage.set('');
    this.imageLoadError.set(false);

    this.profileService.getProfile().subscribe({
      next: profile => {
        this.form.patchValue({
          displayName: profile.displayName,
          bio: profile.bio ?? ''
        });
        this.profileImageUrl.set(profile.profileImageUrl);
        this.displayName.set(profile.displayName);
      }
    });
  }

  close(): void {
    this.isClosing.set(true);
    setTimeout(() => {
      this.isOpen.set(false);
      this.isClosing.set(false);
    }, 200);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  toggleTheme(): void {
    this.isDarkMode.update(v => !v);
    this.applyTheme(this.isDarkMode());
    localStorage.setItem('sard_theme', this.isDarkMode() ? 'dark' : 'light');
  }

  private applyTheme(dark: boolean): void {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }

  onImageError(): void {
    this.imageLoadError.set(true);
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.imageLoadError.set(false);
    this.profileService.updateProfileImage(file).subscribe({
      next: res => this.profileImageUrl.set(res.imageUrl),
      error: () => this.errorMessage.set('حدث خطأ في رفع الصورة')
    });
  }

  saveProfile(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.isSaved.set(false);
    this.errorMessage.set('');

    this.profileService.updateProfile({
      displayName: this.form.value.displayName!,
      bio: this.form.value.bio ?? null
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSaved.set(true);
        this.displayName.set(this.form.value.displayName!);
        setTimeout(() => this.isSaved.set(false), 3000);
      },
      error: () => {
        this.errorMessage.set('حدث خطأ في الحفظ');
        this.isLoading.set(false);
      }
    });
  }
}