import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
export const roleGuard = (roles: string[]): CanActivateFn => {
  const allowedRoles = [...roles];
  if (allowedRoles.includes('STUDENT') && !allowedRoles.includes('USER')) {
    allowedRoles.push('USER');
  }
  return () => {
    const router = inject(Router);
    const user = JSON.parse(localStorage.getItem('vt_user') || '{}');
    if (!allowedRoles.includes(user.role)) {
      router.navigate(['/']);
      return false;
    }
    return true;
  };
};