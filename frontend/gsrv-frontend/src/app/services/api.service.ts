import { Injectable } from '@angular/core';
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

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
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
export class ApiService {
  private apiBase = 'http://localhost:8082';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second
  private cache = new Map<string, CacheEntry<any>>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes
  private pendingRequests = new Map<string, Observable<any>>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(true);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeConnectionMonitoring();
  }

  private initializeConnectionMonitoring(): void {
    // Monitor connection status
    timer(0, 30000).pipe(
      switchMap(() => this.testConnection().pipe(
        map(() => true),
        catchError(() => of(false))
      ))
    ).subscribe(status => {
      this.connectionStatusSubject.next(status);
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private getCacheKey(endpoint: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}${paramString}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < entry.ttl) {
      return entry.data;
    }
    if (entry) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.cacheTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inattendue s\'est produite';

    if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
          this.connectionStatusSubject.next(false);
          break;
        case 400:
          errorMessage = 'Données invalides';
          break;
        case 401:
          errorMessage = 'Non autorisé - Veuillez vous reconnecter';
          this.logout();
          break;
        case 403:
          errorMessage = 'Accès interdit';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 409:
          errorMessage = 'Conflit - La ressource existe déjà';
          break;
        case 422:
          errorMessage = 'Données de validation incorrectes';
          break;
        case 429:
          errorMessage = 'Trop de requêtes - Veuillez patienter';
          break;
        case 500:
          errorMessage = 'Erreur serveur interne';
          break;
        case 503:
          errorMessage = 'Service temporairement indisponible';
          break;
        default:
          errorMessage = `Erreur serveur: ${error.status} - ${error.message}`;
      }
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  private setLoading(loading: boolean): void {
    // Loading disabled - no longer setting loading state
    // this.loadingSubject.next(loading);
  }

  // Retry logic for failed requests with exponential backoff
  private retryStrategy<T>() {
    return retryWhen<T>(errors =>
      errors.pipe(
        delayWhen((_, index) => timer(Math.min(1000 * Math.pow(2, index), 10000))),
        retry(this.retryAttempts)
      )
    );
  }

  // Request deduplication
  private deduplicateRequest<T>(key: string, request: Observable<T>): Observable<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const sharedRequest = request.pipe(
      shareReplay(1),
      tap(() => this.pendingRequests.delete(key))
    );

    this.pendingRequests.set(key, sharedRequest);
    return sharedRequest;
  }

  // Auth methods
  login(payload: LoginRequest): Observable<LoginResponse> {
    this.setLoading(true);
    const request = this.http.post<LoginResponse>(`${this.apiBase}/auth/login`, payload).pipe(
      timeout(10000), // 10 second timeout
      tap(res => {
        if (res?.token && typeof localStorage !== 'undefined') {
          localStorage.setItem('auth_token', res.token);
          localStorage.setItem('auth_user', JSON.stringify({
            username: res.username,
            role: res.role,
            userId: res.userId
          }));
          this.clearCache(); // Clear cache on login
        }
        this.setLoading(false);
      }),
      catchError(error => {
        console.error('Login error:', error);
        this.setLoading(false);
        return this.handleError(error);
      })
    );

    return this.deduplicateRequest('login', request);
  }

  register(payload: RegisterRequest): Observable<ApiResponse<any>> {
    this.setLoading(true);
    return this.http.post<ApiResponse<any>>(`${this.apiBase}/users`, payload).pipe(
      timeout(15000),
      tap(() => {
        this.setLoading(false);
        this.clearCache('users');
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    this.clearCache();
    this.pendingRequests.clear();
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic token validation (you might want to add JWT expiration check)
      return token.length > 10;
    } catch {
      return false;
    }
  }

  // Health check methods with retry logic
  testConnection(): Observable<any> {
    return this.http.get(`${this.apiBase}/health`).pipe(
      timeout(5000),
      catchError(error => {
        console.warn('Connection test failed:', error);
        return of({ status: 'DOWN' });
      })
    );
  }

  testHealth(): Observable<any> {
    return this.http.get(`${this.apiBase}/health/simple`).pipe(
      timeout(5000),
      catchError(error => {
        console.warn('Health test failed:', error);
        return of({ status: 'DOWN' });
      })
    );
  }

  getData(): Observable<any> {
    const cacheKey = this.getCacheKey('data');
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return of(cached);
    }

    this.setLoading(true);
    const request = this.http.get(`${this.apiBase}/api/data`, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      this.retryStrategy<any>(),
      tap(data => {
        this.setCache(cacheKey, data, 2 * 60 * 1000); // 2 minutes cache
        this.setLoading(false);
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );

    return this.deduplicateRequest(cacheKey, request);
  }

  getStock(): Observable<any> {
    const cacheKey = this.getCacheKey('stock');
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return of(cached);
    }

    this.setLoading(true);
    const request = this.http.get(`${this.apiBase}/api/stock`, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      this.retryStrategy<any>(),
      tap(data => {
        this.setCache(cacheKey, data, 5 * 60 * 1000); // 5 minutes cache
        this.setLoading(false);
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );

    return this.deduplicateRequest(cacheKey, request);
  }

  getClaims(): Observable<any> {
    const cacheKey = this.getCacheKey('claims');
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return of(cached);
    }

    this.setLoading(true);
    const request = this.http.get(`${this.apiBase}/api/claims`, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      this.retryStrategy<any>(),
      tap(data => {
        this.setCache(cacheKey, data, 3 * 60 * 1000); // 3 minutes cache
        this.setLoading(false);
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );

    return this.deduplicateRequest(cacheKey, request);
  }

  // Product methods with caching
  listProducts(): Observable<ProductPayload[]> {
    const cacheKey = this.getCacheKey('products');
    const cached = this.getFromCache<ProductPayload[]>(cacheKey);

    if (cached) {
      return of(cached);
    }

    this.setLoading(true);
    const request = this.http.get<ProductPayload[]>(`${this.apiBase}/products`, { headers: this.getHeaders() }).pipe(
      timeout(15000),
      this.retryStrategy<ProductPayload[]>(),
      tap(data => {
        this.setCache(cacheKey, data, 10 * 60 * 1000); // 10 minutes cache
        this.setLoading(false);
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );

    return this.deduplicateRequest(cacheKey, request);
  }

  getProduct(id: number): Observable<ProductPayload> {
    const cacheKey = this.getCacheKey(`product-${id}`);
    const cached = this.getFromCache<ProductPayload>(cacheKey);

    if (cached) {
      return of(cached);
    }

    this.setLoading(true);
    const request = this.http.get<ProductPayload>(`${this.apiBase}/products/${id}`, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      this.retryStrategy<ProductPayload>(),
      tap(data => {
        this.setCache(cacheKey, data, 15 * 60 * 1000); // 15 minutes cache
        this.setLoading(false);
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );

    return this.deduplicateRequest(cacheKey, request);
  }

  createProduct(payload: ProductPayload): Observable<ApiResponse<ProductPayload>> {
    this.setLoading(true);
    return this.http.post<ApiResponse<ProductPayload>>(`${this.apiBase}/products`, payload, { headers: this.getHeaders() }).pipe(
      timeout(15000),
      this.retryStrategy<ApiResponse<ProductPayload>>(),
      tap(() => {
        this.setLoading(false);
        this.clearCache('products'); // Clear product cache
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  updateProduct(id: number, payload: ProductPayload): Observable<ApiResponse<ProductPayload>> {
    this.setLoading(true);
    return this.http.put<ApiResponse<ProductPayload>>(`${this.apiBase}/products/${id}`, payload, { headers: this.getHeaders() }).pipe(
      timeout(15000),
      this.retryStrategy<ApiResponse<ProductPayload>>(),
      tap(() => {
        this.setLoading(false);
        this.clearCache('products'); // Clear product cache
        this.cache.delete(`product-${id}`); // Clear specific product cache
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  deleteProduct(id: number): Observable<ApiResponse<void>> {
    this.setLoading(true);
    return this.http.delete<ApiResponse<void>>(`${this.apiBase}/products/${id}`, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      this.retryStrategy<ApiResponse<void>>(),
      tap(() => {
        this.setLoading(false);
        this.clearCache('products'); // Clear product cache
        this.cache.delete(`product-${id}`); // Clear specific product cache
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  // Reclamation methods with caching
  listReclamations(): Observable<any[]> {
    const cacheKey = this.getCacheKey('reclamations');
    const cached = this.getFromCache<any[]>(cacheKey);

    if (cached) {
      return of(cached);
    }

    this.setLoading(true);
    const request = this.http.get<any[]>(`${this.apiBase}/reclamations`, { headers: this.getHeaders() }).pipe(
      timeout(15000),
      this.retryStrategy<any[]>(),
      tap(data => {
        this.setCache(cacheKey, data, 5 * 60 * 1000); // 5 minutes cache
        this.setLoading(false);
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );

    return this.deduplicateRequest(cacheKey, request);
  }

  createReclamation(payload: ReclamationPayload): Observable<ApiResponse<any>> {
    this.setLoading(true);

    // Convert to backend DTO format
    const backendDto: ReclamationCreateDto = {
      titre: payload.titre,
      productId: payload.productId,
      userId: payload.userId,
      reason: payload.reason,
      observedQuantity: payload.observedQuantity
    };

    return this.http.post<ApiResponse<any>>(`${this.apiBase}/reclamations`, backendDto, { headers: this.getHeaders() }).pipe(
      timeout(15000),
      this.retryStrategy<ApiResponse<any>>(),
      tap(() => {
        this.setLoading(false);
        this.clearCache('reclamations'); // Clear reclamation cache
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  updateReclamationStatus(id: number, status: 'OUVERTE' | 'EN_COURS' | 'TRAITEE' | 'REJETEE'): Observable<ApiResponse<any>> {
    this.setLoading(true);
    return this.http.patch<ApiResponse<any>>(`${this.apiBase}/reclamations/${id}/status`, null, {
      headers: this.getHeaders(),
      params: { status }
    }).pipe(
      timeout(10000),
      this.retryStrategy<ApiResponse<any>>(),
      tap(() => {
        this.setLoading(false);
        this.clearCache('reclamations'); // Clear reclamation cache
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  deleteReclamation(id: number): Observable<ApiResponse<void>> {
    this.setLoading(true);
    return this.http.delete<ApiResponse<void>>(`${this.apiBase}/reclamations/${id}`, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      this.retryStrategy<ApiResponse<void>>(),
      tap(() => {
        this.setLoading(false);
        this.clearCache('reclamations'); // Clear reclamation cache
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  // User methods with caching
  listUsers(): Observable<any[]> {
    const cacheKey = this.getCacheKey('users');
    const cached = this.getFromCache<any[]>(cacheKey);

    if (cached) {
      return of(cached);
    }

    this.setLoading(true);
    const request = this.http.get<any[]>(`${this.apiBase}/users`, { headers: this.getHeaders() }).pipe(
      timeout(15000),
      this.retryStrategy<any[]>(),
      tap(data => {
        this.setCache(cacheKey, data, 15 * 60 * 1000); // 15 minutes cache
        this.setLoading(false);
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );

    return this.deduplicateRequest(cacheKey, request);
  }

  createUser(payload: RegisterRequest): Observable<ApiResponse<any>> {
    this.setLoading(true);
    return this.http.post<ApiResponse<any>>(`${this.apiBase}/users`, payload, { headers: this.getHeaders() }).pipe(
      timeout(15000),
      this.retryStrategy<ApiResponse<any>>(),
      tap(() => {
        this.setLoading(false);
        this.clearCache('users'); // Clear user cache
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  updateUser(id: number, payload: Partial<RegisterRequest>): Observable<ApiResponse<any>> {
    this.setLoading(true);
    return this.http.put<ApiResponse<any>>(`${this.apiBase}/users/${id}`, payload, { headers: this.getHeaders() }).pipe(
      timeout(15000),
      this.retryStrategy<ApiResponse<any>>(),
      tap(() => {
        this.setLoading(false);
        this.clearCache('users'); // Clear user cache
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  deleteUser(id: number): Observable<ApiResponse<void>> {
    this.setLoading(true);
    return this.http.delete<ApiResponse<void>>(`${this.apiBase}/users/${id}`, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      this.retryStrategy<ApiResponse<void>>(),
      tap(() => {
        this.setLoading(false);
        this.clearCache('users'); // Clear user cache
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  toggleUserStatus(id: number): Observable<ApiResponse<any>> {
    this.setLoading(true);
    return this.http.patch<ApiResponse<any>>(`${this.apiBase}/users/${id}/toggle-status`, {}, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      this.retryStrategy<ApiResponse<any>>(),
      tap(() => {
        this.setLoading(false);
        this.clearCache('users'); // Clear user cache
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  resetUserPassword(id: number, newPassword: string): Observable<ApiResponse<any>> {
    this.setLoading(true);
    return this.http.patch<ApiResponse<any>>(`${this.apiBase}/users/${id}/reset-password`, { newPassword }, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      this.retryStrategy<ApiResponse<any>>(),
      tap(() => {
        this.setLoading(false);
        this.clearCache('users'); // Clear user cache
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  // Dashboard methods with caching
  getDashboardData(): Observable<any> {
    const cacheKey = this.getCacheKey('dashboard');
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return of(cached);
    }

    this.setLoading(true);
    const request = this.http.get<any>(`${this.apiBase}/dashboard`, { headers: this.getHeaders() }).pipe(
      timeout(10000),
      this.retryStrategy<any>(),
      tap(data => {
        this.setCache(cacheKey, data, 2 * 60 * 1000); // 2 minutes cache
        this.setLoading(false);
      }),
      catchError(error => {
        console.error('Dashboard endpoint error:', error);
        this.setLoading(false);
        // Return default dashboard data if endpoint fails
        return of({
          totalUsers: 1,
          totalProducts: 1,
          totalReclamations: 0,
          lowStockCount: 0,
          recentActivity: [],
          systemStatus: 'OK'
        });
      })
    );

    return this.deduplicateRequest(cacheKey, request);
  }

  // Analytics methods with caching
  getAnalytics(): Observable<any> {
    const cacheKey = this.getCacheKey('analytics');
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return of(cached);
    }

    this.setLoading(true);
    const request = this.http.get<any>(`${this.apiBase}/analytics`, { headers: this.getHeaders() }).pipe(
      timeout(20000),
      this.retryStrategy<any>(),
      tap(data => {
        this.setCache(cacheKey, data, 30 * 60 * 1000); // 30 minutes cache
        this.setLoading(false);
      }),
      catchError(error => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );

    return this.deduplicateRequest(cacheKey, request);
  }

  getStockAnalytics(): Observable<any> {
    const cacheKey = this.getCacheKey('analytics-stock');
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<any>(`${this.apiBase}/analytics/stock`, { headers: this.getHeaders() }).pipe(
      tap(data => this.setCache(cacheKey, data, 30 * 60 * 1000))
    );
  }

  getReclamationAnalytics(): Observable<any> {
    const cacheKey = this.getCacheKey('analytics-reclamations');
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<any>(`${this.apiBase}/analytics/reclamations`, { headers: this.getHeaders() }).pipe(
      tap(data => this.setCache(cacheKey, data, 30 * 60 * 1000))
    );
  }

  getUserAnalytics(): Observable<any> {
    const cacheKey = this.getCacheKey('analytics-users');
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<any>(`${this.apiBase}/analytics/users`, { headers: this.getHeaders() }).pipe(
      tap(data => this.setCache(cacheKey, data, 30 * 60 * 1000))
    );
  }

  getPerformanceAnalytics(): Observable<any> {
    const cacheKey = this.getCacheKey('analytics-performance');
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<any>(`${this.apiBase}/analytics/performance`, { headers: this.getHeaders() }).pipe(
      tap(data => this.setCache(cacheKey, data, 30 * 60 * 1000))
    );
  }

  generateReport(reportType: string, filters: any = {}): Observable<any> {
    console.log('🚀 API Service - generateReport called with:', { reportType, filters });
    console.log('🚀 API Service - Full URL:', `${this.apiBase}/reports/type/${reportType}/generate`);
    console.log('🚀 API Service - Headers:', this.getHeaders());

    return this.http.post<any>(`${this.apiBase}/reports/type/${reportType}/generate`, filters, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('✅ API Service - Response received:', response)),
        timeout(30000), // 30 second timeout
        catchError(error => {
          console.error('❌ API Service - Error occurred:', error);
          if (error.name === 'TimeoutError') {
            return throwError(() => new Error('La génération du rapport a pris trop de temps. Veuillez réessayer.'));
          }
          return throwError(() => error);
        })
      );
  }

  // Report methods
  getAllReports(): Observable<any> {
    const cacheKey = this.getCacheKey('reports');
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<any>(`${this.apiBase}/reports`, { headers: this.getHeaders() }).pipe(
      tap(data => this.setCache(cacheKey, data, 10 * 60 * 1000))
    );
  }

  getReport(reportType: string, filters: any = {}): Observable<any> {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key].toString());
      }
    });

    return this.http.get<any>(`${this.apiBase}/reports/${reportType}?${params.toString()}`, { headers: this.getHeaders() });
  }

  downloadReportAsPDF(reportType: string, filters: any = {}): Observable<Blob> {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key].toString());
      }
    });

    return this.http.get(`${this.apiBase}/reports/${reportType}/download/pdf?${params.toString()}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  downloadReportAsExcel(reportType: string, filters: any = {}): Observable<Blob> {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key].toString());
      }
    });

    return this.http.get(`${this.apiBase}/reports/${reportType}/download/excel?${params.toString()}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  downloadReportAsCSV(reportType: string, filters: any = {}): Observable<Blob> {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key].toString());
      }
    });

    return this.http.get(`${this.apiBase}/reports/${reportType}/download/csv?${params.toString()}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  downloadReport(reportType: string, format: string, filters: any = {}): Observable<Blob> {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key].toString());
      }
    });

    return this.http.get(`${this.apiBase}/reports/${reportType}/download/${format}?${params.toString()}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  deleteReport(reportId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiBase}/reports/${reportId}`, { headers: this.getHeaders() }).pipe(
      tap(() => this.clearCache('reports'))
    );
  }

  // Utility methods
  getCurrentUser(): any {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isAgent(): boolean {
    return this.hasRole('AGENT');
  }

  isVeterinaire(): boolean {
    return this.hasRole('AGENT'); // Redirect veterinarian functionality to agent
  }

  // Cache management methods
  clearAllCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Connection status methods
  isConnected(): boolean {
    return this.connectionStatusSubject.value;
  }


}