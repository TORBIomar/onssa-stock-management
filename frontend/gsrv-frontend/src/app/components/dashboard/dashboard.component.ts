import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Subscription } from 'rxjs';

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
            <h1 class="logo-text">ONSSA SM</h1>
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
        <!-- Header -->
        <header class="content-header">
          <div class="header-content">
            <div class="page-title">
              <h2>{{ getPageTitle() }}</h2>
              <p class="text-muted">{{ getPageDescription() }}</p>
            </div>
            <div class="header-actions">
              <button class="btn btn-outline-secondary btn-sm" (click)="refreshData()" [disabled]="loading">
                <i class="bi bi-arrow-clockwise me-2"></i>Actualiser
              </button>
              <button class="btn btn-outline-danger btn-sm" (click)="logout()">
                <i class="bi bi-box-arrow-right me-2"></i>Déconnexion
              </button>
            </div>
          </div>
        </header>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-container">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
          <p class="mt-3 text-muted">Chargement des données...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && error" class="error-container">
          <div class="alert alert-danger" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ error }}
          </div>
          <button class="btn btn-primary" (click)="refreshData()">
            <i class="bi bi-arrow-clockwise me-2"></i>Réessayer
          </button>
        </div>

        <!-- Content Area -->
        <div *ngIf="!loading && !error" class="content-area">
          <!-- Dashboard Overview -->
          <div *ngIf="activeTab === 'dashboard'" class="dashboard-overview">
            <div class="row g-4">
              <!-- Statistics Cards -->
              <div class="col-md-3">
                <div class="stat-card bg-primary text-white">
                  <div class="stat-icon">
                    <i class="bi bi-people"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ dashboardData?.totalUsers || 0 }}</h3>
                    <p>Utilisateurs</p>
                  </div>
                </div>
              </div>
              
              <div class="col-md-3">
                <div class="stat-card bg-success text-white">
                  <div class="stat-icon">
                    <i class="bi bi-box-seam"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ dashboardData?.totalProducts || 0 }}</h3>
                    <p>Produits</p>
                  </div>
                </div>
              </div>
              
              <div class="col-md-3">
                <div class="stat-card bg-warning text-dark">
                  <div class="stat-icon">
                    <i class="bi bi-exclamation-triangle"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ dashboardData?.totalReclamations || 0 }}</h3>
                    <p>Réclamations</p>
                  </div>
                </div>
              </div>
              
              <div class="col-md-3">
                <div class="stat-card bg-info text-white">
                  <div class="stat-icon">
                    <i class="bi bi-list-task"></i>
                  </div>
                  <div class="stat-content">
                    <h3>{{ dashboardData?.totalTasks || 0 }}</h3>
                    <p>Tâches</p>
                  </div>
                </div>
              </div>

              <!-- Recent Activity -->
              <div class="col-12">
                <div class="card">
                  <div class="card-header">
                    <h5><i class="bi bi-activity me-2"></i>Activité Récente</h5>
                  </div>
                  <div class="card-body">
                    <div *ngIf="dashboardData?.recentActivity?.length; else noActivity" class="activity-list">
                      <div *ngFor="let activity of dashboardData.recentActivity" class="activity-item">
                        <div class="activity-icon">
                          <i class="bi" [class]="getActivityIcon(activity.type)"></i>
                        </div>
                        <div class="activity-content">
                          <p class="activity-text">{{ activity.description }}</p>
                          <small class="activity-time">{{ formatDate(activity.timestamp) }}</small>
                        </div>
                      </div>
                    </div>
                    <ng-template #noActivity>
                      <p class="text-muted text-center">Aucune activité récente</p>
                    </ng-template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Other Tab Content -->
          <div *ngIf="activeTab !== 'dashboard'" class="tab-content">
            <div class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              Contenu pour l'onglet "{{ getPageTitle() }}" - Navigation vers la page dédiée
            </div>
            <button class="btn btn-primary" (click)="navigateToPage()">
              <i class="bi bi-arrow-right me-2"></i>Aller à la page
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container"></div>
  `,
  styles: [`
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .sidebar {
      width: 280px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem;
      display: flex;
      flex-direction: column;
    }

    .sidebar-header {
      margin-bottom: 2rem;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-icon {
      font-size: 2rem;
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
    }

    .nav-section {
      margin-bottom: 2rem;
    }

    .nav-title {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 1rem;
      opacity: 0.8;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-item {
      margin-bottom: 0.5rem;
    }

    .nav-link {
      width: 100%;
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      color: white;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateX(5px);
    }

    .nav-item.active .nav-link {
      background: rgba(255, 255, 255, 0.2);
      font-weight: 600;
    }

    .sidebar-footer {
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .user-avatar {
      font-size: 2rem;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
    }

    .user-role {
      font-size: 0.875rem;
      opacity: 0.8;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    .content-header {
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .page-title h2 {
      margin: 0;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .stat-card {
      padding: 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }

    .stat-icon {
      font-size: 2rem;
    }

    .stat-content h3 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .stat-content p {
      margin: 0;
      opacity: 0.9;
    }

    .card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .activity-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #eee;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      background: #f8f9fa;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #667eea;
    }

    .activity-content {
      flex: 1;
    }

    .activity-text {
      margin: 0;
      font-weight: 500;
    }

    .activity-time {
      color: #6c757d;
    }

    /* Toast Notifications */
    .toast-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
      max-width: 400px;
    }

    .toast-notification.success {
      background: linear-gradient(135deg, #28a745, #20c997);
    }

    .toast-notification.error {
      background: linear-gradient(135deg, #dc3545, #fd7e14);
    }

    .toast-content {
      display: flex;
      align-items: center;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  activeTab = 'dashboard';
  loading = false;
  error: string | null = null;
  dashboardData: any = null;
  private subscriptions = new Subscription();

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Load dashboard data immediately
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadDashboardData() {
    this.loading = true;
    this.error = null;
    console.log('🔄 Loading dashboard data...');

    this.subscriptions.add(
      this.api.getData().subscribe({
        next: (data) => {
          console.log('✅ Dashboard data loaded successfully:', data);
          this.dashboardData = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Error loading dashboard data:', error);
          this.error = error.message || 'Erreur lors du chargement des données';
          this.loading = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  refreshData() {
    this.loadDashboardData();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getPageTitle(): string {
    const titles: { [key: string]: string } = {
      'dashboard': 'Tableau de Bord',
      'products': 'Gestion des Produits',
      'reclamations': 'Gestion des Réclamations',
      'tasks': 'Gestion des Tâches',
      'reports': 'Rapports',
      'users': 'Gestion des Utilisateurs',
      'analytics': 'Analytics',
      'settings': 'Paramètres'
    };
    return titles[this.activeTab] || 'Page';
  }

  getPageDescription(): string {
    const descriptions: { [key: string]: string } = {
      'dashboard': 'Vue d\'ensemble du système',
      'products': 'Gérer l\'inventaire des produits',
      'reclamations': 'Traiter les réclamations',
      'tasks': 'Gérer les tâches et activités',
      'reports': 'Générer et consulter les rapports',
      'users': 'Gérer les comptes utilisateurs',
      'analytics': 'Analyses et statistiques',
      'settings': 'Configuration du système'
    };
    return descriptions[this.activeTab] || '';
  }

  hasPermissionForTab(tab: string): boolean {
    const user = this.api.getCurrentUser();
    if (!user) return false;

    const permissions: { [key: string]: string[] } = {
      'products': ['ADMIN', 'AGENT'],
      'reclamations': ['ADMIN', 'AGENT'],
      'tasks': ['ADMIN', 'AGENT'],
      'reports': ['ADMIN', 'AGENT'],
      'users': ['ADMIN'],
      'analytics': ['ADMIN'],
      'settings': ['ADMIN']
    };

    return permissions[tab]?.includes(user.role) || false;
  }

  getCurrentUserName(): string {
    const user = this.api.getCurrentUser();
    return user?.username || 'Utilisateur';
  }

  getUserRoleDisplayName(): string {
    const user = this.api.getCurrentUser();
    const roles: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'AGENT': 'Agent'
    };
    return roles[user?.role] || 'Utilisateur';
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'user': 'bi-person',
      'product': 'bi-box',
      'reclamation': 'bi-exclamation-triangle',
      'task': 'bi-list-task',
      'system': 'bi-gear'
    };
    return icons[type] || 'bi-circle';
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  showPermissionInfo() {
    this.showSuccessMessage('Vos permissions ont été vérifiées');
  }

  navigateToPage() {
    this.showSuccessMessage('Navigation vers la page ' + this.getPageTitle());
  }

  logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.api.logout();
      this.showSuccessMessage('Déconnexion réussie');
      // Redirect to login page
      window.location.href = '/login';
    }
  }

  // Utility methods
  showSuccessMessage(message: string) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification success';
    toast.innerHTML = `
      <div class="toast-content">
        <i class="bi bi-check-circle me-2"></i>
        ${message}
      </div>
    `;
    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }

  showErrorMessage(message: string) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification error';
    toast.innerHTML = `
      <div class="toast-content">
        <i class="bi bi-exclamation-triangle me-2"></i>
        ${message}
      </div>
    `;
    document.body.appendChild(toast);

    // Remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 5000);
  }
}
