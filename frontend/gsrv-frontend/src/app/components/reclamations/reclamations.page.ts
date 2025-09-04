import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
          <button class="btn btn-primary btn-sm" (click)="openAddModal()">
            <i class="bi bi-plus me-2"></i>Nouvelle Réclamation
          </button>
          <button class="btn btn-outline-secondary btn-sm" (click)="loadReclamations()">
            <i class="bi bi-arrow-clockwise me-2"></i>Actualiser
          </button>
        </div>
      </div>

      <!-- Status Summary Cards -->
      <div class="row g-4 mb-4">
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
      </div>

      <!-- Reclamations Table -->
      <div class="card shadow-sm">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="bi bi-list me-2"></i>Liste des Réclamations</h5>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" (click)="exportToCSV()">
              <i class="bi bi-download me-1"></i>Exporter
            </button>
            <button class="btn btn-outline-info" (click)="togglePendingFilter()">
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
                    [class.table-warning]="reclamation.status === 'OUVERTE'"
                    [class.table-info]="reclamation.status === 'EN_COURS'"
                    [class.table-success]="reclamation.status === 'TRAITEE'"
                    [class.table-danger]="reclamation.status === 'REJETEE'">
                  <td>{{ reclamation.id }}</td>
                  <td><strong>{{ reclamation.titre }}</strong></td>
                  <td><span class="badge bg-secondary">{{ reclamation.product?.name || 'N/A' }}</span></td>
                  <td>{{ reclamation.reason }}</td>
                  <td>{{ reclamation.observedQuantity }}</td>
                  <td>
                    <span [class]="getStatusBadge(reclamation.status || '')">
                      {{ getStatusText(reclamation.status || '') }}
                    </span>
                  </td>
                  <td>{{ formatDate(reclamation.createdAt) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" (click)="editReclamation(reclamation)" title="Modifier">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-info" (click)="viewDetails(reclamation)" title="Détails">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-outline-danger" (click)="deleteReclamation(reclamation.id || 0)" title="Supprimer">
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

      <!-- Add/Edit Reclamation Modal -->
      <div *ngIf="showAddModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi" [class]="newReclamation.id ? 'bi-pencil' : 'bi-plus'"></i>
                {{ newReclamation.id ? 'Modifier la Réclamation' : 'Nouvelle Réclamation' }}
              </h5>
              <button type="button" class="btn-close" (click)="closeModal()"></button>
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
                        <option *ngFor="let product of products" [value]="product.id">{{ product.name }}</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Raison *</label>
                      <textarea class="form-control" [(ngModel)]="newReclamation.reason" name="reason" rows="3" required></textarea>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Quantité Observée *</label>
                      <input type="number" class="form-control" [(ngModel)]="newReclamation.observedQuantity" name="observedQuantity" required min="0">
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Annuler</button>
              <button type="button" class="btn btn-primary" (click)="saveReclamation()" [disabled]="!addReclamationForm.valid">
                <i class="bi" [class]="newReclamation.id ? 'bi-check' : 'bi-plus'"></i>
                {{ newReclamation.id ? 'Modifier' : 'Créer' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reclamation Details Modal -->
      <div *ngIf="showDetailsModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-eye me-2"></i>
                Détails de la Réclamation
              </h5>
              <button type="button" class="btn-close" (click)="closeDetailsModal()"></button>
            </div>
            <div class="modal-body">
              <div *ngIf="selectedReclamation" class="row g-3">
                <div class="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title text-primary">Informations Générales</h6>
                      <p><strong>ID:</strong> {{ selectedReclamation.id }}</p>
                      <p><strong>Titre:</strong> {{ selectedReclamation.titre }}</p>
                      <p><strong>Statut:</strong> 
                        <span [class]="getStatusBadge(selectedReclamation.status || '')">
                          {{ getStatusText(selectedReclamation.status || '') }}
                        </span>
                      </p>
                      <p><strong>Date de création:</strong> {{ formatDate(selectedReclamation.createdAt) }}</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title text-info">Détails</h6>
                      <p><strong>Produit:</strong> {{ selectedReclamation.product?.name || 'N/A' }}</p>
                      <p><strong>Raison:</strong> {{ selectedReclamation.reason }}</p>
                      <p><strong>Quantité observée:</strong> {{ selectedReclamation.observedQuantity }}</p>
                      <p><strong>Créé par:</strong> {{ selectedReclamation.createdBy?.username || 'N/A' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeDetailsModal()">Fermer</button>
              <button type="button" class="btn btn-primary" (click)="editReclamation(selectedReclamation!)">
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
export class ReclamationsPageComponent implements OnInit {
  reclamations: ReclamationPayload[] = [];
  products: any[] = [];
  error: string | null = null;

  // Modal states
  showAddModal = false;
  showDetailsModal = false;
  showPendingOnly = false;

  // Form data
  newReclamation: Partial<ReclamationPayload> = {};
  selectedReclamation: ReclamationPayload | null = null;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadReclamations();
    this.loadProducts();
  }

  // Data loading functions
  loadReclamations() {
    this.api.listReclamations().subscribe({
      next: (data) => {
        this.reclamations = data || [];
        this.error = null;
        this.cdr.detectChanges(); // Added this line
      },
      error: (error) => {
        this.error = error.message || 'Erreur lors du chargement des réclamations';
        this.reclamations = [];
        this.cdr.detectChanges(); // Added detectChanges() here
      }
    });
  }

  loadProducts() {
    this.api.listProducts().subscribe({
      next: (data) => {
        this.products = data || [];
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  // Filter functions
  getFilteredReclamations(): ReclamationPayload[] {
    if (this.showPendingOnly) {
      return this.reclamations.filter(reclamation => reclamation.status === 'OUVERTE');
    }
    return this.reclamations;
  }

  togglePendingFilter() {
    this.showPendingOnly = !this.showPendingOnly;
  }

  // Statistics functions
  getPendingCount(): number {
    return this.reclamations.filter(reclamation => reclamation.status === 'OUVERTE').length;
  }

  getInProgressCount(): number {
    return this.reclamations.filter(reclamation => reclamation.status === 'EN_COURS').length;
  }

  getResolvedCount(): number {
    return this.reclamations.filter(reclamation => reclamation.status === 'TRAITEE').length;
  }

  // Display functions
  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'OUVERTE': 'En Attente',
      'EN_COURS': 'En Cours',
      'TRAITEE': 'Résolue',
      'REJETEE': 'Rejetée'
    };
    return statusMap[status] || status;
  }

  getStatusBadge(status: string): string {
    const badgeMap: { [key: string]: string } = {
      'OUVERTE': 'badge bg-warning',
      'EN_COURS': 'badge bg-info',
      'TRAITEE': 'badge bg-success',
      'REJETEE': 'badge bg-danger'
    };
    return badgeMap[status] || 'badge bg-secondary';
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  // Modal functions
  openAddModal() {
    this.newReclamation = {};
    this.showAddModal = true;
  }

  editReclamation(reclamation: ReclamationPayload) {
    this.newReclamation = { ...reclamation };
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.newReclamation = {};
  }

  viewDetails(reclamation: ReclamationPayload) {
    this.selectedReclamation = reclamation;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedReclamation = null;
  }

  // Action functions
  saveReclamation() {
    if (!this.newReclamation.titre || !this.newReclamation.productId ||
      !this.newReclamation.reason || this.newReclamation.observedQuantity === undefined) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const currentUser = this.api.getCurrentUser();
    if (!currentUser) {
      alert('Utilisateur non connecté');
      return;
    }

    const reclamationData: ReclamationPayload = {
      ...this.newReclamation,
      userId: currentUser.userId
    } as ReclamationPayload;

    this.api.createReclamation(reclamationData).subscribe({
      next: () => {
        this.closeModal();
        this.loadReclamations();
        alert('Réclamation créée avec succès');
      },
      error: (error) => {
        alert('Erreur lors de la création: ' + error.message);
      }
    });
  }

  deleteReclamation(reclamationId: number) {
    if (!this.api.isAuthenticated()) {
      alert('Vous devez être connecté pour supprimer une réclamation');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cette réclamation ?')) {
      this.api.deleteReclamation(reclamationId).subscribe({
        next: () => {
          this.loadReclamations();
          alert('Réclamation supprimée avec succès');
        },
        error: (error) => {
          console.error('Error deleting reclamation:', error);

          // Handle different error scenarios
          if (error?.status === 404) {
            alert('Réclamation non trouvée. Elle a peut-être déjà été supprimée.');
          } else if (error?.status === 403) {
            alert('Accès refusé. Seuls les administrateurs peuvent supprimer des réclamations.');
          } else if (error?.status === 409) {
            alert('Impossible de supprimer cette réclamation car elle a des dépendances.');
          } else if (error?.status === 500) {
            alert('Erreur serveur lors de la suppression. Veuillez réessayer plus tard.');
          } else {
            alert('Erreur lors de la suppression: ' + (error?.message || 'Erreur inconnue'));
          }

          // Refresh the list to ensure UI is in sync
          this.loadReclamations();
        }
      });
    }
  }

  exportToCSV() {
    alert('Export CSV fonctionnalité sera implémentée ici');
  }
}


