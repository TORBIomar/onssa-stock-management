import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div class="header-content">
          <div class="brand-section">
            <div class="brand-icon">
              <i class="bi bi-shield-check"></i>
            </div>
            <div class="brand-text">
              <h1 class="brand-title">GSRV System</h1>
              <p class="brand-subtitle">Agent Dashboard</p>
            </div>
          </div>
          
          <div class="user-section">
            <div class="user-info">
              <div class="user-avatar">
                <i class="bi bi-person-circle"></i>
              </div>
              <div class="user-details">
                <span class="username">{{ getCurrentUser()?.username }}</span>
                <span class="user-role">{{ getCurrentUser()?.role }}</span>
              </div>
            </div>
            <button class="logout-btn" (click)="logout()">
              <i class="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-icon">
              <i class="bi bi-box"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ dashboardData?.totalProducts || 0 }}</h3>
              <p class="stat-label">Produits</p>
            </div>
          </div>

          <div class="stat-card warning">
            <div class="stat-icon">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ dashboardData?.totalReclamations || 0 }}</h3>
              <p class="stat-label">Réclamations</p>
            </div>
          </div>

          <div class="stat-card danger">
            <div class="stat-icon">
              <i class="bi bi-exclamation-circle"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ dashboardData?.lowStockCount || 0 }}</h3>
              <p class="stat-label">Stock Faible</p>
            </div>
          </div>
        </div>

        <div class="actions-section">
          <h2 class="section-title">Actions Rapides</h2>
          <div class="actions-grid">
            <div class="action-card" routerLink="/products">
              <div class="action-icon products">
                <i class="bi bi-box"></i>
              </div>
              <div class="action-content">
                <h3>Gestion Produits</h3>
                <p>Surveiller les stocks et inventaire</p>
              </div>
              <div class="action-arrow">
                <i class="bi bi-arrow-right"></i>
              </div>
            </div>

            <div class="action-card" routerLink="/reclamations">
              <div class="action-icon reclamations">
                <i class="bi bi-exclamation-triangle"></i>
              </div>
              <div class="action-content">
                <h3>Réclamations</h3>
                <p>Traiter les demandes en attente</p>
              </div>
              <div class="action-arrow">
                <i class="bi bi-arrow-right"></i>
              </div>
            </div>

            <div class="action-card" routerLink="/reports">
              <div class="action-icon reports">
                <i class="bi bi-file-earmark-text"></i>
              </div>
              <div class="action-content">
                <h3>Rapports</h3>
                <p>Générer et consulter les rapports</p>
              </div>
              <div class="action-arrow">
                <i class="bi bi-arrow-right"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .dashboard-header {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding: 1rem 0;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .brand-icon {
      font-size: 2.5rem;
      color: #fff;
    }

    .brand-title {
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
    }

    .brand-subtitle {
      margin: 0;
      opacity: 0.8;
      font-size: 0.9rem;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .user-avatar {
      font-size: 2rem;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .username {
      font-weight: 600;
      font-size: 1rem;
    }

    .user-role {
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .logout-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    .dashboard-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .stat-card.primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .stat-card.warning { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .stat-card.danger { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }

    .stat-icon {
      font-size: 3rem;
      opacity: 0.8;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
    }

    .stat-label {
      margin: 0;
      opacity: 0.8;
      font-size: 1rem;
    }

    .actions-section {
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 1.8rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: white;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.2);
      text-decoration: none;
      color: white;
    }

    .action-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      background: rgba(255, 255, 255, 0.15);
    }

    .action-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
    }

    .action-icon.products { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
    .action-icon.reclamations { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .action-icon.reports { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

    .action-content {
      flex: 1;
    }

    .action-content h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .action-content p {
      margin: 0;
      opacity: 0.8;
      font-size: 0.9rem;
    }

    .action-arrow {
      font-size: 1.5rem;
      opacity: 0.6;
      transition: all 0.3s ease;
    }

    .action-card:hover .action-arrow {
      opacity: 1;
      transform: translateX(5px);
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-content {
        padding: 1rem;
      }
    }
  `]
})
export class AgentDashboardComponent implements OnInit {
  dashboardData: any = null;

  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.api.getDashboardData().subscribe({
      next: (data) => {
        if (data && data.stats) {
          this.dashboardData = {
            totalProducts: data.stats.totalProducts || 0,
            totalReclamations: data.stats.totalReclamations || 0,
            lowStockCount: data.stats.criticalProducts || 0
          };
        } else {
          this.dashboardData = data || {
            totalProducts: 0,
            totalReclamations: 0,
            lowStockCount: 0
          };
        }
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.dashboardData = {
          totalProducts: 1,
          totalReclamations: 0,
          lowStockCount: 0
        };
      }
    });
  }

  getCurrentUser(): any {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('auth_user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  logout(): void {
    this.api.logout();
    window.location.href = '/login';
  }
}


