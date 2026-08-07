import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { MainLayout } from './layout/main-layout/main-layout';
import { TokenService } from './core/services/tokenService';
import { adminGuard } from './core/guards/admin.guard';
import { userOnlyGuard } from './core/guards/userOnlyGuar';
import { jwtDecode } from 'jwt-decode';

function homeOrProfile(): string {
  const tokenService = inject(TokenService);

  if (!tokenService.isLoggedIn()) return '/home';

  const token = tokenService.getToken();

  try {
    const decoded: any = jwtDecode(token as string);
    const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (role === 'Admin') return '/admin';
  } catch { }

  return '/profile';
}

export const routes: Routes = [

  { path: '', pathMatch: 'full', redirectTo: homeOrProfile },

  {
    path: 'home',
    loadComponent: () => import('./features/home/home/home-component').then(m => m.HomeComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-layout-component/admin-layout-component')
      .then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/pages/admin-dashboard/admin-dashboard')
          .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'jobs',
        loadComponent: () => import('./features/admin/pages/admin-jobs-component/admin-jobs-component')
          .then(m => m.AdminJobsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/pages/admin-users/admin-users')
          .then(m => m.AdminUsersComponent)
      },
      {
        path: 'users/:userId',
        loadComponent: () => import('./features/admin/pages/admin-user-detail/admin-user-detail')
          .then(m => m.AdminUserDetailComponent)
      },
      {
        path: 'posts',
        loadComponent: () => import('./features/admin/pages/admin-posts/admin-posts')
          .then(m => m.AdminPostsComponent)
      },
      {
        path: 'novels',
        loadComponent: () => import('./features/admin/pages/admin-novels/admin-novels')
          .then(m => m.AdminNovelsComponent)
      },
    ]
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
    canActivate: [authGuard, userOnlyGuard],
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
        path: 'ramaq',
        loadComponent: () => import('./features/ramaq/ramaq-page-component/ramaq-page-component')
          .then(m => m.RamaqPageComponent)
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
      },
      {
        path: 'store/:novelId',
        loadComponent: () => import('./features/store/novel-detail-component/novel-detail-component')
          .then(m => m.NovelDetailComponent)
      },
      {
        path: 'my-novels',
        canActivate: [authGuard],
        loadComponent: () => import('./features/my-novels/my-novels-page-component/my-novels-page-component')
          .then(m => m.MyNovelsPageComponent)
      },
    ]
  },

  { path: '**', redirectTo: homeOrProfile }
];