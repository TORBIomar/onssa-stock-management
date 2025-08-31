import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-inspections',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 mb-0 gradient-text">
            <i class="bi bi-clipboard-check me-2"></i>Planification des Inspections
          </h2>
          <p class="text-muted">Gérer le planning des inspections réglementaires ONSSA</p>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline-primary btn-sm" (click)="refreshInspections()">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Actualiser
          </button>
          <button class="btn btn-primary btn-sm" (click)="openAddModal()">
            <i class="bi bi-plus me-2"></i>Nouvelle Inspection
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="card stat-card bg-primary text-white">
            <div class="card-body text-center">
              <i class="bi bi-calendar-check fs-1 mb-2"></i>
              <h3 class="mb-1">{{ inspections.length }}</h3>
              <p class="mb-0">Total Inspections</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card stat-card bg-warning text-dark">
            <div class="card-body text-center">
              <i class="bi bi-clock fs-1 mb-2"></i>
              <h3 class="mb-1">{{ getPendingCount() }}</h3>
              <p class="mb-0">En Attente</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card stat-card bg-success text-white">
            <div class="card-body text-center">
              <i class="bi bi-check-circle fs-1 mb-2"></i>
              <h3 class="mb-1">{{ getCompletedCount() }}</h3>
              <p class="mb-0">Terminées</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card stat-card bg-info text-white">
            <div class="card-body text-center">
              <i class="bi bi-calendar-week fs-1 mb-2"></i>
              <h3 class="mb-1">{{ getThisWeekCount() }}</h3>
              <p class="mb-0">Cette Semaine</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Inspections Table -->
      <div class="card shadow-sm">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="bi bi-list me-2"></i>Liste des Inspections</h5>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" (click)="exportToCSV()">
              <i class="bi bi-download me-1"></i>Exporter
            </button>
            <button class="btn btn-outline-info" (click)="showPendingOnly = !showPendingOnly">
              <i class="bi bi-filter me-1"></i>{{ showPendingOnly ? 'Toutes' : 'En Attente' }}
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Établissement</th>
                  <th>Type</th>
                  <th>Date Planifiée</th>
                  <th>Inspecteur</th>
                  <th>Statut</th>
                  <th>Priorité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let inspection of getFilteredInspections()" 
                    [class.table-warning]="inspection.status === 'EN_ATTENTE'"
                    [class.table-success]="inspection.status === 'TERMINEE'"
                    [class.table-danger]="inspection.priority === 'HAUTE'">
                  <td>{{ inspection.id }}</td>
                  <td>
                    <strong>{{ inspection.establishment }}</strong>
                  </td>
                  <td>
                    <span class="badge bg-secondary">{{ getTypeDisplay(inspection.type) }}</span>
                  </td>
                  <td>
                    <span [class]="getDateClass(inspection.scheduledDate)">
                      {{ formatDate(inspection.scheduledDate) }}
                    </span>
                  </td>
                  <td>{{ inspection.inspector }}</td>
                  <td>
                    <span [class]="getStatusBadge(inspection.status)">
                      {{ getStatusText(inspection.status) }}
                    </span>
                  </td>
                  <td>
                    <span [class]="getPriorityBadge(inspection.priority)">
                      {{ getPriorityText(inspection.priority) }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" (click)="editInspection(inspection)" title="Modifier">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-success" (click)="completeInspection(inspection)" title="Marquer Terminée">
                        <i class="bi bi-check"></i>
                      </button>
                      <button class="btn btn-outline-info" (click)="viewDetails(inspection)" title="Détails">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-outline-danger" (click)="deleteInspection(inspection.id)" title="Supprimer">
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

      <!-- Add/Edit Inspection Modal -->
      <div *ngIf="showAddModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi" [class]="newInspection.id ? 'bi-pencil' : 'bi-plus'"></i>
                {{ newInspection.id ? 'Modifier l\'Inspection' : 'Nouvelle Inspection' }}
              </h5>
              <button type="button" class="btn-close" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <form #addInspectionForm="ngForm">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Établissement *</label>
                      <input type="text" class="form-control" [(ngModel)]="newInspection.establishment" name="establishment" required>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Type d'Inspection *</label>
                      <select class="form-select" [(ngModel)]="newInspection.type" name="type" required>
                        <option value="">Sélectionner un type</option>
                        <option value="ROUTINE">Routine</option>
                        <option value="COMPLAINT">Plainte</option>
                        <option value="FOLLOW_UP">Suivi</option>
                        <option value="EMERGENCY">Urgence</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Date Planifiée *</label>
                      <input type="datetime-local" class="form-control" [(ngModel)]="newInspection.scheduledDate" name="scheduledDate" required>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Inspecteur *</label>
                      <input type="text" class="form-control" [(ngModel)]="newInspection.inspector" name="inspector" required>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Priorité</label>
                      <select class="form-select" [(ngModel)]="newInspection.priority" name="priority">
                        <option value="BASSE">Basse</option>
                        <option value="NORMALE">Normale</option>
                        <option value="HAUTE">Haute</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Statut</label>
                      <select class="form-select" [(ngModel)]="newInspection.status" name="status">
                        <option value="EN_ATTENTE">En Attente</option>
                        <option value="EN_COURS">En Cours</option>
                        <option value="TERMINEE">Terminée</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Notes</label>
                  <textarea class="form-control" [(ngModel)]="newInspection.notes" name="notes" rows="3" 
                            placeholder="Notes sur l'inspection..."></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Annuler</button>
              <button type="button" class="btn btn-primary" (click)="saveInspection()" 
                      [disabled]="!addInspectionForm.valid">
                <i class="bi" [class]="newInspection.id ? 'bi-check' : 'bi-plus'"></i>
                {{ newInspection.id ? 'Modifier' : 'Ajouter' }}
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
export class InspectionsComponent implements OnInit {
  inspections: any[] = [];
  showAddModal = false;
  showPendingOnly = false;
  newInspection: any = {
    establishment: '',
    type: '',
    scheduledDate: '',
    inspector: '',
    priority: 'NORMALE',
    status: 'EN_ATTENTE',
    notes: ''
  };

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadInspections();
  }

  loadInspections() {
    // Mock data for now - replace with actual API call
    this.inspections = [
      {
        id: 1,
        establishment: 'Ferme Alimentation Animale',
        type: 'ROUTINE',
        scheduledDate: '2024-01-15T09:00',
        inspector: 'Agent ONSSA 1',
        status: 'EN_ATTENTE',
        priority: 'NORMALE',
        notes: 'Inspection de routine des stocks'
      },
      {
        id: 2,
        establishment: 'Clinique Vétérinaire Centrale',
        type: 'COMPLAINT',
        scheduledDate: '2024-01-16T14:00',
        inspector: 'Agent ONSSA 2',
        status: 'EN_COURS',
        priority: 'HAUTE',
        notes: 'Plainte concernant la qualité des produits'
      }
    ];
  }

  refreshInspections() {
    this.loadInspections();
  }

  openAddModal() {
    this.newInspection = {
      establishment: '',
      type: '',
      scheduledDate: '',
      inspector: '',
      priority: 'NORMALE',
      status: 'EN_ATTENTE',
      notes: ''
    };
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
  }

  saveInspection() {
    if (this.newInspection.id) {
      // Update existing
      const index = this.inspections.findIndex(i => i.id === this.newInspection.id);
      if (index !== -1) {
        this.inspections[index] = { ...this.newInspection };
      }
    } else {
      // Add new
      this.newInspection.id = this.inspections.length + 1;
      this.inspections.push({ ...this.newInspection });
    }
    this.closeModal();
  }

  editInspection(inspection: any) {
    this.newInspection = { ...inspection };
    this.showAddModal = true;
  }

  completeInspection(inspection: any) {
    inspection.status = 'TERMINEE';
  }

  viewDetails(inspection: any) {
    // Implementation for viewing details
    alert(`Détails de l'inspection: ${inspection.establishment}`);
  }

  deleteInspection(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette inspection ?')) {
      this.inspections = this.inspections.filter(i => i.id !== id);
    }
  }

  getFilteredInspections() {
    if (this.showPendingOnly) {
      return this.inspections.filter(i => i.status === 'EN_ATTENTE');
    }
    return this.inspections;
  }

  getPendingCount() {
    return this.inspections.filter(i => i.status === 'EN_ATTENTE').length;
  }

  getCompletedCount() {
    return this.inspections.filter(i => i.status === 'TERMINEE').length;
  }

  getThisWeekCount() {
    // Mock implementation - count inspections scheduled this week
    return this.inspections.filter(i => i.status === 'EN_ATTENTE').length;
  }

  getTypeDisplay(type: string): string {
    const types: { [key: string]: string } = {
      'ROUTINE': 'Routine',
      'COMPLAINT': 'Plainte',
      'FOLLOW_UP': 'Suivi',
      'EMERGENCY': 'Urgence'
    };
    return types[type] || type;
  }

  getStatusText(status: string): string {
    const statuses: { [key: string]: string } = {
      'EN_ATTENTE': 'En Attente',
      'EN_COURS': 'En Cours',
      'TERMINEE': 'Terminée'
    };
    return statuses[status] || status;
  }

  getPriorityText(priority: string): string {
    const priorities: { [key: string]: string } = {
      'BASSE': 'Basse',
      'NORMALE': 'Normale',
      'HAUTE': 'Haute'
    };
    return priorities[priority] || priority;
  }

  getStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      'EN_ATTENTE': 'badge bg-warning',
      'EN_COURS': 'badge bg-info',
      'TERMINEE': 'badge bg-success'
    };
    return badges[status] || 'badge bg-secondary';
  }

  getPriorityBadge(priority: string): string {
    const badges: { [key: string]: string } = {
      'BASSE': 'badge bg-success',
      'NORMALE': 'badge bg-primary',
      'HAUTE': 'badge bg-danger'
    };
    return badges[priority] || 'badge bg-secondary';
  }

  getDateClass(date: string): string {
    const inspectionDate = new Date(date);
    const today = new Date();
    const diffTime = inspectionDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-danger';
    if (diffDays <= 3) return 'text-warning';
    return 'text-success';
  }

  formatDate(date: string): string {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  exportToCSV() {
    alert('Export CSV functionality would be implemented here');
  }
}
