import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-section">
            <div class="logo-icon">
              <i class="bi bi-shield-check"></i>
            </div>
            <h1 class="logo-text">GSRV System</h1>
          </div>
          <h2 class="welcome-text">Heureux de vous revoir</h2>
          <p class="subtitle">Connectez-vous à votre compte</p>
        </div>
        
        <div class="alert alert-success" *ngIf="successMessage">
          <i class="bi bi-check-circle me-2"></i>{{ successMessage }}
        </div>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label class="form-label">Nom d'utilisateur</label>
            <div class="input-wrapper">
              <i class="bi bi-person input-icon"></i>
              <input 
                class="form-input" 
                formControlName="username" 
                type="text" 
                placeholder="Entrez votre nom d'utilisateur" 
              />
            </div>
            <div class="error-message" *ngIf="form.get('username')?.touched && form.get('username')?.invalid">
              Le nom d'utilisateur est requis
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <div class="input-wrapper">
              <i class="bi bi-lock input-icon"></i>
              <input 
                class="form-input" 
                formControlName="password" 
                type="password" 
                placeholder="Entrez votre mot de passe" 
              />
            </div>
            <div class="error-message" *ngIf="form.get('password')?.touched && form.get('password')?.invalid">
              Le mot de passe est requis
            </div>
          </div>

          <button class="login-btn" type="submit" [disabled]="form.invalid || loading">
            <span *ngIf="!loading">
              <i class="bi bi-box-arrow-in-right me-2"></i>Se connecter
            </span>
            <span *ngIf="loading" class="loading-spinner">
              <i class="bi bi-arrow-clockwise"></i>
            </span>
          </button>

          <div class="text-center mt-4">
            <p class="mb-0">
              Pas encore de compte ? 
              <a routerLink="/register" class="text-decoration-none">S'enregistrer</a>
            </p>
            <small class="text-muted d-block mt-2">
              <i class="bi bi-info-circle me-1"></i>
              L'enregistrement est réservé aux agents ONSSA autorisés
            </small>
          </div>

          <div class="alert alert-error" *ngIf="error">
            <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    /* Modern Login Theme - Matching Dashboard */
    :root {
      --primary-blue: #3b82f6;
      --primary-dark: #1e293b;
      --primary-light: #f8fafc;
      --accent-blue: #3b82f6;
      --accent-green: #10b981;
      --accent-red: #ef4444;
      --text-primary: #1e293b;
      --text-secondary: #475569;
      --text-muted: #64748b;
      --border-light: #e2e8f0;
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    }
    
    .login-container {
      min-height: 100vh;
      background: linear-gradient(135deg, var(--primary-light) 0%, #e2e8f0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .login-card {
      background: white;
      border-radius: 1.5rem;
      box-shadow: var(--shadow-lg);
      padding: 3rem;
      width: 100%;
      max-width: 450px;
      border: 1px solid var(--border-light);
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    
    .logo-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, var(--accent-blue), #8b5cf6);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }
    
    .logo-text {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }
    
    .welcome-text {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      color: var(--text-secondary);
      font-size: 1rem;
      margin: 0;
    }
    
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .form-label {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.95rem;
    }
    
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .input-icon {
      position: absolute;
      left: 1rem;
      color: var(--text-muted);
      font-size: 1.1rem;
      z-index: 1;
    }
    
    .form-input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 2.75rem;
      border: 2px solid var(--border-light);
      border-radius: 0.75rem;
      font-size: 1rem;
      transition: all 0.2s ease;
      background: white;
      color: var(--text-primary);
    }
    
    .form-input::placeholder {
      color: var(--text-muted);
    }
    
    .form-input:focus {
      outline: none;
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .error-message {
      color: var(--accent-red);
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .login-btn {
      background: var(--accent-blue);
      color: white;
      border: none;
      border-radius: 0.75rem;
      padding: 1rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    
    .login-btn:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .loading-spinner {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .register-link {
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }
    
    .register-link a {
      color: var(--accent-blue);
      text-decoration: none;
      font-weight: 600;
    }
    
    .register-link a:hover {
      text-decoration: underline;
    }
    
    .alert {
      padding: 1rem;
      border-radius: 0.75rem;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .alert-success {
      background: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
    }
    
    .alert-error {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .login-container {
        padding: 1rem;
      }
      
      .login-card {
        padding: 2rem;
      }
      
      .logo-text {
        font-size: 1.5rem;
      }
      
      .welcome-text {
        font-size: 1.25rem;
      }
    }
  `]
})
export class LoginComponent {
  loading = false;
  error = '';
  successMessage = '';
  form!: FormGroup;

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router, private route: ActivatedRoute) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    // Show success message if redirected after registration
    this.route.queryParamMap.subscribe(params => {
      if (params.get('registered') === '1') {
        this.successMessage = 'Account created successfully. Please sign in.';
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.api.login(this.form.value as any).subscribe({
      next: (res) => {
        this.loading = false;
        // Redirect to role-specific dashboard based on user role
        if (res.role === 'ADMIN') {
          this.router.navigateByUrl('/dashboard/admin');
        } else if (res.role === 'AGENT') {
          this.router.navigateByUrl('/dashboard/agent');
        } else {
          this.router.navigateByUrl('/dashboard/admin');
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.message || 'Invalid username or password';
      }
    });
  }
}