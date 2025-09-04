import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface Task {
  id: number;
  title: string;
  description?: string;
  assignedToUserId?: number;
  assignedTo?: string;
  createdByUserId: number;
  createdBy?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'A_FAIRE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 mb-0 gradient-text">
            <i class="bi bi-list-task me-2"></i>Gestion des Tâches
          </h2>
          <p class="text-muted">Organiser et suivre les tâches du système</p>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary btn-sm" (click)="openAddModal()">
            <i class="bi bi-plus me-2"></i>Nouvelle Tâche
          </button>
          <button class="btn btn-outline-secondary btn-sm" (click)="loadTasks()">
            <i class="bi bi-arrow-clockwise me-2"></i>Actualiser
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="mt-3 text-muted">Chargement des tâches...</p>
      </div>

      <!-- Tasks Content -->
      <div *ngIf="!loading" class="row g-4">
        
        <!-- Task Summary Cards -->
        <div class="col-md-3">
          <div class="card stat-card bg-primary text-white">
            <div class="card-body text-center">
              <i class="bi bi-list-task fs-1 mb-2"></i>
              <h3 class="mb-1">{{ tasks.length }}</h3>
              <p class="mb-0">Total Tâches</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card stat-card bg-success text-white">
            <div class="card-body text-center">
              <i class="bi bi-check-circle fs-1 mb-2"></i>
              <h3 class="mb-1">{{ getCompletedTasksCount() }}</h3>
              <p class="mb-0">Terminées</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card stat-card bg-warning text-dark">
            <div class="card-body text-center">
              <i class="bi bi-clock fs-1 mb-2"></i>
              <h3 class="mb-1">{{ getPendingTasksCount() }}</h3>
              <p class="mb-0">En Attente</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card stat-card bg-danger text-white">
            <div class="card-body text-center">
              <i class="bi bi-exclamation-triangle fs-1 mb-2"></i>
              <h3 class="mb-1">{{ getOverdueTasksCount() }}</h3>
              <p class="mb-0">En Retard</p>
            </div>
          </div>
        </div>

        <!-- Tasks Table -->
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0"><i class="bi bi-list me-2"></i>Liste des Tâches</h5>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-secondary" (click)="exportToCSV()">
                  <i class="bi bi-download me-1"></i>Exporter
                </button>
                                 <button class="btn btn-outline-info" (click)="showPendingOnly = !showPendingOnly">
                   <i class="bi bi-filter me-1"></i>{{ showPendingOnly ? 'Toutes' : 'À Faire' }}
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
                      <th>Description</th>
                      <th>Priorité</th>
                      <th>Statut</th>
                      <th>Date d'échéance</th>
                      <th>Assigné à</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                                         <tr *ngFor="let task of getFilteredTasks()" 
                         [class.table-warning]="task.status === 'A_FAIRE'"
                         [class.table-info]="task.status === 'EN_COURS'"
                         [class.table-success]="task.status === 'TERMINE'"
                         [class.table-danger]="task.status === 'ANNULE'">
                      <td>{{ task.id }}</td>
                      <td>
                        <strong>{{ task.title }}</strong>
                      </td>
                      <td>{{ task.description || 'Aucune description' }}</td>
                      <td>
                        <span [class]="getPriorityBadge(task.priority)">
                          {{ getPriorityText(task.priority) }}
                        </span>
                      </td>
                      <td>
                        <span [class]="getStatusBadge(task.status)">
                          {{ getStatusText(task.status) }}
                        </span>
                      </td>
                      <td>{{ formatDate(task.dueDate) }}</td>
                      <td>{{ task.assignedTo || 'Non assigné' }}</td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary" (click)="editTask(task)" title="Modifier">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-outline-info" (click)="viewDetails(task)" title="Détails">
                            <i class="bi bi-eye"></i>
                          </button>
                                                     <button class="btn btn-outline-success" (click)="completeTask(task)" 
                                   [disabled]="task.status === 'TERMINE' || completingTask === task.id" title="Terminer">
                            <i class="bi" [class]="completingTask === task.id ? 'bi-hourglass-split' : 'bi-check'"></i>
                          </button>
                          <button class="btn btn-outline-danger" (click)="deleteTask(task.id)" 
                                  [disabled]="!task.id || deletingTask === task.id" title="Supprimer">
                            <i class="bi" [class]="deletingTask === task.id ? 'bi-hourglass-split' : 'bi-trash'"></i>
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
      <div *ngIf="!loading && error" class="text-center py-5">
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>
        <button class="btn btn-primary" (click)="loadTasks()">
          <i class="bi bi-arrow-clockwise me-2"></i>Réessayer
        </button>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && !error && tasks.length === 0" class="text-center py-5">
        <div class="alert alert-info" role="alert">
          <i class="bi bi-info-circle me-2"></i>
          Aucune tâche trouvée. Commencez par créer votre première tâche.
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <i class="bi bi-plus me-2"></i>Créer une Tâche
        </button>
      </div>

      <!-- Add/Edit Task Modal -->
      <div *ngIf="showAddModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi" [class]="editingTask ? 'bi-pencil' : 'bi-plus'"></i>
                {{ editingTask ? 'Modifier la Tâche' : 'Nouvelle Tâche' }}
              </h5>
              <button type="button" class="btn-close" (click)="closeModal()" [disabled]="saving"></button>
            </div>
            <div class="modal-body">
              <form #addTaskForm="ngForm">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Titre *</label>
                      <input type="text" class="form-control" [(ngModel)]="newTask.title" name="title" required>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Priorité *</label>
                                             <select class="form-select" [(ngModel)]="newTask.priority" name="priority" required>
                         <option value="">Sélectionner une priorité</option>
                         <option value="LOW">Faible</option>
                         <option value="MEDIUM">Moyenne</option>
                         <option value="HIGH">Élevée</option>
                         <option value="URGENT">Urgent</option>
                       </select>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Statut *</label>
                                             <select class="form-select" [(ngModel)]="newTask.status" name="status" required>
                         <option value="">Sélectionner un statut</option>
                         <option value="A_FAIRE">En Attente</option>
                         <option value="EN_COURS">En Cours</option>
                         <option value="TERMINE">Terminée</option>
                         <option value="ANNULE">Annulée</option>
                       </select>
                    </div>
                  </div>
                                       <div class="col-md-6">
                       <div class="mb-3">
                         <label class="form-label">Date d'échéance *</label>
                         <input type="date" class="form-control" [(ngModel)]="newTask.dueDate" name="dueDate" required>
                       </div>
                     </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" [(ngModel)]="newTask.description" name="description" rows="3"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()" [disabled]="saving">Annuler</button>
              <button type="button" class="btn btn-primary" (click)="saveTask()" 
                      [disabled]="!addTaskForm.valid || saving">
                <span *ngIf="!saving">
                  <i class="bi" [class]="editingTask ? 'bi-check' : 'bi-plus'"></i>
                  {{ editingTask ? 'Modifier' : 'Créer' }}
                </span>
                <span *ngIf="saving">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  {{ editingTask ? 'Modification...' : 'Création...' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Details Modal -->
      <div *ngIf="showDetailsModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-eye me-2"></i>
                Détails de la Tâche
              </h5>
              <button type="button" class="btn-close" (click)="closeDetailsModal()"></button>
            </div>
            <div class="modal-body">
              <div *ngIf="selectedTask" class="row g-3">
                <div class="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title text-primary">Informations Générales</h6>
                      <p><strong>ID:</strong> {{ selectedTask.id }}</p>
                      <p><strong>Titre:</strong> {{ selectedTask.title }}</p>
                      <p><strong>Priorité:</strong> 
                        <span [class]="getPriorityBadge(selectedTask.priority)">
                          {{ getPriorityText(selectedTask.priority) }}
                        </span>
                      </p>
                      <p><strong>Statut:</strong> 
                        <span [class]="getStatusBadge(selectedTask.status)">
                          {{ getStatusText(selectedTask.status) }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title text-info">Détails</h6>
                      <p><strong>Description:</strong> {{ selectedTask.description || 'Aucune description' }}</p>
                      <p><strong>Date d'échéance:</strong> {{ formatDate(selectedTask.dueDate) }}</p>
                      <p><strong>Assigné à:</strong> {{ selectedTask.assignedTo || 'Non assigné' }}</p>
                      <p><strong>Créé par:</strong> {{ selectedTask.createdBy || 'N/A' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeDetailsModal()">Fermer</button>
              <button type="button" class="btn btn-primary" (click)="editTask(selectedTask!)">
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
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  loading = false;
  saving = false;
  deletingTask: number | null = null;
  completingTask: number | null = null;
  error: string | null = null;

  // Modal states
  showAddModal = false;
  showDetailsModal = false;
  showPendingOnly = false;

  // Form data
  newTask: Partial<Task> = {};
  editingTask: Task | null = null;
  selectedTask: Task | null = null;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // Load tasks immediately
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.error = null;
    console.log('🔄 Loading tasks...');

    this.api.listTasks().subscribe({
      next: (data) => {
        console.log('✅ Tasks loaded successfully:', data);
        this.tasks = data || [];
        this.loading = false;
        this.cdr.detectChanges(); // Added this line
      },
      error: (error) => {
        console.error('❌ Error loading tasks:', error);

        // Handle different error scenarios
        if (error?.status === 500) {
          this.error = 'Erreur serveur. Veuillez vérifier que le backend est démarré sur le port 8082.';
        } else if (error?.status === 0) {
          this.error = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
        } else {
          this.error = 'Erreur lors du chargement des tâches: ' + (error?.message || 'Erreur inconnue');
        }

        this.tasks = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Filter and display methods
  getFilteredTasks(): Task[] {
    if (this.showPendingOnly) {
      return this.tasks.filter(t => t.status === 'A_FAIRE');
    }
    return this.tasks;
  }

  getCompletedTasksCount(): number {
    return this.tasks.filter(t => t.status === 'TERMINE').length;
  }

  getPendingTasksCount(): number {
    return this.tasks.filter(t => t.status === 'A_FAIRE').length;
  }

  getOverdueTasksCount(): number {
    const today = new Date();
    return this.tasks.filter(t => {
      if (!t.dueDate || t.status === 'TERMINE') return false;
      return new Date(t.dueDate) < today;
    }).length;
  }

  // Display methods
  getPriorityText(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'LOW': 'Faible',
      'MEDIUM': 'Moyenne',
      'HIGH': 'Élevée',
      'URGENT': 'Urgent'
    };
    return priorityMap[priority] || priority;
  }

  getPriorityBadge(priority: string): string {
    const badgeMap: { [key: string]: string } = {
      'LOW': 'badge bg-success',
      'MEDIUM': 'badge bg-info',
      'HIGH': 'badge bg-warning',
      'URGENT': 'badge bg-danger'
    };
    return badgeMap[priority] || 'badge bg-secondary';
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'A_FAIRE': 'En Attente',
      'EN_COURS': 'En Cours',
      'TERMINE': 'Terminée',
      'ANNULE': 'Annulée'
    };
    return statusMap[status] || status;
  }

  getStatusBadge(status: string): string {
    const badgeMap: { [key: string]: string } = {
      'A_FAIRE': 'badge bg-warning',
      'EN_COURS': 'badge bg-info',
      'TERMINE': 'badge bg-success',
      'ANNULE': 'badge bg-danger'
    };
    return badgeMap[status] || 'badge bg-secondary';
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  // Modal methods
  openAddModal() {
    this.editingTask = null;
    this.newTask = {};
    this.showAddModal = true;
  }

  editTask(task: Task) {
    this.editingTask = task;
    this.newTask = {
      ...task,
      dueDate: this.formatDateForBackend(task.dueDate) // Ensure date is properly formatted for the form
    };
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.editingTask = null;
    this.newTask = {};
  }

  viewDetails(task: Task) {
    this.selectedTask = task;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedTask = null;
  }

  // Helper method to format date for backend
  formatDateForBackend(date: any): string {
    if (!date) return '';

    // If it's already a Date object
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }

    // If it's a string like "2025-09-26", convert to proper format
    const dateObj = new Date(date);
    return dateObj.toISOString().split('T')[0];
  }

  // Action methods
  saveTask() {
    if (!this.newTask.title || !this.newTask.priority || !this.newTask.status || !this.newTask.dueDate) {
      this.showErrorMessage('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.saving = true;
    console.log('💾 Saving task:', this.newTask);

    // Get current user ID
    const currentUser = this.api.getCurrentUser();
    if (!currentUser) {
      this.showErrorMessage('Utilisateur non connecté');
      this.saving = false;
      return;
    }

    const taskData = {
      title: this.newTask.title,
      priority: this.newTask.priority,
      status: this.newTask.status,
      description: this.newTask.description,
      dueDate: this.formatDateForBackend(this.newTask.dueDate),
      createdByUserId: currentUser.userId
    };

    if (this.editingTask) {
      // Update existing task
      this.api.updateTask(this.editingTask.id, taskData).subscribe({
        next: (response) => {
          console.log('✅ Task updated successfully:', response);
          this.saving = false;
          this.showSuccessMessage('Tâche modifiée avec succès');
          this.closeModal();
          this.loadTasks();
        },
        error: (error) => {
          console.error('❌ Error updating task:', error);
          this.saving = false;

          // Handle different error scenarios
          if (error?.status === 404) {
            this.showErrorMessage('Tâche non trouvée. Elle a peut-être déjà été supprimée.');
          } else if (error?.status === 400) {
            this.showErrorMessage('Données invalides. Vérifiez les informations saisies.');
          } else if (error?.status === 500) {
            this.showErrorMessage('Erreur serveur lors de la modification. Veuillez réessayer plus tard.');
          } else {
            this.showErrorMessage('Erreur lors de la modification: ' + (error?.message || 'Erreur inconnue'));
          }
        }
      });
    } else {
      // Create new task
      this.api.createTask(taskData).subscribe({
        next: (response) => {
          console.log('✅ Task created successfully:', response);
          this.saving = false;
          this.showSuccessMessage('Tâche créée avec succès');
          this.closeModal();
          this.loadTasks();
        },
        error: (error) => {
          console.error('❌ Error creating task:', error);
          this.saving = false;

          // Handle different error scenarios
          if (error?.status === 400) {
            this.showErrorMessage('Données invalides. Vérifiez les informations saisies.');
          } else if (error?.status === 500) {
            this.showErrorMessage('Erreur serveur lors de la création. Veuillez réessayer plus tard.');
          } else {
            this.showErrorMessage('Erreur lors de la création: ' + (error?.message || 'Erreur inconnue'));
          }
        }
      });
    }
  }

  completeTask(task: Task) {
    if (task.status === 'TERMINE') {
      this.showErrorMessage('Cette tâche est déjà terminée');
      return;
    }

    this.completingTask = task.id;
    const updatedTask = { ...task, status: 'TERMINE' as any };

    this.api.updateTask(task.id, updatedTask).subscribe({
      next: (response) => {
        this.showSuccessMessage('Tâche marquée comme terminée');
        this.loadTasks();
        this.completingTask = null;
      },
      error: (error) => {
        console.error('Error completing task:', error);

        // Handle different error scenarios
        if (error?.status === 404) {
          this.showErrorMessage('Tâche non trouvée. Elle a peut-être déjà été supprimée.');
        } else if (error?.status === 400) {
          this.showErrorMessage('Statut invalide pour cette tâche.');
        } else if (error?.status === 500) {
          this.showErrorMessage('Erreur serveur lors de la mise à jour. Veuillez réessayer plus tard.');
        } else {
          this.showErrorMessage('Erreur lors de la mise à jour: ' + (error?.message || 'Erreur inconnue'));
        }
        this.completingTask = null;
      }
    });
  }

  deleteTask(taskId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.')) {
      return;
    }

    this.deletingTask = taskId;

    this.api.deleteTask(taskId).subscribe({
      next: () => {
        this.showSuccessMessage('Tâche supprimée avec succès');
        this.loadTasks();
        this.deletingTask = null;
      },
      error: (error) => {
        console.error('Error deleting task:', error);

        // Handle different error scenarios
        if (error?.status === 404) {
          this.showErrorMessage('Tâche non trouvée. Elle a peut-être déjà été supprimée.');
        } else if (error?.status === 409) {
          this.showErrorMessage('Impossible de supprimer cette tâche car elle a des dépendances.');
        } else if (error?.status === 500) {
          this.showErrorMessage('Erreur serveur lors de la suppression. Veuillez réessayer plus tard.');
        } else {
          this.showErrorMessage('Erreur lors de la suppression: ' + (error?.message || 'Erreur inconnue'));
        }
        this.deletingTask = null;
      }
    });
  }

  exportToCSV() {
    // Implementation for CSV export
    this.showSuccessMessage('Export CSV fonctionnalité sera implémentée ici');
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
