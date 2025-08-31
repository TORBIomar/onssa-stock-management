import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, RegisterRequest } from '../../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <div class="brand-icon mb-3">
                  <i class="bi bi-shield-check"></i>
                </div>
                <h4 class="card-title">Créer un Compte Agent</h4>
                <p class="text-muted small">
                  Entrez le nom d'utilisateur et mot de passe fournis par ONSSA pour vous enregistrer en tant qu'agent
                </p>
              </div>

              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Nom d'utilisateur</label>
                  <input type="text" class="form-control" formControlName="username" 
                         placeholder="Nom d'utilisateur ONSSA">
                  <div class="text-danger small mt-1" *ngIf="form.get('username')?.touched && form.get('username')?.invalid">
                    <span *ngIf="form.get('username')?.errors?.['required']">Le nom d'utilisateur est requis</span>
                    <span *ngIf="form.get('username')?.errors?.['minlength']">Le nom d'utilisateur doit contenir au moins 3 caractères</span>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" formControlName="email" 
                         placeholder="votre.email@onssa.gov.ma">
                  <div class="text-danger small mt-1" *ngIf="form.get('email')?.touched && form.get('email')?.invalid">
                    <span *ngIf="form.get('email')?.errors?.['required']">L'email est requis</span>
                    <span *ngIf="form.get('email')?.errors?.['email']">Format d'email invalide</span>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Mot de passe</label>
                  <input type="password" class="form-control" formControlName="password" 
                         placeholder="Mot de passe ONSSA">
                  <div class="text-danger small mt-1" *ngIf="form.get('password')?.touched && form.get('password')?.invalid">
                    <span *ngIf="form.get('password')?.errors?.['required']">Le mot de passe est requis</span>
                    <span *ngIf="form.get('password')?.errors?.['minlength']">Le mot de passe doit contenir au moins 6 caractères</span>
                  </div>
                </div>



                <div class="mb-3">
                  <label class="form-label">Rôle</label>
                  <select class="form-select" formControlName="role">
                    <option value="AGENT">AGENT ONSSA</option>
                  </select>
                  <div class="text-danger small mt-1" *ngIf="form.get('role')?.touched && form.get('role')?.invalid">
                    <span *ngIf="form.get('role')?.errors?.['required']">Le rôle est requis</span>
                  </div>
                </div>

                <div class="d-grid">
                  <button type="submit" class="btn btn-primary btn-lg" [disabled]="form.invalid || loading">
                    <span *ngIf="!loading">Créer le Compte Agent</span>
                    <span *ngIf="loading">
                      <i class="bi bi-arrow-clockwise spin"></i> Création en cours...
                    </span>
                  </button>
                </div>
              </form>

              <div class="text-center mt-4">
                <p class="mb-0">
                  Déjà un compte ? 
                  <a routerLink="/login" class="text-decoration-none">Se connecter</a>
                </p>
              </div>

              <div class="alert alert-info mt-3" role="alert">
                <i class="bi bi-info-circle me-2"></i>
                <strong>Information ONSSA :</strong> Seuls les agents autorisés par l'Office National de Sécurité Sanitaire des Produits Alimentaires peuvent créer un compte. Contactez votre superviseur pour obtenir vos identifiants.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .brand-icon {
      font-size: 3rem;
      color: #667eea;
      margin-bottom: 1rem;
    }
    
    .card {
      border-radius: 15px;
      border: none;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    
    .card-title {
      color: #333;
      font-weight: 600;
    }
    
    .form-control, .form-select {
      border-radius: 8px;
      border: 1px solid #e1e5e9;
      padding: 0.75rem 1rem;
      transition: all 0.3s ease;
    }
    
    .form-control:focus, .form-select:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
    
    .btn-primary:disabled {
      background: #6c757d;
      transform: none;
      box-shadow: none;
    }
    
    .alert-info {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border: 1px solid #90caf9;
      border-radius: 8px;
      color: #1565c0;
    }
    
    .spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .text-decoration-none {
      color: #667eea;
      font-weight: 500;
    }
    
    .text-decoration-none:hover {
      color: #764ba2;
    }
  `]
})
export class RegisterComponent {
  loading = false;
  error = '';
  success = '';
  form!: FormGroup;

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['AGENT', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.success = '';
    this.api.register(this.form.value as RegisterRequest).subscribe({
      next: () => {
        this.loading = false;
        // Redirect to login with success indicator
        this.router.navigate(['/login'], { queryParams: { registered: '1' } });
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.message || 'Registration failed';
      }
    });
  }
}