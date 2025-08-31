import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ReclamationPayload } from '../../services/api.service';

@Component({
  selector: 'app-reclamations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 mb-0 gradient-text">
            <i class="bi bi-exclamation-triangle me-2"></i>Gestion des Réclamations
          </h2>
          <p class="text-muted">Suivre et traiter les réclamations des utilisateurs</p>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline-primary btn-sm" (click)="refreshReclamations()">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Actualiser
          </button>
          <button class="btn btn-primary btn-sm" (click)="openAddModal()">
            <i class="bi bi-plus me-2"></i>Nouvelle Réclamation
          </button>
        </div>
      </div>

      <!-- Reclamations Content -->
      <div class="row g-4">
        
        <!-- Status Summary Cards -->
        <div class="col-md-3">
          <div class="card stat-card bg-primary text-white">
            <div class="card-body text-center">
              <i class="bi bi-list-ul fs-1 mb-2"></i>
              <h3 class="mb-1">{{ reclamations.length }}</h3>
              <p class="mb-0">Total Réclamations</p>
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
          <div class="card stat-card bg-info text-white">
            <div class="card-body text-center">
              <i class="bi bi-gear fs-1 mb-2"></i>
              <h3 class="mb-1">{{ getInProgressCount() }}</h3>
              <p class="mb-0">En Cours</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card stat-card bg-success text-white">
            <div class="card-body text-center">
              <i class="bi bi-check-circle fs-1 mb-2"></i>
              <h3 class="mb-1">{{ getResolvedCount() }}</h3>
              <p class="mb-0">Résolues</p>
            </div>
          </div>
        </div>

        <!-- Reclamations Table -->
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0"><i class="bi bi-list me-2"></i>Liste des Réclamations</h5>
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
                      <th>Titre</th>
                      <th>Produit</th>
                      <th>Raison</th>
                      <th>Quantité Observée</th>
                      <th>Statut</th>
                      <th>Date Création</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let reclamation of getFilteredReclamations()" 
                        [class.table-warning]="isPending(reclamation)" 
                        [class.table-info]="isInProgress(reclamation)" 
                        [class.table-success]="isResolved(reclamation)">
                      <td>{{ reclamation.id || 'N/A' }}</td>
                      <td>
                        <strong>{{ reclamation.titre }}</strong>
                      </td>
                      <td>
                        <span class="badge bg-secondary">{{ getProductName(reclamation) }}</span>
                      </td>
                      <td>{{ reclamation.reason }}</td>
                      <td>{{ reclamation.observedQuantity }}</td>
                      <td>
                        <span [class]="getStatusBadge(reclamation)">
                          {{ getStatusDisplay(reclamation.status || '') }}
                        </span>
                      </td>
                      <td>
                        <span class="text-muted">{{ formatDate(reclamation.createdAt) }}</span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary" (click)="viewReclamation(reclamation)" title="Voir Détails">
                            <i class="bi bi-eye"></i>
                          </button>
                          <button class="btn btn-outline-warning" (click)="openStatusUpdate(reclamation)" 
                                  *ngIf="!isResolved(reclamation)" title="Mettre à jour Statut">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-outline-success" (click)="resolveReclamation(reclamation)" 
                                  *ngIf="!isResolved(reclamation)" title="Marquer comme Résolue">
                            <i class="bi bi-check"></i>
                          </button>
                          <button class="btn btn-outline-danger" (click)="deleteReclamation(reclamation.id || 0)" 
                                  [disabled]="!reclamation.id || deletingReclamation === reclamation.id" title="Supprimer">
                            <i class="bi" [class]="deletingReclamation === reclamation.id ? 'bi-hourglass-split' : 'bi-trash'"></i>
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
      <div *ngIf="!reclamations && error" class="text-center py-5">
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>
        <button class="btn btn-primary" (click)="refreshReclamations()">
          <i class="bi bi-arrow-clockwise me-2"></i>Réessayer
        </button>
      </div>

      <!-- Add Reclamation Modal -->
      <div *ngIf="showAddModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-plus me-2"></i>
                Nouvelle Réclamation
              </h5>
              <button type="button" class="btn-close" (click)="closeAddModal()" [disabled]="saving"></button>
            </div>
            <div class="modal-body">
              <form #addReclamationForm="ngForm">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Titre *</label>
                      <input type="text" class="form-control" [(ngModel)]="newReclamation.titre" name="titre" required>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Produit *</label>
                      <select class="form-select" [(ngModel)]="newReclamation.productId" name="productId" required>
                        <option value="">Sélectionner un produit</option>
                        <option *ngFor="let product of products" [value]="product.id">
                          {{ product.name }} ({{ getCategoryDisplay(product.category) }})
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Quantité Observée *</label>
                      <input type="number" class="form-control" [(ngModel)]="newReclamation.observedQuantity" 
                             name="observedQuantity" required min="0">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Utilisateur *</label>
                      <select class="form-select" [(ngModel)]="newReclamation.userId" name="userId" required>
                        <option value="">Sélectionner un utilisateur</option>
                        <option *ngFor="let user of users" [value]="user.id">
                          {{ user.username }} ({{ user.role }})
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Raison *</label>
                  <textarea class="form-control" [(ngModel)]="newReclamation.reason" name="reason" 
                            rows="3" required placeholder="Décrivez la raison de la réclamation..."></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeAddModal()" [disabled]="saving">Annuler</button>
              <button type="button" class="btn btn-primary" (click)="createReclamation()" 
                      [disabled]="!addReclamationForm.valid || saving">
                <span *ngIf="!saving">
                  <i class="bi bi-plus me-2"></i>Créer
                </span>
                <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving ? 'Création...' : '' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- View Reclamation Modal -->
      <div *ngIf="showViewModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Détails de la Réclamation
              </h5>
              <button type="button" class="btn-close" (click)="closeViewModal()"></button>
            </div>
            <div class="modal-body">
              <div *ngIf="selectedReclamation" class="reclamation-details">
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="card bg-light">
                      <div class="card-body">
                        <h6 class="card-title text-primary">Informations Générales</h6>
                        <p><strong>ID:</strong> {{ selectedReclamation.id }}</p>
                        <p><strong>Titre:</strong> {{ selectedReclamation.titre }}</p>
                        <p><strong>Statut:</strong> 
                          <span [class]="getStatusBadge(selectedReclamation)">
                            {{ getStatusDisplay(selectedReclamation.status || '') }}
                          </span>
                        </p>
                        <p><strong>Date de création:</strong> {{ formatDate(selectedReclamation.createdAt) }}</p>
                        <p><strong>Dernière mise à jour:</strong> {{ formatDate(selectedReclamation.updatedAt) }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="card bg-light">
                      <div class="card-body">
                        <h6 class="card-title text-info">Détails du Produit</h6>
                        <p><strong>Produit:</strong> {{ getProductName(selectedReclamation) }}</p>
                        <p><strong>Raison:</strong> {{ selectedReclamation.reason }}</p>
                        <p><strong>Quantité observée:</strong> {{ selectedReclamation.observedQuantity }}</p>
                        <p><strong>Créé par:</strong> {{ getCreatedBy(selectedReclamation) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="mt-3">
                  <div class="card">
                    <div class="card-body">
                      <h6 class="card-title text-warning">Actions</h6>
                      <div class="d-flex gap-2 flex-wrap">
                        <button class="btn btn-warning btn-sm" (click)="openStatusUpdate(selectedReclamation)" 
                                *ngIf="!isResolved(selectedReclamation)">
                          <i class="bi bi-pencil me-2"></i>Mettre à jour le statut
                        </button>
                        <button class="btn btn-success btn-sm" (click)="resolveReclamation(selectedReclamation)" 
                                *ngIf="!isResolved(selectedReclamation)">
                          <i class="bi bi-check me-2"></i>Marquer comme résolue
                        </button>
                        <button class="btn btn-danger btn-sm" (click)="deleteReclamation(selectedReclamation.id || 0)">
                          <i class="bi bi-trash me-2"></i>Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeViewModal()">Fermer</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Update Status Modal -->
      <div *ngIf="showStatusModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-pencil me-2"></i>
                Mettre à jour le Statut
              </h5>
              <button type="button" class="btn-close" (click)="closeStatusModal()" [disabled]="updatingStatus"></button>
            </div>
            <div class="modal-body">
              <form #statusForm="ngForm">
                <div class="mb-3">
                  <label class="form-label">Réclamation</label>
                  <input type="text" class="form-control" [value]="selectedReclamation?.titre" readonly>
                </div>
                <div class="mb-3">
                  <label class="form-label">Statut Actuel</label>
                  <input type="text" class="form-control" 
                         [value]="getStatusDisplay(selectedReclamation?.status || '')" readonly>
                </div>
                <div class="mb-3">
                  <label class="form-label">Nouveau Statut *</label>
                  <select class="form-select" [(ngModel)]="statusUpdate.status" name="status" required>
                    <option value="">Sélectionner un statut</option>
                    <option value="OUVERTE">Ouverte</option>
                    <option value="EN_COURS">En Cours</option>
                    <option value="TRAITEE">Traitée</option>
                    <option value="REJETEE">Rejetée</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Commentaire</label>
                  <textarea class="form-control" [(ngModel)]="statusUpdate.comment" name="comment" rows="3" 
                            placeholder="Ajouter un commentaire sur la mise à jour..."></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeStatusModal()" [disabled]="updatingStatus">Annuler</button>
              <button type="button" class="btn btn-primary" (click)="saveStatusUpdate()" 
                      [disabled]="!statusForm.valid || updatingStatus">
                <span *ngIf="!updatingStatus">
                  <i class="bi bi-check me-2"></i>Mettre à jour
                </span>
                <span *ngIf="updatingStatus" class="spinner-border spinner-border-sm me-2"></span>
                {{ updatingStatus ? 'Mise à jour...' : '' }}
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
export class ReclamationsPageComponent implements OnInit {
  reclamations: ReclamationPayload[] = [];
  products: any[] = [];
  users: any[] = [];
  saving = false;
  updatingStatus = false;
  deletingReclamation: number | null = null;
  error: string | null = null;

  // Modal states
  showAddModal = false;
  showViewModal = false;
  showStatusModal = false;
  showPendingOnly = false;

  // Form data
  newReclamation: Partial<ReclamationPayload> = {};
  selectedReclamation: ReclamationPayload | null = null;
  statusUpdate = {
    status: '',
    comment: ''
  };

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadReclamations();
    this.loadProducts();
    this.loadUsers();
  }

  loadReclamations() {
    this.error = null;

    this.api.listReclamations().subscribe({
      next: (data) => {
        this.reclamations = data;
      },
      error: (error) => {
        this.error = error.message || 'Erreur lors du chargement des réclamations';
      }
    });
  }

  loadProducts() {
    this.api.listProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  loadUsers() {
    this.api.listUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  refreshReclamations() {
    this.loadReclamations();
  }

  // Filter and display methods
  getFilteredReclamations(): ReclamationPayload[] {
    if (this.showPendingOnly) {
      return this.reclamations.filter(r => this.isPending(r));
    }
    return this.reclamations;
  }

  getPendingCount(): number {
    return this.reclamations.filter(r => this.isPending(r)).length;
  }

  getInProgressCount(): number {
    return this.reclamations.filter(r => this.isInProgress(r)).length;
  }

  getResolvedCount(): number {
    return this.reclamations.filter(r => this.isResolved(r)).length;
  }

  // Status checking methods
  isPending(reclamation: ReclamationPayload): boolean {
    return reclamation.status === 'OUVERTE';
  }

  isInProgress(reclamation: ReclamationPayload): boolean {
    return reclamation.status === 'EN_COURS';
  }

  isResolved(reclamation: ReclamationPayload): boolean {
    return reclamation.status === 'TRAITEE' || reclamation.status === 'REJETEE';
  }

  // Display methods
  getStatusDisplay(status: string): string {
    const statusMap: { [key: string]: string } = {
      'OUVERTE': 'Ouverte',
      'EN_COURS': 'En Cours',
      'TRAITEE': 'Traitée',
      'REJETEE': 'Rejetée'
    };
    return statusMap[status] || status;
  }

  getStatusBadge(reclamation: ReclamationPayload): string {
    switch (reclamation.status) {
      case 'OUVERTE':
        return 'badge bg-warning';
      case 'EN_COURS':
        return 'badge bg-info';
      case 'TRAITEE':
        return 'badge bg-success';
      case 'REJETEE':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getProductName(reclamation: ReclamationPayload): string {
    if (reclamation.product?.name) {
      return reclamation.product.name;
    }
    const product = this.products.find(p => p.id === reclamation.productId);
    return product ? product.name : `Produit ${reclamation.productId}`;
  }

  getCategoryDisplay(category: string): string {
    const categories: { [key: string]: string } = {
      'VACCIN': 'Vaccin',
      'MEDICAMENT_VETERINAIRE': 'Médicament Vétérinaire',
      'ALIMENT_ANIMAL': 'Aliment Animal',
      'IMPORT_EXPORT': 'Import/Export'
    };
    return categories[category] || category;
  }

  getCreatedBy(reclamation: ReclamationPayload): string {
    if (reclamation.createdBy?.username) {
      return reclamation.createdBy.username;
    }
    const user = this.users.find(u => u.id === reclamation.created_by_user_id);
    return user ? user.username : 'Utilisateur inconnu';
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  // Modal methods
  openAddModal() {
    this.newReclamation = {
      titre: '',
      productId: 0,
      userId: 0,
      reason: '',
      observedQuantity: 0
    };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.newReclamation = {};
  }

  viewReclamation(reclamation: ReclamationPayload) {
    this.selectedReclamation = reclamation;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.selectedReclamation = null;
  }

  openStatusUpdate(reclamation: ReclamationPayload) {
    this.selectedReclamation = reclamation;
    this.statusUpdate = {
      status: reclamation.status || '',
      comment: ''
    };
    this.showStatusModal = true;
  }

  closeStatusModal() {
    this.showStatusModal = false;
    this.selectedReclamation = null;
    this.statusUpdate = { status: '', comment: '' };
  }

  // Action methods
  createReclamation() {
    if (!this.newReclamation.titre || !this.newReclamation.productId ||
      !this.newReclamation.userId || !this.newReclamation.reason ||
      this.newReclamation.observedQuantity === undefined) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.saving = true;

    this.api.createReclamation(this.newReclamation as ReclamationPayload).subscribe({
      next: (response) => {
        this.showSuccessMessage('Réclamation créée avec succès');
        this.closeAddModal();
        this.loadReclamations();
      },
      error: (error) => {
        this.showErrorMessage('Erreur lors de la création: ' + error.message);
        this.saving = false;
      }
    });
  }

  saveStatusUpdate() {
    if (!this.selectedReclamation || !this.statusUpdate.status) {
      alert('Veuillez sélectionner un nouveau statut');
      return;
    }

    this.updatingStatus = true;

    this.api.updateReclamationStatus(this.selectedReclamation.id!, this.statusUpdate.status as any).subscribe({
      next: (response) => {
        this.showSuccessMessage('Statut mis à jour avec succès');
        this.closeStatusModal();
        this.loadReclamations();
      },
      error: (error) => {
        this.showErrorMessage('Erreur lors de la mise à jour: ' + error.message);
        this.updatingStatus = false;
      }
    });
  }

  resolveReclamation(reclamation: ReclamationPayload) {
    if (!confirm('Êtes-vous sûr de vouloir marquer cette réclamation comme résolue ?')) {
      return;
    }

    this.api.updateReclamationStatus(reclamation.id!, 'TRAITEE').subscribe({
      next: (response) => {
        this.showSuccessMessage('Réclamation marquée comme résolue');
        this.loadReclamations();
      },
      error: (error) => {
        this.showErrorMessage('Erreur lors de la résolution: ' + error.message);
      }
    });
  }

  deleteReclamation(reclamationId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réclamation ? Cette action est irréversible.')) {
      return;
    }

    this.deletingReclamation = reclamationId;

    this.api.deleteReclamation(reclamationId).subscribe({
      next: () => {
        this.showSuccessMessage('Réclamation supprimée avec succès');
        this.loadReclamations();
      },
      error: (error) => {
        this.showErrorMessage('Erreur lors de la suppression: ' + error.message);
        this.deletingReclamation = null;
      }
    });
  }

  exportToCSV() {
    const headers = ['ID', 'Titre', 'Produit', 'Raison', 'Quantité Observée', 'Statut', 'Date Création'];
    const data = this.reclamations.map(r => [
      r.id || 'N/A',
      r.titre,
      this.getProductName(r),
      r.reason,
      r.observedQuantity,
      this.getStatusDisplay(r.status || ''),
      this.formatDate(r.createdAt)
    ]);

    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reclamations_${new Date().toISOString().split('T')[0]}.csv`);
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


