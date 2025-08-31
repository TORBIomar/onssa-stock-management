import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ProductPayload } from '../../services/api.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 mb-0 gradient-text">
            <i class="bi bi-box me-2"></i>Gestion des Produits
          </h2>
          <p class="text-muted">Surveiller et gérer l'inventaire des stocks</p>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline-primary btn-sm" (click)="refreshProducts()">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Actualiser
          </button>
          <button class="btn btn-primary btn-sm" (click)="openAddModal()">
            <i class="bi bi-plus me-2"></i>Ajouter Produit
          </button>
        </div>
      </div>

      <!-- Products Content -->
      <div class="row g-4">
        
        <!-- Statistics Cards -->
        <div class="col-md-3">
          <div class="card stat-card bg-primary text-white">
            <div class="card-body text-center">
              <i class="bi bi-box fs-1 mb-2"></i>
              <h3 class="mb-1">{{ products.length }}</h3>
              <p class="mb-0">Total Produits</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card stat-card bg-warning text-dark">
            <div class="card-body text-center">
              <i class="bi bi-exclamation-triangle fs-1 mb-2"></i>
              <h3 class="mb-1">{{ getLowStockCount() }}</h3>
              <p class="mb-0">Stock Faible</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card stat-card bg-danger text-white">
            <div class="card-body text-center">
              <i class="bi bi-x-circle fs-1 mb-2"></i>
              <h3 class="mb-1">{{ getExpiredCount() }}</h3>
              <p class="mb-0">Expirés</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card stat-card bg-success text-white">
            <div class="card-body text-center">
              <i class="bi bi-check-circle fs-1 mb-2"></i>
              <h3 class="mb-1">{{ getAvailableCount() }}</h3>
              <p class="mb-0">Disponibles</p>
            </div>
          </div>
        </div>

        <!-- Products Table -->
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0"><i class="bi bi-list me-2"></i>Liste des Produits</h5>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-secondary" (click)="exportToCSV()">
                  <i class="bi bi-download me-1"></i>Exporter
                </button>
                <button class="btn btn-outline-info" (click)="showLowStockOnly = !showLowStockOnly">
                  <i class="bi bi-filter me-1"></i>{{ showLowStockOnly ? 'Tous' : 'Stock Faible' }}
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Nom</th>
                      <th>Catégorie</th>
                      <th>Quantité</th>
                      <th>Seuil Min.</th>
                      <th>Date Expiration</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let product of getFilteredProducts()" 
                        [class.table-warning]="isLowStock(product)"
                        [class.table-danger]="isExpired(product)"
                        [class.table-success]="isAvailable(product)">
                      <td>{{ product.id }}</td>
                      <td>
                        <strong>{{ product.name }}</strong>
                      </td>
                      <td>
                        <span class="badge bg-secondary">{{ getCategoryDisplay(product.category) }}</span>
                      </td>
                      <td>
                        <span [class]="getQuantityClass(product)">
                          {{ product.quantity }}
                        </span>
                      </td>
                      <td>{{ product.minimumThreshold }}</td>
                      <td>
                        <span [class]="getExpiryClass(product)">
                          {{ formatDate(product.expiryDate) }}
                        </span>
                      </td>
                      <td>
                        <span [class]="getStatusBadge(product)">
                          {{ getStatusText(product) }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary" (click)="editProduct(product)" title="Modifier">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-outline-success" (click)="adjustStock(product)" title="Ajuster Stock">
                            <i class="bi bi-plus-slash-minus"></i>
                          </button>
                          <button class="btn btn-outline-info" (click)="viewDetails(product)" title="Détails">
                            <i class="bi bi-eye"></i>
                          </button>
                          <button class="btn btn-outline-danger" (click)="deleteProduct(product.id || 0)" 
                                  [disabled]="!product.id || deletingProduct === product.id" title="Supprimer">
                            <i class="bi" [class]="deletingProduct === product.id ? 'bi-hourglass-split' : 'bi-trash'"></i>
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
      <div *ngIf="!products && error" class="text-center py-5">
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>
        <button class="btn btn-primary" (click)="refreshProducts()">
          <i class="bi bi-arrow-clockwise me-2"></i>Réessayer
        </button>
      </div>

      <!-- Add/Edit Product Modal -->
      <div *ngIf="showAddModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi" [class]="newProduct.id ? 'bi-pencil' : 'bi-plus'"></i>
                {{ newProduct.id ? 'Modifier le Produit' : 'Ajouter un Produit' }}
              </h5>
              <button type="button" class="btn-close" (click)="closeModal()" [disabled]="saving"></button>
            </div>
            <div class="modal-body">
              <form #addProductForm="ngForm">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Nom du Produit *</label>
                      <input type="text" class="form-control" [(ngModel)]="newProduct.name" name="name" required>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Catégorie *</label>
                      <select class="form-select" [(ngModel)]="newProduct.category" name="category" required>
                        <option value="">Sélectionner une catégorie</option>
                        <option value="VACCIN">Vaccin</option>
                        <option value="MEDICAMENT_VETERINAIRE">Médicament Vétérinaire</option>
                        <option value="ALIMENT_ANIMAL">Aliment Animal</option>
                        <option value="IMPORT_EXPORT">Import/Export</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Quantité *</label>
                      <input type="number" class="form-control" [(ngModel)]="newProduct.quantity" name="quantity" required min="0">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Seuil Minimum *</label>
                      <input type="number" class="form-control" [(ngModel)]="newProduct.minimumThreshold" name="minimumThreshold" required min="0">
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Date d'Expiration</label>
                  <input type="date" class="form-control" [(ngModel)]="newProduct.expiryDate" name="expiryDate">
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()" [disabled]="saving">Annuler</button>
              <button type="button" class="btn btn-primary" (click)="saveProduct()" 
                      [disabled]="!addProductForm.valid || saving">
                <span *ngIf="!saving">
                  <i class="bi" [class]="newProduct.id ? 'bi-check' : 'bi-plus'"></i>
                  {{ newProduct.id ? 'Modifier' : 'Ajouter' }}
                </span>
                <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving ? 'Enregistrement...' : '' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stock Adjustment Modal -->
      <div *ngIf="showStockModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-plus-slash-minus me-2"></i>
                Ajuster le Stock
              </h5>
              <button type="button" class="btn-close" (click)="closeStockModal()" [disabled]="adjustingStock"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Produit</label>
                <input type="text" class="form-control" [value]="selectedProduct?.name" readonly>
              </div>
              <div class="mb-3">
                <label class="form-label">Stock Actuel</label>
                <input type="number" class="form-control" [value]="selectedProduct?.quantity" readonly>
              </div>
              <div class="mb-3">
                <label class="form-label">Type d'Ajustement</label>
                <select class="form-select" [(ngModel)]="stockAdjustment.type">
                  <option value="add">Ajouter du stock</option>
                  <option value="remove">Retirer du stock</option>
                  <option value="set">Définir le stock</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Quantité</label>
                <input type="number" class="form-control" [(ngModel)]="stockAdjustment.quantity" min="0">
              </div>
              <div class="mb-3">
                <label class="form-label">Raison (optionnel)</label>
                <textarea class="form-control" [(ngModel)]="stockAdjustment.reason" rows="2" 
                          placeholder="Raison de l'ajustement..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeStockModal()" [disabled]="adjustingStock">Annuler</button>
              <button type="button" class="btn btn-primary" (click)="confirmStockAdjustment()" 
                      [disabled]="!stockAdjustment.quantity || adjustingStock">
                <span *ngIf="!adjustingStock">
                  <i class="bi bi-check me-2"></i>Confirmer
                </span>
                <span *ngIf="adjustingStock" class="spinner-border spinner-border-sm me-2"></span>
                {{ adjustingStock ? 'Ajustement...' : '' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Details Modal -->
      <div *ngIf="showDetailsModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-eye me-2"></i>
                Détails du Produit
              </h5>
              <button type="button" class="btn-close" (click)="closeDetailsModal()"></button>
            </div>
            <div class="modal-body">
              <div *ngIf="selectedProduct" class="row g-3">
                <div class="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title text-primary">Informations Générales</h6>
                      <p><strong>ID:</strong> {{ selectedProduct.id }}</p>
                      <p><strong>Nom:</strong> {{ selectedProduct.name }}</p>
                      <p><strong>Catégorie:</strong> {{ getCategoryDisplay(selectedProduct.category) }}</p>
                      <p><strong>Statut:</strong> 
                        <span [class]="getStatusBadge(selectedProduct)">
                          {{ getStatusText(selectedProduct) }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title text-info">Stock</h6>
                      <p><strong>Quantité:</strong> {{ selectedProduct.quantity }}</p>
                      <p><strong>Seuil Minimum:</strong> {{ selectedProduct.minimumThreshold }}</p>
                      <p><strong>Date d'Expiration:</strong> {{ formatDate(selectedProduct.expiryDate) }}</p>
                      <p><strong>Marge de Sécurité:</strong> {{ selectedProduct.quantity - selectedProduct.minimumThreshold }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeDetailsModal()">Fermer</button>
              <button type="button" class="btn btn-primary" (click)="editProduct(selectedProduct!)">
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

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class ProductsPageComponent implements OnInit {
  products: ProductPayload[] = [];
  saving = false;
  adjustingStock = false;
  deletingProduct: number | null = null;
  error: string | null = null;

  // Modal states
  showAddModal = false;
  showStockModal = false;
  showDetailsModal = false;
  showLowStockOnly = false;

  // Form data
  newProduct: Partial<ProductPayload> = {};
  selectedProduct: ProductPayload | null = null;
  stockAdjustment = {
    type: 'add',
    quantity: 0,
    reason: ''
  };

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.error = null;

    this.api.listProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (error) => {
        this.error = error.message || 'Erreur lors du chargement des produits';
      }
    });
  }

  refreshProducts() {
    this.loadProducts();
  }

  // Filter and display methods
  getFilteredProducts(): ProductPayload[] {
    if (this.showLowStockOnly) {
      return this.products.filter(p => this.isLowStock(p));
    }
    return this.products;
  }

  getLowStockCount(): number {
    return this.products.filter(p => this.isLowStock(p)).length;
  }

  getExpiredCount(): number {
    return this.products.filter(p => this.isExpired(p)).length;
  }

  getAvailableCount(): number {
    return this.products.filter(p => this.isAvailable(p)).length;
  }

  // Status checking methods
  isLowStock(product: ProductPayload): boolean {
    return product.quantity <= product.minimumThreshold;
  }

  isExpired(product: ProductPayload): boolean {
    if (!product.expiryDate) return false;
    return new Date(product.expiryDate) < new Date();
  }

  isAvailable(product: ProductPayload): boolean {
    return product.quantity > product.minimumThreshold && !this.isExpired(product);
  }

  // Display methods
  getCategoryDisplay(category: string): string {
    const categories: { [key: string]: string } = {
      'VACCIN': 'Vaccin',
      'MEDICAMENT_VETERINAIRE': 'Médicament Vétérinaire',
      'ALIMENT_ANIMAL': 'Aliment Animal',
      'IMPORT_EXPORT': 'Import/Export'
    };
    return categories[category] || category;
  }

  getStatusText(product: ProductPayload): string {
    if (this.isExpired(product)) return 'Expiré';
    if (this.isLowStock(product)) return 'Stock Faible';
    return 'Disponible';
  }

  getStatusBadge(product: ProductPayload): string {
    if (this.isExpired(product)) return 'badge bg-danger';
    if (this.isLowStock(product)) return 'badge bg-warning';
    return 'badge bg-success';
  }

  getQuantityClass(product: ProductPayload): string {
    if (this.isLowStock(product)) return 'text-warning fw-bold';
    if (this.isExpired(product)) return 'text-danger fw-bold';
    return 'text-success';
  }

  getExpiryClass(product: ProductPayload): string {
    if (this.isExpired(product)) return 'text-danger fw-bold';
    return 'text-muted';
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  // Modal methods
  openAddModal() {
    this.newProduct = {};
    this.showAddModal = true;
  }

  editProduct(product: ProductPayload) {
    this.newProduct = { ...product };
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.newProduct = {};
  }

  adjustStock(product: ProductPayload) {
    this.selectedProduct = product;
    this.stockAdjustment = {
      type: 'add',
      quantity: 0,
      reason: ''
    };
    this.showStockModal = true;
  }

  closeStockModal() {
    this.showStockModal = false;
    this.selectedProduct = null;
  }

  viewDetails(product: ProductPayload) {
    this.selectedProduct = product;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedProduct = null;
  }

  // Action methods
  saveProduct() {
    if (!this.newProduct.name || !this.newProduct.category ||
      this.newProduct.quantity === undefined || this.newProduct.minimumThreshold === undefined) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.saving = true;

    if (this.newProduct.id) {
      // Update existing product
      this.api.updateProduct(this.newProduct.id, this.newProduct as ProductPayload).subscribe({
        next: (response) => {
          this.showSuccessMessage('Produit modifié avec succès');
          this.closeModal();
          this.loadProducts();
        },
        error: (error) => {
          this.showErrorMessage('Erreur lors de la modification: ' + error.message);
          this.saving = false;
        }
      });
    } else {
      // Create new product
      this.api.createProduct(this.newProduct as ProductPayload).subscribe({
        next: (response) => {
          this.showSuccessMessage('Produit créé avec succès');
          this.closeModal();
          this.loadProducts();
        },
        error: (error) => {
          this.showErrorMessage('Erreur lors de la création: ' + error.message);
          this.saving = false;
        }
      });
    }
  }

  confirmStockAdjustment() {
    if (!this.selectedProduct || !this.stockAdjustment.quantity) {
      alert('Veuillez saisir une quantité valide');
      return;
    }

    this.adjustingStock = true;
    let newQuantity = this.selectedProduct.quantity;

    switch (this.stockAdjustment.type) {
      case 'add':
        newQuantity += this.stockAdjustment.quantity;
        break;
      case 'remove':
        newQuantity = Math.max(0, newQuantity - this.stockAdjustment.quantity);
        break;
      case 'set':
        newQuantity = this.stockAdjustment.quantity;
        break;
    }

    const updatedProduct = {
      ...this.selectedProduct,
      quantity: newQuantity
    };

    this.api.updateProduct(this.selectedProduct.id!, updatedProduct).subscribe({
      next: (response) => {
        this.showSuccessMessage('Stock ajusté avec succès');
        this.closeStockModal();
        this.loadProducts();
      },
      error: (error) => {
        this.showErrorMessage('Erreur lors de l\'ajustement: ' + error.message);
        this.adjustingStock = false;
      }
    });
  }

  deleteProduct(productId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      return;
    }

    this.deletingProduct = productId;

    this.api.deleteProduct(productId).subscribe({
      next: () => {
        this.showSuccessMessage('Produit supprimé avec succès');
        this.loadProducts();
      },
      error: (error) => {
        this.showErrorMessage('Erreur lors de la suppression: ' + error.message);
        this.deletingProduct = null;
      }
    });
  }

  exportToCSV() {
    // Implementation for CSV export
    alert('Export CSV functionality would be implemented here');
  }

  // Role-based methods
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  getCurrentUser(): { role: string } | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('auth_user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
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


