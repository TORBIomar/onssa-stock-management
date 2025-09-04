import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
          <button class="btn btn-primary btn-sm" (click)="openAddModal()">
            <i class="bi bi-plus me-2"></i>Nouvel Utilisateur
          </button>
          <button class="btn btn-outline-secondary btn-sm" (click)="loadUsers()">
            <i class="bi bi-arrow-clockwise me-2"></i>Actualiser
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row g-4 mb-4">
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
      </div>

      <!-- Users Table -->
      <div class="card shadow-sm">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="bi bi-list me-2"></i>Liste des Utilisateurs</h5>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" (click)="exportToCSV()">
              <i class="bi bi-download me-1"></i>Exporter
            </button>
            <button class="btn btn-outline-info" (click)="toggleActiveFilter()">
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
                  <td><strong>{{ user.username }}</strong></td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span [class]="getRoleBadge(user.role)">
                      {{ getRoleText(user.role) }}
                    </span>
                  </td>
                  <td>
                    <span [class]="getStatusBadge(user.active)">
                      {{ user.active ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" (click)="editUser(user)" title="Modifier">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-info" (click)="viewDetails(user)" title="Détails">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-outline-warning" (click)="toggleUserStatus(user)" title="Changer Statut">
                        <i class="bi bi-toggle-on"></i>
                      </button>
                      <button class="btn btn-outline-danger" (click)="deleteUser(user.id)" title="Supprimer">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
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
              <button type="button" class="btn-close" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="userForm" (ngSubmit)="saveUser()">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Nom d'utilisateur *</label>
                      <input type="text" class="form-control" formControlName="username" 
                             [class.is-invalid]="userForm.get('username')?.invalid && userForm.get('username')?.touched">
                      <div class="invalid-feedback" *ngIf="userForm.get('username')?.invalid && userForm.get('username')?.touched">
                        Le nom d'utilisateur est requis
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Email *</label>
                      <input type="email" class="form-control" formControlName="email"
                             [class.is-invalid]="userForm.get('email')?.invalid && userForm.get('email')?.touched">
                      <div class="invalid-feedback" *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched">
                        Email invalide
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Mot de passe *</label>
                      <input type="password" class="form-control" formControlName="password"
                             [class.is-invalid]="userForm.get('password')?.invalid && userForm.get('password')?.touched">
                      <div class="invalid-feedback" *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched">
                        Le mot de passe est requis (min 6 caractères)
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Rôle *</label>
                      <select class="form-select" formControlName="role"
                              [class.is-invalid]="userForm.get('role')?.invalid && userForm.get('role')?.touched">
                        <option value="">Sélectionner un rôle</option>
                        <option value="ADMIN">Administrateur</option>
                        <option value="AGENT">Agent</option>
                      </select>
                      <div class="invalid-feedback" *ngIf="userForm.get('role')?.invalid && userForm.get('role')?.touched">
                        Le rôle est requis
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Annuler</button>
              <button type="button" class="btn btn-primary" (click)="saveUser()" [disabled]="!userForm.valid">
                <i class="bi" [class]="editingUser ? 'bi-check' : 'bi-plus'"></i>
                {{ editingUser ? 'Modifier' : 'Créer' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- User Details Modal -->
      <div *ngIf="showDetailsModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-eye me-2"></i>
                Détails de l'Utilisateur
              </h5>
              <button type="button" class="btn-close" (click)="closeDetailsModal()"></button>
            </div>
            <div class="modal-body">
              <div *ngIf="selectedUser" class="row g-3">
                <div class="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title text-primary">Informations Générales</h6>
                      <p><strong>ID:</strong> {{ selectedUser.id }}</p>
                      <p><strong>Nom d'utilisateur:</strong> {{ selectedUser.username }}</p>
                      <p><strong>Email:</strong> {{ selectedUser.email }}</p>
                      <p><strong>Rôle:</strong> 
                        <span [class]="getRoleBadge(selectedUser.role)">
                          {{ getRoleText(selectedUser.role) }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title text-info">Statut</h6>
                      <p><strong>Statut:</strong> 
                        <span [class]="getStatusBadge(selectedUser.active)">
                          {{ selectedUser.active ? 'Actif' : 'Inactif' }}
                        </span>
                      </p>
                      <p><strong>Date de création:</strong> {{ formatDate(selectedUser.createdAt) }}</p>
                      <p><strong>Dernière mise à jour:</strong> {{ formatDate(selectedUser.updatedAt) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeDetailsModal()">Fermer</button>
              <button type="button" class="btn btn-primary" (click)="editUser(selectedUser!)">
                <i class="bi bi-pencil me-2"></i>Modifier
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
  `]
})
export class UsersPageComponent implements OnInit {
  users: User[] = [];
  error: string | null = null;

  // Modal states
  showAddModal = false;
  showDetailsModal = false;
  showActiveOnly = false;

  // Form data
  userForm: FormGroup;
  editingUser: User | null = null;
  selectedUser: User | null = null;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  // Data loading functions
  loadUsers() {
    this.api.listUsers().subscribe({
      next: (data) => {
        this.users = data || [];
        this.error = null;
        this.cdr.detectChanges(); // Added detectChanges() here
      },
      error: (error) => {
        this.error = error.message || 'Erreur lors du chargement des utilisateurs';
        this.users = [];
        this.cdr.detectChanges(); // Added detectChanges() here
      }
    });
  }

  // Filter functions
  getFilteredUsers(): User[] {
    if (this.showActiveOnly) {
      return this.users.filter(user => user.active);
    }
    return this.users;
  }

  toggleActiveFilter() {
    this.showActiveOnly = !this.showActiveOnly;
  }

  // Statistics functions
  getActiveCount(): number {
    return this.users.filter(user => user.active).length;
  }

  getInactiveCount(): number {
    return this.users.filter(user => !user.active).length;
  }

  getAdminCount(): number {
    return this.users.filter(user => user.role === 'ADMIN').length;
  }

  // Display functions
  getRoleText(role: string): string {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'AGENT': 'Agent'
    };
    return roleMap[role] || role;
  }

  getRoleBadge(role: string): string {
    const badgeMap: { [key: string]: string } = {
      'ADMIN': 'badge bg-danger',
      'AGENT': 'badge bg-primary'
    };
    return badgeMap[role] || 'badge bg-secondary';
  }

  getStatusBadge(active: boolean): string {
    return active ? 'badge bg-success' : 'badge bg-warning';
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  // Modal functions
  openAddModal() {
    this.editingUser = null;
    this.userForm.reset();
    this.showAddModal = true;
  }

  editUser(user: User) {
    this.editingUser = user;
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      password: '', // Don't populate password for security
      role: user.role
    });
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.editingUser = null;
    this.userForm.reset();
  }

  viewDetails(user: User) {
    this.selectedUser = user;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedUser = null;
  }

  // Action functions
  saveUser() {
    if (this.userForm.invalid) {
      alert('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    const userData = this.userForm.value;

    if (this.editingUser) {
      this.api.updateUser(this.editingUser.id, userData).subscribe({
        next: () => {
          this.closeModal();
          this.loadUsers();
          alert('Utilisateur modifié avec succès');
        },
        error: (error) => {
          alert('Erreur lors de la modification: ' + error.message);
        }
      });
    } else {
      this.api.createUser(userData).subscribe({
        next: () => {
          this.closeModal();
          this.loadUsers();
          alert('Utilisateur créé avec succès');
        },
        error: (error) => {
          alert('Erreur lors de la création: ' + error.message);
        }
      });
    }
  }

  toggleUserStatus(user: User) {
    if (confirm(`Êtes-vous sûr de vouloir ${user.active ? 'désactiver' : 'activer'} cet utilisateur ?`)) {
      const updatedUser = { ...user, active: !user.active };

      this.api.updateUser(user.id, updatedUser).subscribe({
        next: () => {
          this.loadUsers();
          alert(`Utilisateur ${user.active ? 'désactivé' : 'activé'} avec succès`);
        },
        error: (error) => {
          alert('Erreur lors du changement de statut: ' + error.message);
        }
      });
    }
  }

  deleteUser(userId: number) {
    if (!this.api.isAuthenticated()) {
      alert('Vous devez être connecté pour supprimer un utilisateur');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.api.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
          alert('Utilisateur supprimé avec succès');
        },
        error: (error) => {
          alert('Erreur lors de la suppression: ' + error.message);
        }
      });
    }
  }

  exportToCSV() {
    alert('Export CSV fonctionnalité sera implémentée ici');
  }
}
