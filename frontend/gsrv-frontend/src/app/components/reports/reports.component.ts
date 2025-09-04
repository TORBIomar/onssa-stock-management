import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface Report {
  id: number;
  type: string;
  title: string;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
  description: string;
}

interface ReportFilters {
  type: string;
  status: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class ReportsComponent implements OnInit {
  // Data
  reports: Report[] = [];
  filteredReports: Report[] = [];
  
  // UI State
  loading = false;
  showGenerateModal = false;
  showDetailsModal = false;
  selectedReport: Report | null = null;
  generating = false;
  
  // Messages
  errorMessage = '';
  successMessage = '';
  
  // Forms
  reportForm: FormGroup;
  filters: ReportFilters = {
    type: '',
    status: '',
    startDate: '',
    endDate: ''
  };

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.reportForm = this.fb.group({
      type: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadReports();
  }

  // ===== DATA LOADING =====
  loadReports(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.apiService.getAllReports().subscribe({
      next: (data: any) => {
        console.log('API Response:', data);
        
        if (data && Array.isArray(data) && data.length > 0) {
          // Real API data
          this.reports = this.mapApiDataToReports(data);
          console.log('Loaded real reports:', this.reports.length);
        } else {
          // No data available
          this.reports = [];
          console.log('No reports found');
        }
        
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('API Error:', error);
        this.reports = [];
        this.filteredReports = [];
        
        // Show specific error message
        if (error?.status === 500) {
          this.errorMessage = 'Erreur serveur. Veuillez vérifier que le backend est démarré sur le port 8082.';
        } else if (error?.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
        } else {
          this.errorMessage = 'Erreur lors du chargement des rapports. Veuillez réessayer.';
        }
        
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapApiDataToReports(apiData: any[]): Report[] {
    return apiData.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      status: item.status,
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      completedAt: item.generatedAt ? new Date(item.generatedAt) : null,
      description: item.description || ''
    }));
  }

  // ===== FILTERING =====
  applyFilters(): void {
    this.filteredReports = this.reports.filter(report => {
      const typeMatch = !this.filters.type || report.type === this.filters.type;
      const statusMatch = !this.filters.status || report.status === this.filters.status;
      const dateMatch = this.checkDateRange(report.createdAt);
      
      return typeMatch && statusMatch && dateMatch;
    });
  }

  private checkDateRange(date: Date): boolean {
    if (!this.filters.startDate && !this.filters.endDate) return true;
    
    const reportDate = date.getTime();
    const startDate = this.filters.startDate ? new Date(this.filters.startDate).getTime() : 0;
    const endDate = this.filters.endDate ? new Date(this.filters.endDate).getTime() : Date.now();
    
    return reportDate >= startDate && reportDate <= endDate;
  }

  clearFilters(): void {
    this.filters = {
      type: '',
      status: '',
      startDate: '',
      endDate: ''
    };
    this.applyFilters();
  }

  // ===== REPORT OPERATIONS =====
  generateReport(): void {
    if (!this.reportForm.valid) {
      this.errorMessage = 'Veuillez remplir tous les champs requis';
      return;
    }

    this.generating = true;
    this.errorMessage = '';
    
    const formData = this.reportForm.value;
    const reportData = {
      title: formData.title,
      description: formData.description,
      status: 'EN_COURS'
    };

    this.apiService.generateReport(formData.type, reportData).subscribe({
      next: (response: any) => {
        this.successMessage = 'Rapport généré avec succès';
        this.generating = false;
        this.showGenerateModal = false;
        this.reportForm.reset();
        this.loadReports();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.errorMessage = this.getErrorMessage(error);
        this.generating = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteReport(reportId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      return;
    }

    // Real API deletion
    this.apiService.deleteReport(reportId).subscribe({
      next: () => {
        this.successMessage = 'Rapport supprimé avec succès';
        this.loadReports();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.errorMessage = this.getDeleteErrorMessage(error);
        this.loadReports(); // Refresh to sync UI
        this.cdr.detectChanges();
      }
    });
  }

  downloadReport(report: Report, format: string): void {
    const params = new URLSearchParams();
    if (this.filters.startDate) params.append('startDate', this.filters.startDate);
    if (this.filters.endDate) params.append('endDate', this.filters.endDate);

    this.apiService.downloadReport(report.type, format, params).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title}_${report.type}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.successMessage = `Rapport téléchargé en format ${format.toUpperCase()}`;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du téléchargement';
        this.cdr.detectChanges();
      }
    });
  }

  viewReport(report: Report): void {
    this.selectedReport = report;
    this.showDetailsModal = true;
  }

  // ===== UI HELPERS =====
  getStatusClass(status: string): string {
    switch (status) {
      case 'TERMINE': return 'bg-success';
      case 'EN_COURS': return 'bg-warning';
      case 'ERREUR': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'TERMINE': return 'Terminé';
      case 'EN_COURS': return 'En cours';
      case 'ERREUR': return 'Erreur';
      default: return status;
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'STOCK': return 'bg-primary';
      case 'RECLAMATIONS': return 'bg-info';
      case 'UTILISATEURS': return 'bg-secondary';
      default: return 'bg-dark';
    }
  }

  formatDate(date: Date | null): string {
    if (!date) return '-';
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ===== ERROR HANDLING =====
  private getErrorMessage(error: any): string {
    if (error?.status === 403) return 'Accès refusé. Permissions insuffisantes.';
    if (error?.status === 400) return 'Données invalides. Vérifiez les informations.';
    if (error?.status === 500) return 'Erreur serveur. Veuillez réessayer.';
    return 'Erreur lors de la génération du rapport.';
  }

  private getDeleteErrorMessage(error: any): string {
    if (error?.status === 404) return 'Rapport non trouvé. Il a peut-être déjà été supprimé.';
    if (error?.status === 403) return 'Accès refusé. Seuls les administrateurs peuvent supprimer des rapports.';
    if (error?.status === 500) return 'Erreur serveur lors de la suppression.';
    return 'Erreur lors de la suppression du rapport.';
  }

  // ===== MODAL HELPERS =====
  openGenerateModal(): void {
    this.showGenerateModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeGenerateModal(): void {
    this.showGenerateModal = false;
    this.reportForm.reset();
    this.errorMessage = '';
    this.generating = false;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedReport = null;
  }

  // ===== UTILITY =====
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  isAdmin(): boolean {
    return this.apiService.isAuthenticated() && this.apiService.getCurrentUser()?.role === 'ADMIN';
  }
}
