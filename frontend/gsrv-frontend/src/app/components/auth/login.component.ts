import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Login</h2>
        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              [(ngModel)]="credentials.username" 
              required
              class="form-control">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              [(ngModel)]="credentials.password" 
              required
              class="form-control">
          </div>
          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
          <button type="submit" [disabled]="!loginForm.valid || isLoading" class="btn-login">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
        <div class="register-link">
          <p>Don't have an account? <a routerLink="/register">Register here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }
    
    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
    }
    
    .btn-login {
      width: 100%;
      padding: 0.75rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-login:hover:not(:disabled) {
      background: #5a6fd8;
    }
    
    .btn-login:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .error-message {
      color: #e74c3c;
      background: #fdf2f2;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      border: 1px solid #fecaca;
    }
    
    .register-link {
      text-align: center;
      margin-top: 1rem;
    }
    
    .register-link a {
      color: #667eea;
      text-decoration: none;
    }
    
    .register-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };
  
  errorMessage = '';
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  async onLogin() {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await this.apiService.login(this.credentials).toPromise();
      
      if (response && response.token) {
        // Store token in localStorage with correct keys
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify({
          username: response.username,
          role: response.role,
          userId: response.userId
        }));
        
        // Redirect based on user role
        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        } else if (response.role === 'AGENT') {
          this.router.navigate(['/agent-dashboard']);
        } else {
          // Fallback to general dashboard
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.errorMessage = 'Invalid response from server';
      }
    } catch (error: any) {
      console.error('Login error:', error);
      this.errorMessage = error.error?.message || 'Login failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
