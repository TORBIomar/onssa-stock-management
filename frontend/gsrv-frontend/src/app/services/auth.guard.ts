import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true; // Do nothing on SSR; client will handle redirect
  }

  const token = localStorage.getItem('auth_token');
  const userRaw = localStorage.getItem('auth_user');

  if (!token || !userRaw) {
    // No token or user data, redirect to login
    return router.createUrlTree(['/login']);
  }

  try {
    const user = JSON.parse(userRaw) as { role: 'ADMIN' | 'AGENT' };

    // If trying to access login page while already authenticated, redirect to appropriate dashboard
    if (state.url === '/login') {
      return roleRedirect();
    }

    // User is authenticated, allow access
    return true;
  } catch {
    // Invalid user data, redirect to login
    return router.createUrlTree(['/login']);
  }
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
    const user = JSON.parse(userRaw) as { role: 'ADMIN' | 'AGENT' };

    // Redirect to role-specific dashboard
    if (user.role === 'ADMIN') return router.createUrlTree(['/admin-dashboard']);
    if (user.role === 'AGENT') return router.createUrlTree(['/agent-dashboard']);

    // Fallback to admin dashboard
    return router.createUrlTree(['/admin-dashboard']);
  } catch {
    return router.createUrlTree(['/login']);
  }
}


