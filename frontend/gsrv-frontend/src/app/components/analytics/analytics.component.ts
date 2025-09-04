import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 mb-0 gradient-text">
            <i class="bi bi-graph-up me-2"></i>Analytics & Rapports
          </h2>
          <p class="text-muted">Analyse complète des données et performances du système</p>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline-primary btn-sm" (click)="refreshData()">
            <i class="bi bi-arrow-clockwise me-2"></i>Actualiser
          </button>
          <button class="btn btn-primary btn-sm" (click)="exportReport()">
            <i class="bi bi-download me-2"></i>Exporter
          </button>
        </div>
      </div>

      <!-- Analytics Content -->
      <div class="row g-4">
        
        <!-- Stock Analytics -->
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0"><i class="bi bi-box me-2"></i>Analytics des Stocks</h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <div class="text-center">
                    <h3 class="text-primary">{{ analytics.stockAnalytics?.totalProducts || 0 }}</h3>
                    <p class="text-muted mb-0">Total Produits</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <h3 class="text-warning">{{ analytics.stockAnalytics?.lowStockCount || 0 }}</h3>
                    <p class="text-muted mb-0">Stock Faible</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <h3 class="text-danger">{{ analytics.stockAnalytics?.criticalStockCount || 0 }}</h3>
                    <p class="text-muted mb-0">Stock Critique</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <h3 class="text-info">{{ analytics.stockAnalytics?.expiringProducts || 0 }}</h3>
                    <p class="text-muted mb-0">Expirant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reclamation Analytics -->
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0"><i class="bi bi-exclamation-triangle me-2"></i>Analytics des Réclamations</h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <div class="text-center">
                    <h3 class="text-success">{{ analytics.reclamationAnalytics?.totalReclamations || 0 }}</h3>
                    <p class="text-muted mb-0">Total</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <h3 class="text-warning">{{ analytics.reclamationAnalytics?.openReclamations || 0 }}</h3>
                    <p class="text-muted mb-0">Ouvertes</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <h3 class="text-info">{{ analytics.reclamationAnalytics?.inProgressReclamations || 0 }}</h3>
                    <p class="text-muted mb-0">En Cours</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <h3 class="text-success">{{ analytics.reclamationAnalytics?.resolvedReclamations || 0 }}</h3>
                    <p class="text-muted mb-0">Résolues</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Analytics -->
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-info text-white">
              <h5 class="mb-0"><i class="bi bi-people me-2"></i>Analytics des Utilisateurs</h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <div class="text-center">
                    <h3 class="text-info">{{ analytics.userAnalytics?.totalUsers || 0 }}</h3>
                    <p class="text-muted mb-0">Total Utilisateurs</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <h3 class="text-success">{{ analytics.userAnalytics?.activeUsers || 0 }}</h3>
                    <p class="text-muted mb-0">Actifs</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <h3 class="text-warning">{{ analytics.userAnalytics?.inactiveUsers || 0 }}</h3>
                    <p class="text-muted mb-0">Inactifs</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <h3 class="text-primary">{{ analytics.userAnalytics?.usersByRole?.ADMIN || 0 }}</h3>
                    <p class="text-muted mb-0">Administrateurs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-warning text-dark">
              <h5 class="mb-0"><i class="bi bi-speedometer2 me-2"></i>Métriques de Performance</h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <div class="text-center">
                    <h3 class="text-warning">{{ analytics.performanceMetrics?.stockUtilization || 'N/A' }}</h3>
                    <p class="text-muted mb-0">Utilisation Stock</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <h3 class="text-info">{{ analytics.performanceMetrics?.complianceRate || 'N/A' }}</h3>
                    <p class="text-muted mb-0">Taux de Conformité</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <h3 class="text-success">{{ analytics.performanceMetrics?.systemUptime || 'N/A' }}</h3>
                    <p class="text-muted mb-0">Disponibilité</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <h3 class="text-primary">{{ analytics.performanceMetrics?.dataAccuracy || 'N/A' }}</h3>
                    <p class="text-muted mb-0">Précision Données</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header">
              <h6 class="mb-0">Réclamations par Statut</h6>
            </div>
            <div class="card-body">
              <div class="chart-container" style="height: 200px;">
                <div *ngFor="let item of getReclamationStatusData()" class="mb-2">
                  <div class="d-flex justify-content-between align-items-center">
                    <span>{{ item.status }}</span>
                    <span class="badge bg-primary">{{ item.count }}</span>
                  </div>
                  <div class="progress" style="height: 8px;">
                    <div class="progress-bar" [style.width.%]="getPercentage(item.count)"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header">
              <h6 class="mb-0">Produits par Catégorie</h6>
            </div>
            <div class="card-body">
              <div class="chart-container" style="height: 200px;">
                <div *ngFor="let item of getProductCategoryData()" class="mb-2">
                  <div class="d-flex justify-content-between align-items-center">
                    <span>{{ item.category }}</span>
                    <span class="badge bg-success">{{ item.count }}</span>
                  </div>
                  <div class="progress" style="height: 8px;">
                    <div class="progress-bar bg-success" [style.width.%]="getPercentage(item.count)"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Error State -->
      <div *ngIf="!analytics" class="text-center py-5">
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Erreur lors du chargement des données. Veuillez réessayer.
        </div>
        <button class="btn btn-primary" (click)="refreshData()">
          <i class="bi bi-arrow-clockwise me-2"></i>Réessayer
        </button>
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
    
    .card {
      border-radius: 12px;
      border: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    }
    
    .card-header {
      border-radius: 12px 12px 0 0 !important;
      border: none;
    }
    
    .progress {
      border-radius: 10px;
      background-color: #e9ecef;
    }
    
    .progress-bar {
      border-radius: 10px;
      transition: width 0.6s ease;
    }
    
    .badge {
      font-size: 0.8rem;
      padding: 0.5em 0.8em;
      border-radius: 8px;
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
  `]
})
export class AnalyticsComponent implements OnInit {
  analytics: any = null;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.api.getAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        this.cdr.detectChanges(); // Detect changes after loading analytics
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.cdr.detectChanges(); // Detect changes after error
      }
    });
  }

  refreshData() {
    this.loadAnalytics();
  }

  exportReport() {
    // Implementation for exporting reports
    alert('Fonctionnalité d\'export en cours de développement');
  }

  getReclamationStatusData() {
    if (!this.analytics?.reclamationAnalytics?.reclamationsByStatus) return [];

    return Object.entries(this.analytics.reclamationAnalytics.reclamationsByStatus).map(([status, count]) => ({
      status,
      count: count as number
    }));
  }

  getProductCategoryData() {
    if (!this.analytics?.stockAnalytics?.productsByCategory) return [];

    return Object.entries(this.analytics.stockAnalytics.productsByCategory).map(([status, count]) => ({
      category: status,
      count: count as number
    }));
  }

  getPercentage(count: number): number {
    if (!this.analytics) return 0;

    const total = this.analytics.stockAnalytics?.totalProducts || 1;
    return Math.round((count / total) * 100);
  }
}
