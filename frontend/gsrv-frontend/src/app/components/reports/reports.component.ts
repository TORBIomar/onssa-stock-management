import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="fas fa-chart-bar me-2"></i>Rapports</h2>
            <button class="btn btn-primary" (click)="showGenerateReportModal = true">
              <i class="fas fa-plus me-2"></i>Nouveau Rapport
            </button>
          </div>

          <!-- Error and Success Messages -->
          <div *ngIf="error" class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ error }}
            <button type="button" class="btn-close" (click)="error = ''"></button>
          </div>

          <div *ngIf="success" class="alert alert-success alert-dismissible fade show mb-4" role="alert">
            <i class="fas fa-check-circle me-2"></i>
            {{ success }}
            <button type="button" class="btn-close" (click)="success = ''"></button>
          </div>

          <!-- Filters -->
          <div class="card mb-4">
            <div class="card-body">
              <div class="row">
                <div class="col-md-3">
                  <label class="form-label">Type de rapport</label>
                  <select class="form-select" [(ngModel)]="filters.type">
                    <option value="">Tous les types</option>
                    <option value="STOCK">Stock</option>
                    <option value="RECLAMATIONS">Réclamations</option>
                    <option value="UTILISATEURS">Utilisateurs</option>
                    <option value="PERFORMANCE">Performance</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Statut</label>
                  <select class="form-select" [(ngModel)]="filters.status">
                    <option value="">Tous les statuts</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINE">Terminé</option>
                    <option value="ERREUR">Erreur</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Date de début</label>
                  <input type="date" class="form-control" [(ngModel)]="filters.startDate">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Date de fin</label>
                  <input type="date" class="form-control" [(ngModel)]="filters.endDate">
                </div>
              </div>
              <div class="row mt-3">
                <div class="col-12">
                  <button class="btn btn-secondary me-2" (click)="applyFilters()">
                    <i class="fas fa-filter me-2"></i>Appliquer les filtres
                  </button>
                  <button class="btn btn-outline-secondary" (click)="clearFilters()">
                    <i class="fas fa-times me-2"></i>Effacer
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Reports List -->
          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Nom</th>
                      <th>Statut</th>
                      <th>Créé le</th>
                      <th>Terminé le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let report of reports" [class.table-warning]="report.status === 'EN_COURS'">
                      <td>{{ report.id }}</td>
                      <td>
                        <span class="badge bg-info">{{ report.type }}</span>
                      </td>
                      <td>{{ report.title }}</td>
                      <td>
                        <span class="badge" [class]="getStatusClass(report.status)">
                          {{ getStatusLabel(report.status) }}
                        </span>
                      </td>
                      <td>{{ report.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td>{{ report.completedAt ? (report.completedAt | date:'dd/MM/yyyy HH:mm') : '-' }}</td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary" 
                                  (click)="viewReport(report)"
                                  [disabled]="report.status !== 'TERMINE'">
                            <i class="fas fa-eye"></i>
                          </button>
                          <button class="btn btn-outline-success" 
                                  (click)="downloadReport(report, 'pdf')"
                                  [disabled]="report.status !== 'TERMINE'">
                            <i class="fas fa-file-pdf"></i>
                          </button>
                          <button class="btn btn-outline-info" 
                                  (click)="downloadReport(report, 'excel')"
                                  [disabled]="report.status !== 'TERMINE'">
                            <i class="fas fa-file-excel"></i>
                          </button>
                          <button class="btn btn-outline-danger" 
                                  (click)="deleteReport(report.id)">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div *ngIf="reports.length === 0" class="text-center py-4">
                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                <p class="text-muted">Aucun rapport trouvé</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Generate Report Modal -->
    <div class="modal fade" [class.show]="showGenerateReportModal" [style.display]="showGenerateReportModal ? 'block' : 'none'">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Générer un nouveau rapport</h5>
            <button type="button" class="btn-close" (click)="showGenerateReportModal = false"></button>
          </div>
          <div class="modal-body">
            <form [formGroup]="reportForm">
              <div class="mb-3">
                <label class="form-label">Type de rapport *</label>
                <select class="form-select" formControlName="type" required>
                  <option value="">Sélectionner un type</option>
                  <option value="STOCK">Rapport de stock</option>
                  <option value="RECLAMATIONS">Rapport de réclamations</option>
                  <option value="UTILISATEURS">Rapport d'utilisateurs</option>
                  <option value="PERFORMANCE">Rapport de performance</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Titre du rapport *</label>
                <input type="text" class="form-control" formControlName="title" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" formControlName="description" rows="3"></textarea>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <label class="form-label">Date de début</label>
                  <input type="date" class="form-control" formControlName="startDate">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Date de fin</label>
                  <input type="date" class="form-control" formControlName="endDate">
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="showGenerateReportModal = false">Annuler</button>
            <button type="button" class="btn btn-primary" (click)="generateReport()" [disabled]="!reportForm.valid || generating">
              <span *ngIf="!generating">
                <i class="fas fa-file-alt me-2"></i>Générer
              </span>
              <span *ngIf="generating">
                <i class="fas fa-spinner fa-spin me-2"></i>Génération en cours...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Details Modal -->
    <div class="modal fade" [class.show]="showReportDetailsModal" [style.display]="showReportDetailsModal ? 'block' : 'none'">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Détails du rapport</h5>
            <button type="button" class="btn-close" (click)="showReportDetailsModal = false"></button>
          </div>
          <div class="modal-body">
            <div *ngIf="selectedReport">
              <div class="row mb-3">
                <div class="col-md-6">
                  <strong>Type:</strong> {{ selectedReport.type }}
                </div>
                <div class="col-md-6">
                  <strong>Statut:</strong> 
                  <span class="badge" [class]="getStatusClass(selectedReport.status)">
                    {{ getStatusLabel(selectedReport.status) }}
                  </span>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <strong>Créé le:</strong> {{ selectedReport.createdAt | date:'dd/MM/yyyy HH:mm' }}
                </div>
                <div class="col-md-6">
                  <strong>Terminé le:</strong> {{ selectedReport.completedAt ? (selectedReport.completedAt | date:'dd/MM/yyyy HH:mm') : '-' }}
                </div>
              </div>
              <div class="mb-3">
                <strong>Description:</strong>
                <p>{{ selectedReport.description || 'Aucune description' }}</p>
              </div>
              
              <!-- Report Content -->
              <div *ngIf="selectedReport.content" class="mt-4">
                <h6>Contenu du rapport:</h6>
                <div class="border rounded p-3 bg-light">
                  <pre>{{ selectedReport.content | json }}</pre>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="showReportDetailsModal = false">Fermer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div class="modal-backdrop fade show" *ngIf="showGenerateReportModal || showReportDetailsModal"></div>
  `,
  styles: [`
    .modal-backdrop {
      z-index: 1040;
    }
    .modal {
      z-index: 1050;
    }
    .table th {
      border-top: none;
      font-weight: 600;
    }
    .badge {
      font-size: 0.75em;
    }
    .btn-group .btn {
      margin-right: 2px;
    }
  `]
})
export class ReportsComponent implements OnInit {
  reports: any[] = [];
  filters: any = {
    type: '',
    status: '',
    startDate: '',
    endDate: ''
  };

  showGenerateReportModal = false;
  showReportDetailsModal = false;
  selectedReport: any = null;
  generating = false;
  error: string = '';
  success: string = '';

  reportForm!: FormGroup;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.reportForm = this.fb.group({
      type: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.apiService.getAllReports().subscribe({
      next: (data) => {
        this.reports = data;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        console.error('Erreur lors du chargement des rapports');
        // Fallback to mock data if API fails
        this.loadMockReports();
      }
    });
  }

  loadMockReports() {
    this.reports = [
      {
        id: 1,
        type: 'STOCK',
        title: 'Rapport de stock mensuel',
        status: 'TERMINE',
        createdAt: new Date('2024-01-15'),
        completedAt: new Date('2024-01-15T10:30:00'),
        description: 'Rapport mensuel de l\'état du stock'
      },
      {
        id: 2,
        type: 'RECLAMATIONS',
        title: 'Rapport des réclamations',
        status: 'EN_COURS',
        createdAt: new Date('2024-01-16'),
        completedAt: null,
        description: 'Analyse des réclamations du mois'
      },
      {
        id: 3,
        type: 'UTILISATEURS',
        title: 'Rapport des utilisateurs actifs',
        status: 'TERMINE',
        createdAt: new Date('2024-01-14'),
        completedAt: new Date('2024-01-14T14:20:00'),
        description: 'Statistiques des utilisateurs actifs'
      }
    ];
  }

  applyFilters() {
    // Apply filters to the reports list
    this.loadReports(); // In a real app, you'd pass filters to the API
  }

  clearFilters() {
    this.filters = {
      type: '',
      status: '',
      startDate: '',
      endDate: ''
    };
    this.loadReports();
  }

  generateReport() {
    if (this.reportForm.valid) {
      this.generating = true;
      this.error = '';

      const reportData = {
        title: this.reportForm.get('title')?.value,
        description: this.reportForm.get('description')?.value,
        status: 'EN_COURS'
      };

      console.log('Generating report with data:', reportData);

      this.apiService.generateReport(this.reportForm.get('type')?.value, reportData).subscribe({
        next: (response) => {
          console.log('Report generated successfully:', response);
          this.generating = false;
          this.showGenerateReportModal = false;
          this.loadReports(); // Refresh the reports list
          this.success = 'Rapport généré avec succès!';
          setTimeout(() => this.success = '', 5000);
        },
        error: (error) => {
          console.error('Error generating report:', error);
          this.generating = false;
          this.error = this.getErrorMessage(error);
          setTimeout(() => this.error = '', 10000);
        }
      });
    }
  }

  resetForm() {
    this.reportForm.reset();
  }

  viewReport(report: any) {
    this.selectedReport = report;
    this.showReportDetailsModal = true;
  }

  downloadReport(report: any, format: string) {
    const params = new URLSearchParams();
    if (this.filters.startDate) params.append('startDate', this.filters.startDate);
    if (this.filters.endDate) params.append('endDate', this.filters.endDate);

    this.apiService.downloadReport(report.type, format, params).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title}_${report.type}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        alert(`Rapport téléchargé en format ${format.toUpperCase()}`);
      },
      error: (error) => {
        console.error('Error downloading report:', error);
        alert('Erreur lors du téléchargement du rapport');
      }
    });
  }

  deleteReport(reportId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      this.apiService.deleteReport(reportId).subscribe({
        next: () => {
          alert('Rapport supprimé avec succès');
          this.loadReports();
        },
        error: (error) => {
          console.error('Error deleting report:', error);
          alert('Erreur lors de la suppression du rapport');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'TERMINE':
        return 'bg-success';
      case 'EN_COURS':
        return 'bg-warning';
      case 'ERREUR':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'TERMINE':
        return 'Terminé';
      case 'EN_COURS':
        return 'En cours';
      case 'ERREUR':
        return 'Erreur';
      default:
        return status;
    }
  }

  getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    if (error?.status === 403) {
      return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
    }
    if (error?.status === 400) {
      return 'Données invalides. Vérifiez les informations saisies.';
    }
    if (error?.status === 404) {
      return 'Ressource non trouvée.';
    }
    if (error?.status === 500) {
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    }
    return 'Erreur lors de la génération du rapport. Veuillez réessayer.';
  }
}
