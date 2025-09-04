import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, timer, of, Subject } from 'rxjs';
import { tap, catchError, retry, timeout, retryWhen, delayWhen, shareReplay, debounceTime, distinctUntilChanged, switchMap, map, filter } from 'rxjs/operators';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: 'ADMIN' | 'AGENT' | 'VETERINAIRE';
  userId: number;
  message: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  role: 'ADMIN' | 'AGENT' | 'VETERINAIRE';
}

export interface ProductPayload {
  id?: number;
  name: string;
  category: 'VACCIN' | 'MEDICAMENT_VETERINAIRE' | 'ALIMENT_ANIMAL' | 'IMPORT_EXPORT';
  quantity: number;
  minimumThreshold: number;
  expiryDate?: string;
}

export interface ReclamationPayload {
  id?: number;
  productId: number;
  userId: number;
  titre: string;
  reason: string;
  observedQuantity: number;
  status?: string;
  product?: any;
  product_id?: number;
  createdBy?: any;
  created_by_user_id?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Backend DTO interface to match exactly what the backend expects
export interface ReclamationCreateDto {
  titre: string;
  productId: number;
  userId: number;
  reason: string;
  observedQuantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'AGENT';
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateDto {
  username: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'AGENT';
}

@Injectable({
  providedIn: 'root'
})
export class ApiService implements OnDestroy {
  private apiBase = 'http://localhost:8082';
  private retryAttempts = 2; // Reduced retry attempts
  private retryDelay = 1000; // 1 second
  private pendingRequests = new Map<string, Observable<any>>();
  private destroy$ = new Subject<void>();

  // Getter method for API base URL
  getApiBase(): string {
    return this.apiBase;
  }

  // Getter method for headers (for debugging)
  getHeadersForDebug(): HttpHeaders {
    return this.getHeaders();
  }

  constructor(private http: HttpClient) {
    // Auto-cleanup on destroy
    this.destroy$.subscribe(() => {
      this.pendingRequests.clear();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.pendingRequests.clear();
  }

  private getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        console.log('Using auth token for request');
        return headers.set('Authorization', `Bearer ${token}`);
      } else {
        console.warn('No auth token found in localStorage');
      }
    }

    console.log('Returning headers without auth token');
    return headers;
  }



  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);

