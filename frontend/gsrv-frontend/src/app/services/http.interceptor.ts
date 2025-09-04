import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const httpInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);

  // Clone the request and add headers
  const modifiedRequest = addHeaders(request);

  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - redirect to login
        handleUnauthorized(router);
      } else if (error.status === 403) {
        // Forbidden - show access denied
        handleForbidden();
      } else if (error.status >= 500) {
        // Server errors - show maintenance message
        handleServerError();
      }

      return throwError(() => error);
    })
  );
};

function addHeaders(request: any): any {
  // Get token from localStorage (only in browser environment)
  let token = null;
  if (typeof localStorage !== 'undefined') {
    token = localStorage.getItem('auth_token');
  }

  let headers = request.headers;

  // Add content type if not present
  if (!headers.has('Content-Type')) {
    headers = headers.set('Content-Type', 'application/json');
  }

  // Add authorization header if token exists
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  // Add custom headers
  headers = headers.set('X-Requested-With', 'XMLHttpRequest');

  return request.clone({ headers });
}

function handleUnauthorized(router: Router): void {
  // Clear invalid token (only in browser environment)
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  // Redirect to login page
  router.navigate(['/login']);

  // Show message
  console.log('WARNING: Session expirée. Veuillez vous reconnecter.');
}

function handleForbidden(): void {
  console.log('ERROR: Accès interdit. Vous n\'avez pas les permissions nécessaires.');
}

function handleServerError(): void {
  console.log('ERROR: Erreur serveur. Veuillez réessayer plus tard.');
}

// Removed showLoading and hideLoading functions since they were causing issues
// Loading state is now handled by individual components


