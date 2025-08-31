import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'AGENT';
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 mb-0 gradient-text">
            <i class="bi bi-people me-2"></i>Gestion des Utilisateurs
          </h2>
          <p class="text-muted">Gestion des comptes et des permissions</p>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline-primary btn-sm" (click)="refreshUsers()">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Actualiser
          </button>
          <button class="btn btn-primary btn-sm" (click)="openAddModal()">
            <i class="bi bi-plus me-2"></i>Nouvel Utilisateur
          </button>
        </div>
      </div>

      <!-- Users Content -->
      <div class="row g-4">
        
        <!-- Statistics Cards -->
        <div class="col-md-3">
          <div class="card stat-card bg-primary text-white">
            <div class="card-body text-center">
              <i class="bi bi-people fs-1 mb-2"></i>
              <h3 class="mb-1">{{ users.length }}</h3>
              <p class="mb-0">Total Utilisateurs</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card stat-card bg-success text-white">
            <div class="card-body text-center">
              <i class="bi bi-check-circle fs-1 mb-2"></i>
              <h3 class="mb-1">{{ getActiveCount() }}</h3>
              <p class="mb-0">Actifs</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card stat-card bg-warning text-dark">
            <div class="card-body text-center">
              <i class="bi bi-person-x fs-1 mb-2"></i>
              <h3 class="mb-1">{{ getInactiveCount() }}</h3>
              <p class="mb-0">Inactifs</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card stat-card bg-info text-white">
            <div class="card-body text-center">
              <i class="bi bi-shield-check fs-1 mb-2"></i>
              <h3 class="mb-1">{{ getAdminCount() }}</h3>
              <p class="mb-0">Administrateurs</p>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0"><i class="bi bi-list me-2"></i>Liste des Utilisateurs</h5>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-secondary" (click)="exportToCSV()">
                  <i class="bi bi-download me-1"></i>Exporter
                </button>
                <button class="btn btn-outline-info" (click)="showActiveOnly = !showActiveOnly">
                  <i class="bi bi-filter me-1"></i>{{ showActiveOnly ? 'Tous' : 'Actifs' }}
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Utilisateur</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th>Date Création</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let user of getFilteredUsers()" 
                        [class.table-success]="user.active"
                        [class.table-warning]="!user.active">
                      <td>{{ user.id }}</td>
                      <td>
                        <strong>{{ user.username }}</strong>
                      </td>
                      <td>{{ user.email }}</td>
                      <td>
                        <span [class]="getRoleBadgeClass(user.role)">
                          {{ getRoleDisplay(user.role) }}
                        </span>
                      </td>
                      <td>
                        <span [class]="getStatusBadgeClass(user.active)">
                          {{ user.active ? 'Actif' : 'Inactif' }}
                        </span>
                      </td>
                      <td>
                        <span class="text-muted">{{ formatDate(user.createdAt) }}</span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary" (click)="editUser(user)" title="Modifier">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-outline-success" (click)="toggleUserStatus(user)" 
                                  [disabled]="togglingUser === user.id" title="{{ user.active ? 'Désactiver' : 'Activer' }}">
                            <i class="bi" [class]="user.active ? 'bi-person-x' : 'bi-person-check'"></i>
                          </button>
                          <button class="btn btn-outline-warning" (click)="resetPassword(user)" 
                                  [disabled]="resettingPassword === user.id" title="Réinitialiser Mot de Passe">
                            <i class="bi bi-key"></i>
                          </button>
                          <button class="btn btn-outline-danger" (click)="deleteUser(user.id)" 
                                  [disabled]="deletingUser === user.id" title="Supprimer">
                            <i class="bi" [class]="deletingUser === user.id ? 'bi-hourglass-split' : 'bi-trash'"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Error State -->
      <div *ngIf="!users && error" class="text-center py-5">
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>
        <button class="btn btn-primary" (click)="refreshUsers()">
          <i class="bi bi-arrow-clockwise me-2"></i>Réessayer
        </button>
      </div>

      <!-- Add/Edit User Modal -->
      <div *ngIf="showAddModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi" [class]="editingUser ? 'bi-pencil' : 'bi-plus'"></i>
                {{ editingUser ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur' }}
              </h5>
              <button type="button" class="btn-close" (click)="closeModal()" [disabled]="saving"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="form" (ngSubmit)="saveUser()">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Nom d'utilisateur *</label>
                      <input class="form-control" formControlName="username" 
                             [readonly]="editingUser" />
                      <div class="invalid-feedback d-block" 
                           *ngIf="form.get('username')?.invalid && form.get('username')?.touched">
                        Le nom d'utilisateur est requis
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Email *</label>
                      <input class="form-control" type="email" formControlName="email" />
                      <div class="invalid-feedback d-block" 
                           *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
                        Email invalide
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Rôle *</label>
                      <select class="form-select" formControlName="role">
                        <option value="">Sélectionner un rôle</option>
                        <option value="ADMIN">Admin</option>
                        <option value="AGENT">Agent</option>
                      </select>
                      <div class="invalid-feedback d-block" 
                           *ngIf="form.get('role')?.invalid && form.get('role')?.touched">
                        Le rôle est requis
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Statut</label>
                      <select class="form-select" formControlName="active">
                        <option value="true">Actif</option>
                        <option value="false">Inactif</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="row" *ngIf="!editingUser">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Mot de passe *</label>
                      <input class="form-control" type="password" formControlName="password" />
                      <div class="invalid-feedback d-block" 
                           *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
                        Le mot de passe est requis (min 6 caractères)
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Confirmer le mot de passe *</label>
                      <input class="form-control" type="password" formControlName="confirmPassword" />
                      <div class="invalid-feedback d-block" 
                           *ngIf="form.get('confirmPassword')?.invalid && form.get('confirmPassword')?.touched">
                        Les mots de passe ne correspondent pas
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()" [disabled]="saving">Annuler</button>
              <button type="button" class="btn btn-primary" (click)="saveUser()" 
                      [disabled]="form.invalid || saving">
                <span *ngIf="!saving">
                  <i class="bi" [class]="editingUser ? 'bi-check' : 'bi-plus'"></i>
                  {{ editingUser ? 'Modifier' : 'Créer' }}
                </span>
                <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving ? 'Enregistrement...' : '' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reset Password Modal -->
      <div *ngIf="showResetModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-key me-2"></i>
                Réinitialiser le Mot de Passe
              </h5>
              <button type="button" class="btn-close" (click)="closeResetModal()" [disabled]="resettingPassword"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Utilisateur</label>
                <input type="text" class="form-control" [value]="selectedUser?.username" readonly>
              </div>
              <div class="mb-3">
                <label class="form-label">Nouveau mot de passe *</label>
                <input type="password" class="form-control" [(ngModel)]="newPassword" minlength="6">
              </div>
              <div class="mb-3">
                <label class="form-label">Confirmer le mot de passe *</label>
                <input type="password" class="form-control" [(ngModel)]="confirmNewPassword" minlength="6">
              </div>
              <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                Le mot de passe doit contenir au moins 6 caractères.
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeResetModal()" [disabled]="resettingPassword">Annuler</button>
              <button type="button" class="btn btn-warning" (click)="confirmResetPassword()" 
                      [disabled]="!newPassword || newPassword !== confirmNewPassword || newPassword.length < 6 || resettingPassword">
                <span *ngIf="!resettingPassword">
                  <i class="bi bi-check me-2"></i>Réinitialiser
                </span>
                <span *ngIf="resettingPassword" class="spinner-border spinner-border-sm me-2"></span>
                {{ resettingPassword ? 'Réinitialisation...' : '' }}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .gradient-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 600;
    }
    
    .stat-card {
      border: none;
      border-radius: 15px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    
    .card {
      border-radius: 12px;
      border: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    }
    
    .btn {
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .table th {
      border-top: none;
      font-weight: 600;
      color: #495057;
    }
    
    .badge {
      font-size: 0.8rem;
      padding: 0.5em 0.8em;
      border-radius: 8px;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class UsersPageComponent implements OnInit {
  users: User[] = [];
  saving = false;
  resettingPassword: number | null = null;
  togglingUser: number | null = null;
  deletingUser: number | null = null;
  error: string | null = null;

  // Modal states
  showAddModal = false;
  showResetModal = false;
  showActiveOnly = false;

  // Form data
  form: FormGroup;
  editingUser: User | null = null;
  selectedUser: User | null = null;
  newPassword = '';
  confirmNewPassword = '';

  constructor(
    private api: ApiService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      active: [true],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.error = null;

    this.api.listUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        this.error = error.message || 'Erreur lors du chargement des utilisateurs';
      }
    });
  }

  refreshUsers() {
    this.loadUsers();
  }

  // Filter and display methods
  getFilteredUsers(): User[] {
    if (this.showActiveOnly) {
      return this.users.filter(u => u.active);
    }
    return this.users;
  }

  getActiveCount(): number {
    return this.users.filter(u => u.active).length;
  }

  getInactiveCount(): number {
    return this.users.filter(u => !u.active).length;
  }

  getAdminCount(): number {
    return this.users.filter(u => u.role === 'ADMIN').length;
  }

  // Display methods
  getRoleDisplay(role: string): string {
    const roles: { [key: string]: string } = {
      'ADMIN': 'Admin',
      'AGENT': 'Agent'
    };
    return roles[role] || role;
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'badge bg-danger';
      case 'AGENT':
        return 'badge bg-info';
      default:
        return 'badge bg-secondary';
    }
  }

  getStatusBadgeClass(active: boolean): string {
    return active ? 'badge bg-success' : 'badge bg-warning';
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  // Form validation
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  // Modal methods
  openAddModal() {
    this.editingUser = null;
    this.form.reset({
      active: true
    });
    this.showAddModal = true;
  }

  editUser(user: User) {
    this.editingUser = user;
    this.form.patchValue({
      username: user.username,
      email: user.email,
      role: user.role,
      active: user.active
    });
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.editingUser = null;
    this.form.reset();
  }

  resetPassword(user: User) {
    this.selectedUser = user;
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.showResetModal = true;
  }

  closeResetModal() {
    this.showResetModal = false;
    this.selectedUser = null;
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  // Action methods
  saveUser() {
    if (this.form.invalid) {
      return;
    }

    this.saving = true;
    const userData = this.form.value;

    if (this.editingUser) {
      // Update existing user
      const updateData = {
        id: this.editingUser.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        active: userData.active
      };

      this.api.updateUser(this.editingUser.id, updateData).subscribe({
        next: (response) => {
          this.showSuccessMessage('Utilisateur modifié avec succès');
          this.closeModal();
          this.loadUsers();
        },
        error: (error) => {
          this.showErrorMessage('Erreur lors de la modification: ' + error.message);
          this.saving = false;
        }
      });
    } else {
      // Create new user
      const createData = {
        username: userData.username,
        email: userData.email,
        role: userData.role,
        active: userData.active,
        password: userData.password
      };

      this.api.createUser(createData).subscribe({
        next: (response) => {
          this.showSuccessMessage('Utilisateur créé avec succès');
          this.closeModal();
          this.loadUsers();
        },
        error: (error) => {
          this.showErrorMessage('Erreur lors de la création: ' + error.message);
          this.saving = false;
        }
      });
    }
  }

  toggleUserStatus(user: User) {
    const action = user.active ? 'désactiver' : 'activer';
    if (!confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) {
      return;
    }

    this.togglingUser = user.id;

    this.api.toggleUserStatus(user.id).subscribe({
      next: (response) => {
        this.showSuccessMessage(`Utilisateur ${action} avec succès`);
        this.loadUsers();
      },
      error: (error) => {
        this.showErrorMessage(`Erreur lors de la ${action}: ` + error.message);
        this.togglingUser = null;
      }
    });
  }

  confirmResetPassword() {
    if (!this.selectedUser || !this.newPassword || this.newPassword !== this.confirmNewPassword) {
      alert('Veuillez saisir un mot de passe valide');
      return;
    }

    this.resettingPassword = this.selectedUser.id;

    // Note: You'll need to implement this method in your API service
    this.api.resetUserPassword(this.selectedUser.id, this.newPassword).subscribe({
      next: (response: any) => {
        this.showSuccessMessage('Mot de passe réinitialisé avec succès');
        this.closeResetModal();
      },
      error: (error: any) => {
        this.showErrorMessage('Erreur lors de la réinitialisation: ' + error.message);
        this.resettingPassword = null;
      }
    });
  }

  deleteUser(userId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return;
    }

    this.deletingUser = userId;

    this.api.deleteUser(userId).subscribe({
      next: () => {
        this.showSuccessMessage('Utilisateur supprimé avec succès');
        this.loadUsers();
      },
      error: (error) => {
        this.showErrorMessage('Erreur lors de la suppression: ' + error.message);
        this.deletingUser = null;
      }
    });
  }

  exportToCSV() {
    const headers = ['ID', 'Nom d\'utilisateur', 'Email', 'Rôle', 'Statut', 'Date Création'];
    const data = this.users.map(u => [
      u.id,
      u.username,
      u.email,
      this.getRoleDisplay(u.role),
      u.active ? 'Actif' : 'Inactif',
      this.formatDate(u.createdAt)
    ]);

    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showSuccessMessage('Export CSV terminé');
  }

  // Utility methods
  showSuccessMessage(message: string) {
    // You can implement a toast notification system here
    alert(message);
  }

  showErrorMessage(message: string) {
    // You can implement a toast notification system here
    alert(message);
  }
}
