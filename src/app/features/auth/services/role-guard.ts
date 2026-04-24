import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const roleGuard = (roles: string[]): CanActivateFn => {
  return () => {
    const router = inject(Router);

    const user = JSON.parse(localStorage.getItem('vt_user') || '{}');

    if (!roles.includes(user.role)) {
      router.navigate(['/']);
      return false;
    }

    return true;
  };
};