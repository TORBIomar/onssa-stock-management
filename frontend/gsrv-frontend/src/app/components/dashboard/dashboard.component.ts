import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-layout">
      <!-- Left Sidebar Navigation -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo-section">
            <div class="logo-icon">
              <i class="bi bi-shield-check"></i>
            </div>
            <h1 class="logo-text">GSRV System</h1>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-section">
            <h3 class="nav-title">Navigation</h3>
            <ul class="nav-list">
              <li class="nav-item" [class.active]="activeTab === 'dashboard'">
                <button class="nav-link" (click)="setActiveTab('dashboard')">
                  <i class="bi bi-speedometer2"></i>
                  <span>Tableau de bord</span>
                </button>
              </li>
              <li class="nav-item" *ngIf="hasPermissionForTab('products')" [class.active]="activeTab === 'products'">
                <button class="nav-link" (click)="setActiveTab('products')">
                  <i class="bi bi-box-seam"></i>
                  <span>Produits</span>
                </button>
              </li>
              <li class="nav-item" *ngIf="hasPermissionForTab('reclamations')" [class.active]="activeTab === 'reclamations'">
                <button class="nav-link" (click)="setActiveTab('reclamations')">
                  <i class="bi bi-exclamation-triangle"></i>
                  <span>Réclamations</span>
                </button>
              </li>
              <li class="nav-item" *ngIf="hasPermissionForTab('tasks')" [class.active]="activeTab === 'tasks'">
                <button class="nav-link" (click)="setActiveTab('tasks')">
                  <i class="bi bi-list-task"></i>
                  <span>Tâches</span>
                </button>
              </li>
              <li class="nav-item" *ngIf="hasPermissionForTab('reports')" [class.active]="activeTab === 'reports'">
                <button class="nav-link" (click)="setActiveTab('reports')">
                  <i class="bi bi-file-earmark-text"></i>
                  <span>Rapports</span>
                </button>
              </li>
              <li class="nav-item" *ngIf="hasPermissionForTab('users')" [class.active]="activeTab === 'users'">
                <button class="nav-link" (click)="setActiveTab('users')">
                  <i class="bi bi-people"></i>
                  <span>Utilisateurs</span>
                </button>
              </li>
              <li class="nav-item" *ngIf="hasPermissionForTab('analytics')" [class.active]="activeTab === 'analytics'">
                <button class="nav-link" (click)="setActiveTab('analytics')">
                  <i class="bi bi-graph-up"></i>
                  <span>Analytics</span>
                </button>
              </li>
              <li class="nav-item" *ngIf="hasPermissionForTab('settings')" [class.active]="activeTab === 'settings'">
                <button class="nav-link" (click)="setActiveTab('settings')">
                  <i class="bi bi-gear"></i>
                  <span>Paramètres</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">
              <i class="bi bi-person-circle"></i>
            </div>
            <div class="user-details">
              <span class="user-name">{{ getCurrentUserName() }}</span>
              <span class="user-role">{{ getUserRoleDisplayName() }}</span>
            </div>
          </div>
          <div class="permission-info mt-2">
            <button class="btn btn-sm btn-outline-light w-100" (click)="showPermissionInfo()">
              <i class="bi bi-info-circle me-2"></i>Mes Permissions
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Dashboard Tab -->
        <div *ngIf="activeTab === 'dashboard'" class="tab-content">
          <div class="content-header">
            <h2><i class="bi bi-speedometer2 me-2"></i>Tableau de Bord</h2>
            <p class="text-muted">Bienvenue dans le système GSRV</p>
          </div>

          <!-- Quick Stats -->
          <div class="row g-4 mb-4">
            <div class="col-md-3">
              <div class="stat-card bg-primary text-white">
                <div class="card-body text-center">
                  <i class="bi bi-people fs-1 mb-2"></i>
                  <h3 class="mb-1">{{ dashboardData?.totalUsers || 0 }}</h3>
                  <p class="mb-0">Utilisateurs</p>
                </div>
              </div>
            </div>

            <div class="col-md-3">
              <div class="stat-card bg-success text-white">
                <div class="card-body text-center">
                  <i class="bi bi-box fs-1 mb-2"></i>
                  <h3 class="mb-1">{{ dashboardData?.totalProducts || 0 }}</h3>
                  <p class="mb-0">Produits</p>
                </div>
              </div>
            </div>

            <div class="col-md-3">
              <div class="stat-card bg-warning text-dark">
                <div class="card-body text-center">
                  <i class="bi bi-exclamation-triangle fs-1 mb-2"></i>
                  <h3 class="mb-1">{{ dashboardData?.totalReclamations || 0 }}</h3>
                  <p class="mb-0">Réclamations</p>
                </div>
              </div>
            </div>

            <div class="col-md-3">
              <div class="stat-card bg-info text-white">
                <div class="card-body text-center">
                  <i class="bi bi-list-task fs-1 mb-2"></i>
                  <h3 class="mb-1">{{ dashboardData?.totalTasks || 0 }}</h3>
                  <p class="mb-0">Tâches</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="row g-4">
            <div class="col-md-6">
              <div class="card shadow-sm">
                <div class="card-header bg-light">
                  <h5 class="mb-0"><i class="bi bi-lightning me-2"></i>Actions Rapides</h5>
                </div>
                <div class="card-body">
                  <div class="row g-3">
                    <div class="col-6" *ngIf="hasPermissionForTab('products')">
                      <button class="btn btn-outline-primary w-100" (click)="setActiveTab('products')">
                        <i class="bi bi-box-seam me-2"></i>Gérer les Produits
                      </button>
                    </div>
                    <div class="col-6" *ngIf="hasPermissionForTab('reclamations')">
                      <button class="btn btn-outline-warning w-100" (click)="setActiveTab('reclamations')">
                        <i class="bi bi-exclamation-triangle me-2"></i>Réclamations
                      </button>
                    </div>
                    <div class="col-6" *ngIf="hasPermissionForTab('tasks')">
                      <button class="btn btn-outline-info w-100" (click)="setActiveTab('tasks')">
                        <i class="bi bi-list-task me-2"></i>Mes Tâches
                      </button>
                    </div>
                    <div class="col-6" *ngIf="hasPermissionForTab('reports')">
                      <button class="btn btn-outline-success w-100" (click)="setActiveTab('reports')">
                        <i class="bi bi-file-earmark-text me-2"></i>Rapports
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="card shadow-sm">
                <div class="card-header bg-light">
                  <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>Activité Récente</h5>
                </div>
                <div class="card-body">
                  <div *ngIf="dashboardData?.recentActivity && dashboardData.recentActivity.length > 0">
                    <div *ngFor="let activity of dashboardData.recentActivity.slice(0, 5)" 
                         class="d-flex align-items-center p-2 border-bottom">
                      <div class="me-3">
                        <i class="bi bi-circle-fill text-primary"></i>
                      </div>
                      <div class="flex-grow-1">
                        <h6 class="mb-1 small">{{ activity.description }}</h6>
                        <small class="text-muted">{{ formatDate(activity.timestamp) }}</small>
                      </div>
                    </div>
                  </div>
                  <div *ngIf="!dashboardData?.recentActivity || dashboardData.recentActivity.length === 0" 
                       class="text-center text-muted py-3">
                    Aucune activité récente
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Tab -->
        <div *ngIf="activeTab === 'products'" class="tab-content">
          <div class="content-header">
            <h2><i class="bi bi-box-seam me-2"></i>Gestion des Produits</h2>
            <p class="text-muted">Gérez votre inventaire de produits</p>
          </div>
          
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Liste des Produits</h5>
              <button class="btn btn-primary" *ngIf="canCreate()" (click)="showAddProductModal = true">
                <i class="bi bi-plus me-2"></i>Ajouter un Produit
              </button>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Catégorie</th>
                      <th>Quantité</th>
                      <th>Seuil Minimum</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let product of products">
                      <td>{{ product.name }}</td>
                      <td>{{ product.category }}</td>
                      <td>{{ product.quantity }}</td>
                      <td>{{ product.minimumThreshold }}</td>
                      <td>
                        <span class="badge" [class]="getProductStatusClass(product)">
                          {{ getProductStatus(product) === 'critical' ? 'Critique' : 'Normal' }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary me-2" *ngIf="canEdit()" (click)="editProduct(product)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" *ngIf="canDelete()" (click)="deleteProduct(product.id)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Reclamations Tab -->
        <div *ngIf="activeTab === 'reclamations'" class="tab-content">
          <div class="content-header">
            <h2><i class="bi bi-exclamation-triangle me-2"></i>Gestion des Réclamations</h2>
            <p class="text-muted">Suivez et traitez les réclamations</p>
          </div>
          
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Liste des Réclamations</h5>
              <button class="btn btn-primary" *ngIf="canCreate()" (click)="showAddReclamationModal = true">
                <i class="bi bi-plus me-2"></i>Nouvelle Réclamation
              </button>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Titre</th>
                      <th>Statut</th>
                      <th>Produit</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let reclamation of reclamations">
                      <td>{{ reclamation.id }}</td>
                      <td>{{ reclamation.titre }}</td>
                      <td>
                        <span class="badge" [class]="getReclamationStatusClass(reclamation.status)">
                          {{ reclamation.status }}
                        </span>
                      </td>
                      <td>{{ reclamation.product_id }}</td>
                      <td>
                        <button class="btn btn-sm btn-outline-info me-2" (click)="viewReclamation(reclamation)">
                          <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" *ngIf="canEdit()" (click)="updateReclamationStatus(reclamation.id, 'EN_COURS')">
                          <i class="bi bi-pencil"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Tasks Tab -->
        <div *ngIf="activeTab === 'tasks'" class="tab-content">
          <div class="content-header">
            <h2><i class="bi bi-list-task me-2"></i>Gestion des Tâches</h2>
            <p class="text-muted">Organisez et suivez vos tâches</p>
          </div>
          
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Mes Tâches</h5>
              <button class="btn btn-primary" *ngIf="canCreate()" (click)="showAddTaskModal = true">
                <i class="bi bi-plus me-2"></i>Nouvelle Tâche
              </button>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4" *ngFor="let task of tasks">
                  <div class="card h-100">
                    <div class="card-body">
                      <h6 class="card-title">{{ task.title }}</h6>
                      <p class="card-text">{{ task.description }}</p>
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="badge" [class]="getTaskStatusClass(task.status)">
                          {{ task.status }}
                        </span>
                        <small class="text-muted">{{ formatDate(task.dueDate) }}</small>
                      </div>
                    </div>
                    <div class="card-footer">
                      <button class="btn btn-sm btn-outline-success me-2" (click)="completeTask(task.id)">
                        <i class="bi bi-check"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-primary me-2" *ngIf="canEdit()" (click)="editTask(task)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" *ngIf="canDelete()" (click)="deleteTask(task.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reports Tab -->
        <div *ngIf="activeTab === 'reports'" class="tab-content">
          <div class="content-header">
            <h2><i class="bi bi-file-earmark-text me-2"></i>Gestion des Rapports</h2>
            <p class="text-muted">Générez et consultez vos rapports</p>
          </div>
          
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Rapports Disponibles</h5>
              <button class="btn btn-primary" *ngIf="canCreate()" (click)="showGenerateReportModal = true">
                <i class="bi bi-plus me-2"></i>Générer un Rapport
              </button>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4" *ngFor="let report of reports">
                  <div class="card h-100">
                    <div class="card-body">
                      <h6 class="card-title">{{ report.title }}</h6>
                      <p class="card-text">{{ report.description }}</p>
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="badge" [class]="getReportStatusClass(report.status)">
                          {{ report.status }}
                        </span>
                        <small class="text-muted">{{ formatDate(report.createdAt) }}</small>
                      </div>
                    </div>
                    <div class="card-footer">
                      <button class="btn btn-sm btn-outline-info me-2" (click)="viewReport(report)">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-success" (click)="downloadReport(report)">
                        <i class="bi bi-download"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Tab -->
        <div *ngIf="activeTab === 'users'" class="tab-content">
          <div class="content-header">
            <h2><i class="bi bi-people me-2"></i>Gestion des Utilisateurs</h2>
            <p class="text-muted">Administrez les utilisateurs du système</p>
          </div>
          
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Liste des Utilisateurs</h5>
              <button class="btn btn-primary" *ngIf="canCreate()" (click)="showAddUserModal = true">
                <i class="bi bi-plus me-2"></i>Nouvel Utilisateur
              </button>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Nom d'utilisateur</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let user of users">
                      <td>{{ user.username }}</td>
                      <td>{{ user.email }}</td>
                      <td>
                        <span class="badge" [class]="getUserRoleClass(user.role)">
                          {{ user.role }}
                        </span>
                      </td>
                      <td>
                        <span class="badge" [class]="getUserStatusClass(user.status)">
                          {{ user.status }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary me-2" *ngIf="canEdit()" (click)="editUser(user)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" *ngIf="canDelete()" (click)="deleteUser(user.id)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Tab -->
        <div *ngIf="activeTab === 'analytics'" class="tab-content">
          <div class="content-header">
            <h2><i class="bi bi-graph-up me-2"></i>Analytics</h2>
            <p class="text-muted">Analysez les performances de votre système</p>
          </div>
          
          <div class="row g-4">
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">Statistiques des Produits</h5>
                </div>
                <div class="card-body">
                  <canvas id="productsChart" width="400" height="200"></canvas>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">Évolution des Réclamations</h5>
                </div>
                <div class="card-body">
                  <canvas id="reclamationsChart" width="400" height="200"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div *ngIf="activeTab === 'settings'" class="tab-content">
          <div class="content-header">
            <h2><i class="bi bi-gear me-2"></i>Paramètres du Système</h2>
            <p class="text-muted">Configurez et personnalisez votre système</p>
          </div>
          
          <div class="row g-4">
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">Paramètres Généraux</h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label">Nom de l'Organisation</label>
                    <input type="text" class="form-control" value="GSRV System">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Langue</label>
                    <select class="form-select">
                      <option>Français</option>
                      <option>English</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Fuseau Horaire</label>
                    <select class="form-select">
                      <option>Europe/Paris</option>
                      <option>UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">Paramètres de Sécurité</h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label">Durée de Session (minutes)</label>
                    <input type="number" class="form-control" value="30">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Authentification à 2 Facteurs</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="twoFactor">
                      <label class="form-check-label" for="twoFactor">Activer</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
                 </div>
       </main>
     </div>

     <!-- Add Product Modal -->
     <div *ngIf="showAddProductModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
       <div class="modal-dialog modal-lg">
         <div class="modal-content">
           <div class="modal-header">
             <h5 class="modal-title">Ajouter un Produit</h5>
             <button type="button" class="btn-close" (click)="closeModal('product')"></button>
           </div>
           <div class="modal-body">
             <form #addProductForm="ngForm">
               <div class="row g-3">
                 <div class="col-md-6">
                   <label class="form-label">Nom du Produit</label>
                   <input type="text" class="form-control" [(ngModel)]="newProduct.name" name="name" required>
                 </div>
                 <div class="col-md-6">
                   <label class="form-label">Catégorie</label>
                   <select class="form-select" [(ngModel)]="newProduct.category" name="category" required>
                     <option value="">Sélectionner une catégorie</option>
                     <option value="VACCIN">Vaccin</option>
                     <option value="MEDICAMENT_VETERINAIRE">Médicament Vétérinaire</option>
                     <option value="ALIMENT_ANIMAL">Aliment Animal</option>
                     <option value="EQUIPEMENT">Équipement</option>
                   </select>
                 </div>
                 <div class="col-md-6">
                   <label class="form-label">Quantité</label>
                   <input type="number" class="form-control" [(ngModel)]="newProduct.quantity" name="quantity" required min="0">
                 </div>
                 <div class="col-md-6">
                   <label class="form-label">Seuil Minimum</label>
                   <input type="number" class="form-control" [(ngModel)]="newProduct.minimumThreshold" name="minimumThreshold" required min="0">
                 </div>
               </div>
             </form>
           </div>
           <div class="modal-footer">
             <button type="button" class="btn btn-secondary" (click)="closeModal('product')">Annuler</button>
             <button type="button" class="btn btn-primary" (click)="addProduct()" [disabled]="!addProductForm.valid">Ajouter</button>
           </div>
         </div>
       </div>
     </div>

     <!-- Add Reclamation Modal -->
     <div *ngIf="showAddReclamationModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
       <div class="modal-dialog modal-lg">
         <div class="modal-content">
           <div class="modal-header">
             <h5 class="modal-title">Nouvelle Réclamation</h5>
             <button type="button" class="btn-close" (click)="closeModal('reclamation')"></button>
           </div>
           <div class="modal-body">
             <form #addReclamationForm="ngForm">
               <div class="row g-3">
                 <div class="col-md-6">
                   <label class="form-label">Titre</label>
                   <input type="text" class="form-control" [(ngModel)]="newReclamation.titre" name="titre" required>
                 </div>
                 <div class="col-md-6">
                   <label class="form-label">Produit Concerné</label>
                   <select class="form-select" [(ngModel)]="newReclamation.product_id" name="product_id" required>
                     <option value="">Sélectionner un produit</option>
                     <option *ngFor="let product of products" [value]="product.id">{{ product.name }}</option>
                   </select>
                 </div>
                 <div class="col-12">
                   <label class="form-label">Description</label>
                   <textarea class="form-control" rows="3" [(ngModel)]="newReclamation.description" name="description" required></textarea>
                 </div>
               </div>
             </form>
           </div>
           <div class="modal-footer">
             <button type="button" class="btn btn-secondary" (click)="closeModal('reclamation')">Annuler</button>
             <button type="button" class="btn btn-primary" (click)="addReclamation()" [disabled]="!addReclamationForm.valid">Créer</button>
           </div>
         </div>
       </div>
     </div>

     <!-- Add Task Modal -->
     <div *ngIf="showAddTaskModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
       <div class="modal-dialog modal-lg">
         <div class="modal-content">
           <div class="modal-header">
             <h5 class="modal-title">Nouvelle Tâche</h5>
             <button type="button" class="btn-close" (click)="closeModal('task')"></button>
           </div>
           <div class="modal-body">
             <form #addTaskForm="ngForm">
               <div class="row g-3">
                 <div class="col-md-6">
                   <label class="form-label">Titre</label>
                   <input type="text" class="form-control" [(ngModel)]="newTask.title" name="title" required>
                 </div>
                 <div class="col-md-6">
                   <label class="form-label">Date d'échéance</label>
                   <input type="date" class="form-control" [(ngModel)]="newTask.dueDate" name="dueDate" required>
                 </div>
                 <div class="col-12">
                   <label class="form-label">Description</label>
                   <textarea class="form-control" rows="3" [(ngModel)]="newTask.description" name="description" required></textarea>
                 </div>
               </div>
             </form>
           </div>
           <div class="modal-footer">
             <button type="button" class="btn btn-secondary" (click)="closeModal('task')">Annuler</button>
             <button type="button" class="btn btn-primary" (click)="addTask()" [disabled]="!addTaskForm.valid">Créer</button>
           </div>
         </div>
       </div>
     </div>

     <!-- Generate Report Modal -->
     <div *ngIf="showGenerateReportModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
       <div class="modal-dialog modal-lg">
         <div class="modal-content">
           <div class="modal-header">
             <h5 class="modal-title">Générer un Rapport</h5>
             <button type="button" class="btn-close" (click)="closeModal('report')"></button>
           </div>
           <div class="modal-body">
             <form #generateReportForm="ngForm">
               <div class="row g-3">
                 <div class="col-md-6">
                   <label class="form-label">Titre du Rapport</label>
                   <input type="text" class="form-control" [(ngModel)]="newReport.title" name="title" required>
                 </div>
                 <div class="col-md-6">
                   <label class="form-label">Type de Rapport</label>
                   <select class="form-select" [(ngModel)]="newReport.type" name="type" required>
                     <option value="">Sélectionner un type</option>
                     <option value="INVENTAIRE">Inventaire</option>
                     <option value="ACTIVITE">Activité</option>
                     <option value="PERFORMANCE">Performance</option>
                     <option value="QUALITE">Qualité</option>
                   </select>
                 </div>
                 <div class="col-12">
                   <label class="form-label">Description</label>
                   <textarea class="form-control" rows="3" [(ngModel)]="newReport.description" name="description" required></textarea>
                 </div>
               </div>
             </form>
           </div>
           <div class="modal-footer">
             <button type="button" class="btn btn-secondary" (click)="closeModal('report')">Annuler</button>
             <button type="button" class="btn btn-primary" (click)="generateReport()" [disabled]="!generateReportForm.valid">Générer</button>
           </div>
         </div>
       </div>
     </div>

     <!-- Add User Modal -->
     <div *ngIf="showAddUserModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
       <div class="modal-dialog modal-lg">
         <div class="modal-content">
           <div class="modal-header">
             <h5 class="modal-title">Nouvel Utilisateur</h5>
             <button type="button" class="btn-close" (click)="closeModal('user')"></button>
           </div>
           <div class="modal-body">
             <form #addUserForm="ngForm">
               <div class="row g-3">
                 <div class="col-md-6">
                   <label class="form-label">Nom d'utilisateur</label>
                   <input type="text" class="form-control" [(ngModel)]="newUser.username" name="username" required>
                 </div>
                 <div class="col-md-6">
                   <label class="form-label">Email</label>
                   <input type="email" class="form-control" [(ngModel)]="newUser.email" name="email" required>
                 </div>
                 <div class="col-md-6">
                   <label class="form-label">Rôle</label>
                   <select class="form-select" [(ngModel)]="newUser.role" name="role" required>
                     <option value="">Sélectionner un rôle</option>
                     <option value="ADMIN">Administrateur</option>
                     <option value="AGENT">Agent</option>
                     <option value="VETERINAIRE">Vétérinaire</option>
                   </select>
                 </div>
                 <div class="col-md-6">
                   <label class="form-label">Statut</label>
                   <select class="form-select" [(ngModel)]="newUser.status" name="status" required>
                     <option value="ACTIF">Actif</option>
                     <option value="INACTIF">Inactif</option>
                     <option value="SUSPENDU">Suspendu</option>
                   </select>
                 </div>
               </div>
             </form>
           </div>
           <div class="modal-footer">
             <button type="button" class="btn btn-secondary" (click)="closeModal('user')">Annuler</button>
             <button type="button" class="btn btn-primary" (click)="addUser()" [disabled]="!addUserForm.valid">Créer</button>
           </div>
         </div>
       </div>
     </div>
   `,
  styles: [`
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 280px;
      background: #1e293b;
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      overflow-y: auto;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid #334155;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.25rem;
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      margin: 0;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
    }

    .nav-section {
      margin-bottom: 2rem;
    }

    .nav-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
      padding: 0 1.5rem;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-item {
      margin: 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      color: #cbd5e1;
      text-decoration: none;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .nav-link:hover {
      background: #334155;
      color: white;
    }

    .nav-item.active .nav-link {
      background: #3b82f6;
      color: white;
    }

    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #334155;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      font-size: 2rem;
      color: #94a3b8;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
      color: white;
    }

    .user-role {
      font-size: 0.875rem;
      color: #94a3b8;
    }

    .main-content {
      flex: 1;
      margin-left: 280px;
      background: #f8fafc;
      min-height: 100vh;
    }

    .tab-content {
      padding: 2rem;
    }

    .content-header {
      margin-bottom: 2rem;
    }

    .content-header h2 {
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .stat-card {
      border-radius: 12px;
      border: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .card {
      border-radius: 12px;
      border: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
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

    .badge {
      font-size: 0.8rem;
      padding: 0.5em 0.8em;
      border-radius: 8px;
    }

    .badge.bg-success {
      background-color: #10b981 !important;
    }

    .badge.bg-warning {
      background-color: #f59e0b !important;
    }

    .badge.bg-danger {
      background-color: #ef4444 !important;
    }

    .badge.bg-info {
      background-color: #3b82f6 !important;
    }

    .badge.bg-secondary {
      background-color: #6b7280 !important;
    }
  `]
})
export class DashboardComponent implements OnInit {
  activeTab = 'dashboard';
  dashboardData: any = null;
  loading = false;

  // User role and permissions
  currentUserRole: string = '';
  userPermissions: any = {};

  // Data for different tabs
  products: any[] = [];
  reclamations: any[] = [];
  tasks: any[] = [];
  reports: any[] = [];
  users: any[] = [];

  // Modal states
  showAddProductModal = false;
  showAddReclamationModal = false;
  showAddTaskModal = false;
  showGenerateReportModal = false;
  showAddUserModal = false;

  // New item objects
  newProduct: any = {};
  newReclamation: any = {};
  newTask: any = {};
  newReport: any = {};
  newUser: any = {};

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.initializeUserPermissions();
    this.loadDashboardData();
    this.loadAllData();
  }

  initializeUserPermissions() {
    // Get user role from localStorage or default to 'AGENT'
    this.currentUserRole = this.getCurrentUserRole();

    // Define permissions for each role
    this.userPermissions = {
      ADMIN: {
        canViewDashboard: true,
        canManageProducts: true,
        canManageReclamations: true,
        canManageTasks: true,
        canManageReports: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canManageSettings: true,
        canDelete: true,
        canEdit: true,
        canCreate: true
      },
      AGENT: {
        canViewDashboard: true,
        canManageProducts: true,
        canManageReclamations: true,
        canManageTasks: true,
        canManageReports: true,
        canManageUsers: false,
        canViewAnalytics: false,
        canManageSettings: false,
        canDelete: false,
        canEdit: true,
        canCreate: true
      },
      VETERINAIRE: {
        canViewDashboard: true,
        canManageProducts: false,
        canManageReclamations: true,
        canManageTasks: true,
        canManageReports: true,
        canManageUsers: false,
        canViewAnalytics: false,
        canManageSettings: false,
        canDelete: false,
        canEdit: false,
        canCreate: true
      }
    };
  }

  setActiveTab(tab: string) {
    // Check if user has permission to access this tab
    if (this.hasPermissionForTab(tab)) {
      this.activeTab = tab;
    } else {
      alert('Vous n\'avez pas les permissions nécessaires pour accéder à cette section.');
    }
  }

  hasPermissionForTab(tab: string): boolean {
    const permissions = this.userPermissions[this.currentUserRole];
    if (!permissions) return false;

    switch (tab) {
      case 'dashboard': return permissions.canViewDashboard;
      case 'products': return permissions.canManageProducts;
      case 'reclamations': return permissions.canManageReclamations;
      case 'tasks': return permissions.canManageTasks;
      case 'reports': return permissions.canManageReports;
      case 'users': return permissions.canManageUsers;
      case 'analytics': return permissions.canViewAnalytics;
      case 'settings': return permissions.canManageSettings;
      default: return false;
    }
  }

  canCreate(): boolean {
    return this.userPermissions[this.currentUserRole]?.canCreate || false;
  }

  canEdit(): boolean {
    return this.userPermissions[this.currentUserRole]?.canEdit || false;
  }

  canDelete(): boolean {
    return this.userPermissions[this.currentUserRole]?.canDelete || false;
  }

  loadDashboardData() {
    this.loading = true;

    // Try to get real dashboard data from API
    this.apiService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        // Fallback to mock data if API fails
        this.dashboardData = {
          totalUsers: 25,
          totalProducts: 150,
          totalReclamations: 8,
          totalTasks: 12,
          recentActivity: [
            { description: 'Nouveau produit ajouté', timestamp: new Date() },
            { description: 'Réclamation traitée', timestamp: new Date(Date.now() - 3600000) },
            { description: 'Utilisateur connecté', timestamp: new Date(Date.now() - 7200000) }
          ]
        };
        this.loading = false;
      }
    });
  }

  loadAllData() {
    // Load real data from APIs
    this.loadProducts();
    this.loadReclamations();
    this.loadTasks();
    this.loadReports();
    this.loadUsers();
  }

  loadProducts() {
    this.apiService.listProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        // Fallback to mock data if API fails
        this.products = [
          { id: 1, name: 'Vaccin A', category: 'VACCIN', quantity: 50, minimumThreshold: 10 },
          { id: 2, name: 'Médicament B', category: 'MEDICAMENT_VETERINAIRE', quantity: 5, minimumThreshold: 15 },
          { id: 3, name: 'Aliment C', category: 'ALIMENT_ANIMAL', quantity: 100, minimumThreshold: 20 }
        ];
      }
    });
  }

  loadReclamations() {
    this.apiService.listReclamations().subscribe({
      next: (data) => {
        this.reclamations = data;
      },
      error: (error) => {
        console.error('Error loading reclamations:', error);
        // Fallback to mock data if API fails
        this.reclamations = [
          { id: 1, titre: 'Stock faible', status: 'OUVERTE', product_id: 1 },
          { id: 2, titre: 'Produit expiré', status: 'EN_COURS', product_id: 2 }
        ];
      }
    });
  }

  loadTasks() {
    // For now, use mock data since tasks API might not be fully implemented
    this.tasks = [
      { id: 1, title: 'Vérifier stock', description: 'Vérifier le stock des vaccins', status: 'EN_COURS', dueDate: new Date() },
      { id: 2, title: 'Commander fournitures', description: 'Commander de nouveaux équipements', status: 'A_FAIRE', dueDate: new Date(Date.now() + 86400000) }
    ];
  }

  loadReports() {
    // For now, use mock data since reports API might not be fully implemented
    this.reports = [
      { id: 1, title: 'Rapport Mensuel', description: 'Rapport d\'activité du mois', status: 'TERMINE', createdAt: new Date() },
      { id: 2, title: 'Inventaire', description: 'État des stocks', status: 'EN_COURS', createdAt: new Date(Date.now() - 86400000) }
    ];
  }

  loadUsers() {
    this.apiService.listUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        // Fallback to mock data if API fails
        this.users = [
          { id: 1, username: 'admin', email: 'admin@gsrv.com', role: 'ADMIN', status: 'ACTIF' },
          { id: 2, username: 'agent1', email: 'agent1@gsrv.com', role: 'AGENT', status: 'ACTIF' },
          { id: 3, username: 'vet1', email: 'vet1@gsrv.com', role: 'VETERINAIRE', status: 'ACTIF' }
        ];
      }
    });
  }

  // Product methods
  editProduct(product: any) {
    console.log('Edit product:', product);
  }

  deleteProduct(productId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.apiService.deleteProduct(productId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadProducts(); // Reload products from API
            alert('Produit supprimé avec succès !');
          } else {
            alert('Erreur lors de la suppression: ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Erreur lors de la suppression: ' + error.message);
        }
      });
    }
  }

  getProductStatus(product: any): string {
    if (product.quantity <= product.minimumThreshold) {
      return 'critical';
    }
    return 'normal';
  }

  getProductStatusClass(product: any): string {
    const status = this.getProductStatus(product);
    switch (status) {
      case 'critical': return 'bg-danger';
      default: return 'bg-success';
    }
  }

  // Reclamation methods
  viewReclamation(reclamation: any) {
    console.log('View reclamation:', reclamation);
  }

  updateReclamationStatus(reclamationId: number, status: string) {
    this.apiService.updateReclamationStatus(reclamationId, status as any).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadReclamations(); // Reload reclamations from API
          alert('Statut de la réclamation mis à jour avec succès !');
        } else {
          alert('Erreur lors de la mise à jour: ' + response.message);
        }
      },
      error: (error) => {
        console.error('Error updating reclamation status:', error);
        alert('Erreur lors de la mise à jour: ' + error.message);
      }
    });
  }

  getReclamationStatusClass(status: string): string {
    switch (status) {
      case 'OUVERTE': return 'bg-warning';
      case 'EN_COURS': return 'bg-info';
      case 'TRAITEE': return 'bg-success';
      case 'REJETEE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  // Task methods
  completeTask(taskId: number) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'TERMINE';
    }
  }

  editTask(task: any) {
    console.log('Edit task:', task);
  }

  deleteTask(taskId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
    }
  }

  getTaskStatusClass(status: string): string {
    switch (status) {
      case 'A_FAIRE': return 'bg-warning';
      case 'EN_COURS': return 'bg-info';
      case 'TERMINE': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  // Report methods
  viewReport(report: any) {
    console.log('View report:', report);
  }

  downloadReport(report: any) {
    console.log('Download report:', report);
  }

  getReportStatusClass(status: string): string {
    switch (status) {
      case 'EN_COURS': return 'bg-warning';
      case 'TERMINE': return 'bg-success';
      case 'ERREUR': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  // User methods
  editUser(user: any) {
    console.log('Edit user:', user);
  }

  deleteUser(userId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.apiService.deleteUser(userId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers(); // Reload users from API
            alert('Utilisateur supprimé avec succès !');
          } else {
            alert('Erreur lors de la suppression: ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Erreur lors de la suppression: ' + error.message);
        }
      });
    }
  }

  getUserRoleClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-danger';
      case 'AGENT': return 'bg-info';
      case 'VETERINAIRE': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  getUserStatusClass(status: string): string {
    switch (status) {
      case 'ACTIF': return 'bg-success';
      case 'INACTIF': return 'bg-secondary';
      case 'SUSPENDU': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  // Utility methods
  getCurrentUserName(): string {
    // Get from localStorage or default
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.username || 'Utilisateur';
        } catch {
          return 'Utilisateur';
        }
      }
    }
    return 'Utilisateur';
  }

  getCurrentUserRole(): string {
    // Get from localStorage or default to 'AGENT' for security
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.role || 'AGENT';
        } catch {
          return 'AGENT';
        }
      }
    }
    return 'AGENT';
  }

  getUserRoleDisplayName(): string {
    switch (this.currentUserRole) {
      case 'ADMIN': return 'Administrateur';
      case 'AGENT': return 'Agent';
      case 'VETERINAIRE': return 'Vétérinaire';
      default: return 'Utilisateur';
    }
  }

  showPermissionInfo() {
    const role = this.getUserRoleDisplayName();
    const permissions = this.userPermissions[this.currentUserRole];

    let message = `Rôle: ${role}\n\nPermissions:\n`;
    message += `• Tableau de bord: ${permissions.canViewDashboard ? '✅' : '❌'}\n`;
    message += `• Produits: ${permissions.canManageProducts ? '✅' : '❌'}\n`;
    message += `• Réclamations: ${permissions.canManageReclamations ? '✅' : '❌'}\n`;
    message += `• Tâches: ${permissions.canManageTasks ? '✅' : '❌'}\n`;
    message += `• Rapports: ${permissions.canManageReports ? '✅' : '❌'}\n`;
    message += `• Utilisateurs: ${permissions.canManageUsers ? '✅' : '❌'}\n`;
    message += `• Analytics: ${permissions.canViewAnalytics ? '✅' : '❌'}\n`;
    message += `• Paramètres: ${permissions.canManageSettings ? '✅' : '❌'}\n`;
    message += `• Créer: ${permissions.canCreate ? '✅' : '❌'}\n`;
    message += `• Modifier: ${permissions.canEdit ? '✅' : '❌'}\n`;
    message += `• Supprimer: ${permissions.canDelete ? '✅' : '❌'}`;

    alert(message);
  }

  formatDate(date: string | Date): string {
    if (!date) return '';

    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Modal management methods
  closeModal(type: string) {
    switch (type) {
      case 'product':
        this.showAddProductModal = false;
        this.newProduct = {};
        break;
      case 'reclamation':
        this.showAddReclamationModal = false;
        this.newReclamation = {};
        break;
      case 'task':
        this.showAddTaskModal = false;
        this.newTask = {};
        break;
      case 'report':
        this.showGenerateReportModal = false;
        this.newReport = {};
        break;
      case 'user':
        this.showAddUserModal = false;
        this.newUser = {};
        break;
    }
  }

  // Add methods
  addProduct() {
    if (this.newProduct.name && this.newProduct.category && this.newProduct.quantity !== undefined && this.newProduct.minimumThreshold !== undefined) {
      const productPayload = {
        name: this.newProduct.name,
        category: this.newProduct.category,
        quantity: parseInt(this.newProduct.quantity),
        minimumThreshold: parseInt(this.newProduct.minimumThreshold)
      };

      this.apiService.createProduct(productPayload).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadProducts(); // Reload products from API
            this.closeModal('product');
            alert('Produit ajouté avec succès !');
          } else {
            alert('Erreur lors de l\'ajout du produit: ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error creating product:', error);
          alert('Erreur lors de l\'ajout du produit: ' + error.message);
        }
      });
    }
  }

  addReclamation() {
    if (this.newReclamation.titre && this.newReclamation.product_id && this.newReclamation.description) {
      const reclamationPayload = {
        titre: this.newReclamation.titre,
        productId: parseInt(this.newReclamation.product_id),
        userId: 1, // TODO: Get from current user context
        reason: this.newReclamation.description,
        observedQuantity: 0 // TODO: Add field for this
      };

      this.apiService.createReclamation(reclamationPayload).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadReclamations(); // Reload reclamations from API
            this.closeModal('reclamation');
            alert('Réclamation créée avec succès !');
          } else {
            alert('Erreur lors de la création: ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error creating reclamation:', error);
          alert('Erreur lors de la création: ' + error.message);
        }
      });
    }
  }

  addTask() {
    if (this.newTask.title && this.newTask.description && this.newTask.dueDate) {
      const task = {
        id: this.tasks.length + 1,
        title: this.newTask.title,
        description: this.newTask.description,
        dueDate: new Date(this.newTask.dueDate),
        status: 'A_FAIRE'
      };
      this.tasks.push(task);
      this.closeModal('task');
      alert('Tâche créée avec succès !');
    }
  }

  generateReport() {
    if (this.newReport.title && this.newReport.type && this.newReport.description) {
      const report = {
        id: this.reports.length + 1,
        title: this.newReport.title,
        type: this.newReport.type,
        description: this.newReport.description,
        status: 'EN_COURS',
        createdAt: new Date()
      };
      this.reports.push(report);
      this.closeModal('report');
      alert('Rapport généré avec succès !');
    }
  }

  addUser() {
    if (this.newUser.username && this.newUser.email && this.newUser.role) {
      const userPayload = {
        username: this.newUser.username,
        email: this.newUser.email,
        role: this.newUser.role,
        password: 'defaultPassword123' // TODO: Add password field to form
      };

      this.apiService.createUser(userPayload).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers(); // Reload users from API
            this.closeModal('user');
            alert('Utilisateur créé avec succès !');
          } else {
            alert('Erreur lors de la création: ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error creating user:', error);
          alert('Erreur lors de la création: ' + error.message);
        }
      });
    }
  }
}
