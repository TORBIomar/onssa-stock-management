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
    <div class="card shadow-sm mx-auto mt-5" style="max-width: 520px;">
      <div class="card-body p-4">
        <h2 class="h4 mb-3">Créer un compte</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="vstack gap-3">
          <div>
            <label class="form-label">Nom d'utilisateur</label>
            <input class="form-control" formControlName="username" type="text" placeholder="your.username" />
            <div class="text-danger small mt-1" *ngIf="form.get('username')?.touched && form.get('username')?.invalid">
              Le nom d'utilisateur est requis
            </div>
          </div>

          <div>
            <label class="form-label">E-mail</label>
            <input class="form-control" formControlName="email" type="email" placeholder="you@example.com" />
            <div class="text-danger small mt-1" *ngIf="form.get('email')?.touched && form.get('email')?.invalid">
              E-mail valide requis
            </div>
          </div>

          <div>
            <label class="form-label">Mot de passe</label>
            <input class="form-control" formControlName="password" type="password" placeholder="••••••••" />
            <div class="text-danger small mt-1" *ngIf="form.get('password')?.touched && form.get('password')?.invalid">
              Le mot de passe est requis
            </div>
          </div>

          <div>
            <label class="form-label">Rôle</label>
            <select class="form-select" formControlName="role">
              <option value="AGENT">AGENT</option>
              <option value="VETERINAIRE">VETERINAIRE</option>
            </select>
            <div class="text-danger small mt-1" *ngIf="form.get('role')?.touched && form.get('role')?.invalid">
              Le rôle est requis
            </div>
          </div>

          <button class="btn btn-success w-100" type="submit" [disabled]="form.invalid || loading">
            <span *ngIf="!loading">Créer le compte</span>
            <span *ngIf="loading" class="spinner-border spinner-border-sm"></span>
          </button>

          <div class="text-muted small">
            Vous avez déjà un compte ? <a routerLink="/login">Se connecter</a>
          </div>

          <div class="alert alert-danger py-2" *ngIf="error">{{ error }}</div>
          <div class="alert alert-success py-2" *ngIf="success">{{ success }}</div>
        </form>
      </div>
    </div>
  `,
  styles: [`
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