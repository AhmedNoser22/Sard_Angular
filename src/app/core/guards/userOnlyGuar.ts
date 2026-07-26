import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/tokenService';
import { jwtDecode } from 'jwt-decode';

export const userOnlyGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const token = tokenService.getToken();

  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }

  try {
    const decoded: any = jwtDecode(token);
    const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (role === 'Admin') {
      router.navigate(['/admin']);
      return false;
    }

    return true;
  } catch {
    router.navigate(['/auth/login']);
    return false;
  }
};