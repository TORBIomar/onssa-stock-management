import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Register</h2>
        <form (ngSubmit)="onRegister()" #registerForm="ngForm">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              [(ngModel)]="userData.username" 
              required
              class="form-control">
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              [(ngModel)]="userData.email" 
              required
              class="form-control">
          </div>
          <div class="form-group">
            <label for="role">Role</label>
            <select 
              id="role" 
              name="role" 
              [(ngModel)]="userData.role" 
              required
              class="form-control">
              <option value="AGENT">Agent</option>
              <option value="VETERINAIRE">Veterinaire</option>
            </select>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              [(ngModel)]="userData.password" 
              required
              minlength="6"
              class="form-control">
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              [(ngModel)]="confirmPassword" 
              required
              class="form-control">
          </div>
          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>
          <button type="submit" [disabled]="!registerForm.valid || isLoading || !passwordsMatch()" class="btn-register">
            {{ isLoading ? 'Registering...' : 'Register' }}
          </button>
        </form>
        <div class="login-link">
          <p>Already have an account? <a routerLink="/login">Login here</a></p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem 0;
    }
    
    .register-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 450px;
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
    
    .form-control.ng-invalid.ng-touched {
      border-color: #e74c3c;
    }
    
    .btn-register {
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
    
    .btn-register:hover:not(:disabled) {
      background: #5a6fd8;
    }
    
    .btn-register:disabled {
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
    
    .success-message {
      color: #27ae60;
      background: #f0f9f4;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      border: 1px solid #c3e6cb;
    }
    
    .login-link {
      text-align: center;
      margin-top: 1rem;
    }
    
    .login-link a {
      color: #667eea;
      text-decoration: none;
    }
    
    .login-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
    userData = {
        username: '',
        email: '',
        password: '',
        role: 'AGENT' as 'ADMIN' | 'AGENT' | 'VETERINAIRE'
    };

    confirmPassword = '';
    errorMessage = '';
    successMessage = '';
    isLoading = false;

    constructor(
        private apiService: ApiService,
        private router: Router
    ) { }

    passwordsMatch(): boolean {
        return this.userData.password === this.confirmPassword;
    }

    async onRegister() {
        if (!this.passwordsMatch()) {
            this.errorMessage = 'Passwords do not match';
            return;
        }

        if (this.userData.password.length < 6) {
            this.errorMessage = 'Password must be at least 6 characters long';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        try {
            const response = await this.apiService.register(this.userData).toPromise();

            if (response) {
                this.successMessage = 'Registration successful! Please login.';
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 2000);
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        } finally {
            this.isLoading = false;
        }
    }
}
