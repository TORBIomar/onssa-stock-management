import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return true; // Skip checks on SSR
  }
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return router.createUrlTree(['/login']);
  }
  return true;
};

export function roleRedirect(): UrlTree | boolean {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return true; // Do nothing on SSR; client will handle redirect
  }
  const userRaw = localStorage.getItem('auth_user');
  if (!userRaw) return router.createUrlTree(['/login']);
  try {
    const user = JSON.parse(userRaw) as { role: 'ADMIN' | 'AGENT' | 'VETERINAIRE' };
    if (user.role === 'ADMIN') return router.createUrlTree(['/dashboard/admin']);
    if (user.role === 'AGENT') return router.createUrlTree(['/dashboard/agent']);
    if (user.role === 'VETERINAIRE') return router.createUrlTree(['/dashboard/veterinaire']);
    return router.createUrlTree(['/dashboard']);
  } catch {
    return router.createUrlTree(['/login']);
  }
}


