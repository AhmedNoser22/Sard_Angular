import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { MainLayout } from './layout/main-layout/main-layout';

function homeOrProfile(): string {
  const token = localStorage.getItem('access_token');
  return token ? '/profile' : '/home';
}

export const routes: Routes = [

  { path: '', pathMatch: 'full', redirectTo: homeOrProfile },

  {
    path: 'home',
    loadComponent: () => import('./features/home/home/home-component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', loadComponent: () => import('./features/auth/login-component/login-component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register-component/register-component').then(m => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password-component/forgot-password-component').then(m => m.ForgotPasswordComponent) },
      { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password-component/reset-password-component').then(m => m.ResetPasswordComponent) }
    ]
  },

  { path: 'confirm-email', loadComponent: () => import('./features/auth/confirm-email-component/confirm-email-component').then(m => m.ConfirmEmailComponent) },
  { path: 'auth/verify-reset-code', loadComponent: () => import('./features/auth/verify-reset-code-component/verify-reset-code-component').then(m => m.VerifyResetCodeComponent) },
  { path: 'auth/google-callback', loadComponent: () => import('./features/auth/google-callback-component/google-callback-component').then(m => m.GoogleCallbackComponent) },

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile-component/profile-component').then(m => m.ProfileComponent)
      },
      {
        path: 'highlights',
        loadComponent: () => import('./features/profile/highlights-component/highlights-component')
          .then(m => m.HighlightsComponent)
      },
      {
        path: 'novel',
        loadComponent: () => import('./features/novel/novel-component/novel-component').then(m => m.NovelComponent)
      },
      {
        path: 'novel/:novelId',
        loadComponent: () => import('./features/novel/novel-component/novel-component').then(m => m.NovelComponent)
      },
      {
        path: 'novel/:novelId/chapter/:chapterId',
        loadComponent: () => import('./features/novel/novel-component/novel-component').then(m => m.NovelComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings-component/settings-component').then(m => m.SettingsComponent)
      },
      {
        path: 'nabd',
        loadComponent: () => import('./features/nabd/nabd-page-component/nabd-page-component')
          .then(m => m.NabdPageComponent)
      },
      {
        path: 'profile/:userId',
        canActivate: [authGuard],
        loadComponent: () => import('./features/profile/public-profile-component/public-profile-component')
          .then(m => m.PublicProfileComponent)
      },
      {
        path: 'store',
        loadComponent: () => import('./features/store/store-page-component/store-page-component')
          .then(m => m.StorePageComponent)
      },
      {
        path: 'payment-success',
        loadComponent: () => import('./features/store/payment-success/payment-success')
          .then(m => m.PaymentSuccessComponent)
      },
      {
        path: 'payment-failed',
        loadComponent: () => import('./features/store/payment-failed/payment-failed')
          .then(m => m.PaymentFailedComponent)
      }
    ]
  },

  { path: '**', redirectTo: homeOrProfile }
];