    let errorMessage = 'Une erreur inattendue s\'est produite';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        // Clear invalid token
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      } else if (error.status === 403) {
        errorMessage = 'Accès non autorisé. Vérifiez vos permissions.';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée.';
      } else if (error.status === 409) {
        // Conflict - usually foreign key constraint
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = 'Cette ressource ne peut pas être supprimée car elle est utilisée ailleurs.';
        }
      } else if (error.status === 0) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
      } else if (error.status >= 500) {
        // Try to get the actual error message from the server response
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        }
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    return throwError(() => ({ message: errorMessage, status: error.status }));
  }

  private retryStrategy<T>() {
    return retryWhen<T>(errors =>
      errors.pipe(
        switchMap((error, index) => {
          if (index < this.retryAttempts) {
            return timer(this.retryDelay * (index + 1));
          }
          return throwError(() => error);
        })
      )
    );
  }

  private deduplicateRequest<T>(key: string, request: Observable<T>): Observable<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)! as Observable<T>;
    }

    const sharedRequest = request.pipe(
      shareReplay(1),
      tap(() => this.pendingRequests.delete(key)),
      catchError(error => {
        this.pendingRequests.delete(key);
        return throwError(() => error);
      })
    );

    this.pendingRequests.set(key, sharedRequest);
    return sharedRequest;
  }

  private getCacheKey(endpoint: string): string {
    return `cache_${endpoint}`;
  }

  // Test products endpoint specifically
  testProductsEndpoint(): Observable<any> {
    return this.http.get(`${this.apiBase}/products/test`, { headers: this.getHeaders() }).pipe(
      timeout(5000),
      catchError(error => {
        console.error('Products endpoint test failed:', error);
        return throwError(() => error);
      })
    );
  }

  // Health check method
  testBackendHealth(): Observable<any> {
    return this.http.get(`${this.apiBase}/health/simple`, { headers: this.getHeaders() }).pipe(
      timeout(5000),
      catchError(error => {
        console.error('Health check failed:', error);
        return throwError(() => error);
      })
    );
  }

  // Optimized product methods without caching
  listProducts(): Observable<ProductPayload[]> {
    return this.http.get<ProductPayload[]>(`${this.apiBase}/products`, { headers: this.getHeaders() }).pipe(
      timeout(8000), // Reduced timeout
      this.retryStrategy<ProductPayload[]>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  getProduct(id: number): Observable<ProductPayload> {
    return this.http.get<ProductPayload>(`${this.apiBase}/products/${id}`, { headers: this.getHeaders() }).pipe(
      timeout(5000),
      this.retryStrategy<ProductPayload>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  createProduct(payload: ProductPayload): Observable<ApiResponse<ProductPayload>> {
    return this.http.post<ApiResponse<ProductPayload>>(`${this.apiBase}/products`, payload, { headers: this.getHeaders() }).pipe(
      timeout(10000), // Increased timeout for creation
      this.retryStrategy<ApiResponse<ProductPayload>>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  updateProduct(id: number, payload: ProductPayload): Observable<ApiResponse<ProductPayload>> {
    return this.http.put<ApiResponse<ProductPayload>>(`${this.apiBase}/products/${id}`, payload, { headers: this.getHeaders() }).pipe(
      timeout(10000), // Increased timeout for updates
      this.retryStrategy<ApiResponse<ProductPayload>>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  deleteProduct(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiBase}/products/${id}`, { headers: this.getHeaders() }).pipe(
      timeout(8000),
      this.retryStrategy<ApiResponse<void>>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  // Optimized reclamation methods
  listReclamations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}/reclamations`, { headers: this.getHeaders() }).pipe(
      timeout(8000),
      this.retryStrategy<any[]>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  createReclamation(payload: ReclamationPayload): Observable<ApiResponse<any>> {
    // Convert to backend DTO format
    const backendDto: ReclamationCreateDto = {
      titre: payload.titre,
      productId: payload.productId,
      userId: payload.userId,
      reason: payload.reason,
      observedQuantity: payload.observedQuantity
    };

    return this.http.post<ApiResponse<any>>(`${this.apiBase}/reclamations`, backendDto, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      this.retryStrategy<ApiResponse<any>>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  updateReclamationStatus(id: number, status: 'OUVERTE' | 'EN_COURS' | 'TRAITEE' | 'REJETEE'): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiBase}/reclamations/${id}/status`, null, {
      headers: this.getHeaders(),
      params: { status }
    }).pipe(
      timeout(8000),
      this.retryStrategy<ApiResponse<any>>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  deleteReclamation(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiBase}/reclamations/${id}`, { headers: this.getHeaders() }).pipe(
      timeout(8000),
      this.retryStrategy<ApiResponse<void>>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  // Optimized user methods
  listUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}/users`, { headers: this.getHeaders() }).pipe(
      timeout(8000),
      this.retryStrategy<any[]>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  createUser(payload: UserCreateDto): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiBase}/users`, payload, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      this.retryStrategy<ApiResponse<User>>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  updateUser(id: number, payload: Partial<UserCreateDto>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiBase}/users/${id}`, payload, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      this.retryStrategy<ApiResponse<User>>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  deleteUser(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiBase}/users/${id}`, { headers: this.getHeaders() }).pipe(
      timeout(8000),
      this.retryStrategy<ApiResponse<void>>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  // Authentication methods
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiBase}/auth/login`, credentials).pipe(
      timeout(8000),
      this.retryStrategy<LoginResponse>(),
      tap(response => {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('auth_user', JSON.stringify({
            username: response.username,
            role: response.role,
            userId: response.userId
          }));
        }
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  register(userData: RegisterRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiBase}/auth/register`, userData).pipe(
      timeout(10000),
      this.retryStrategy<ApiResponse<any>>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!localStorage.getItem('auth_token');
    }
    return false;
  }

  getCurrentUser(): any {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('auth_user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  // Dashboard data method
  getData(): Observable<any> {
    return this.http.get<any>(`${this.apiBase}/dashboard`, { headers: this.getHeaders() }).pipe(
      timeout(8000),
      this.retryStrategy<any>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  // Analytics data method
  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiBase}/analytics`, { headers: this.getHeaders() }).pipe(
      timeout(8000),
      this.retryStrategy<any>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  // Report generation method
  generateReport(type: string, params?: any): Observable<any> {
    const url = `${this.apiBase}/reports/type/${type}/generate`;
    const options: any = { headers: this.getHeaders() };

    if (params) {
      options.body = params; // Use body for POST request
    }

    return this.http.post<any>(url, params || {}, options).pipe(
      timeout(15000), // Longer timeout for reports
      this.retryStrategy<any>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  // Task management methods
  listTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}/tasks`, { headers: this.getHeaders() }).pipe(
      timeout(8000),
      this.retryStrategy<any[]>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  createTask(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiBase}/tasks`, payload, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      this.retryStrategy<ApiResponse<any>>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  updateTask(id: number, payload: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiBase}/tasks/${id}`, payload, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      this.retryStrategy<ApiResponse<any>>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  deleteTask(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiBase}/tasks/${id}`, { headers: this.getHeaders() }).pipe(
      timeout(8000),
      this.retryStrategy<ApiResponse<void>>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  // Report management methods
  getAllReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}/reports`, { headers: this.getHeaders() }).pipe(
      timeout(8000),
      this.retryStrategy<any[]>(),
      catchError(error => {
        // Log error but don't clutter console with Hibernate proxy errors
        if (error.status === 500 && error.message?.includes('ByteBuddyInterceptor')) {
          console.warn('Reports service temporarily unavailable');
        } else {
          console.error('Error fetching reports:', error);
        }
        return this.handleError(error);
      })
    );
  }

  deleteReport(reportId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiBase}/reports/${reportId}`, { headers: this.getHeaders() }).pipe(
      timeout(8000),
      this.retryStrategy<ApiResponse<void>>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  downloadReport(type: string, format: string, params?: any): Observable<Blob> {
    const url = `${this.apiBase}/reports/${type}/download/${format}`;
    const options: any = {
      headers: this.getHeaders(),
      responseType: 'blob'
    };

    if (params) {
      options.params = new HttpParams({ fromObject: params });
    }

    return this.http.get(url, options).pipe(
      timeout(15000),
      catchError(error => {
        return this.handleError(error);
      })
    ) as unknown as Observable<Blob>;
  }

  // Backend status methods
  testConnection(): Observable<any> {
    return this.http.get<any>(`${this.apiBase}/health`, { headers: this.getHeaders() }).pipe(
      timeout(5000),
      this.retryStrategy<any>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  getStock(): Observable<any> {
    return this.http.get<any>(`${this.apiBase}/products/stock`, { headers: this.getHeaders() }).pipe(
      timeout(8000),
      this.retryStrategy<any>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  getClaims(): Observable<any> {
    return this.http.get<any>(`${this.apiBase}/reclamations/summary`, { headers: this.getHeaders() }).pipe(
      timeout(8000),
      this.retryStrategy<any>(),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  // Dashboard data method (alias for getData)
  getDashboardData(): Observable<any> {
    return this.getData();
  }
}