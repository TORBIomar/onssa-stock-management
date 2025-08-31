import { Component, OnInit } from '@angular/core';
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
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
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
          <button class="btn btn-outline-primary btn-sm" (click)="refreshTasks()">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Actualiser
          </button>
          <button class="btn btn-primary btn-sm" (click)="openAddModal()">
            <i class="bi bi-plus me-2"></i>Nouvelle Tâche
          </button>
        </div>
      </div>

      <!-- Tasks Content -->
      <div class="row g-4">
        
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
                      <th>Description</th>
                      <th>Assigné à</th>
                      <th>Priorité</th>
                      <th>Statut</th>
                      <th>Date Limite</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let task of getFilteredTasks()" 
                        [class.table-warning]="isOverdue(task)" 
                        [class.table-danger]="isCritical(task)"
                        [class.table-success]="isCompleted(task)">
                      <td>{{ task.id }}</td>
                      <td>
                        <strong>{{ task.title }}</strong>
                      </td>
                      <td>{{ task.description || 'Aucune description' }}</td>
                      <td>
                        <span class="badge bg-info">{{ getAssignedTo(task) }}</span>
                      </td>
                      <td>
                        <span [class]="getPriorityBadge(task.priority)">
                          {{ getPriorityDisplay(task.priority) }}
                        </span>
                      </td>
                      <td>
                        <span [class]="getStatusBadge(task.status)">
                          {{ getStatusDisplay(task.status) }}
                        </span>
                      </td>
                      <td>
                        <span [class]="getDueDateClass(task.dueDate)">
                          {{ formatDate(task.dueDate) }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary" (click)="editTask(task)" title="Modifier">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-outline-success" (click)="completeTask(task.id)" 
                                  *ngIf="task.status !== 'COMPLETED'" title="Marquer comme Terminée">
                            <i class="bi bi-check"></i>
                          </button>
                          <button class="btn btn-outline-warning" (click)="startTask(task.id)" 
                                  *ngIf="task.status === 'PENDING'" title="Commencer">
                            <i class="bi bi-play"></i>
                          </button>
                          <button class="btn btn-outline-danger" (click)="deleteTask(task.id)" 
                                  [disabled]="deletingTask === task.id" title="Supprimer">
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
      <div *ngIf="!tasks && error" class="text-center py-5">
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>
        <button class="btn btn-primary" (click)="refreshTasks()">
          <i class="bi bi-arrow-clockwise me-2"></i>Réessayer
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
                  <div class="col-md-8">
                    <div class="mb-3">
                      <label class="form-label">Titre *</label>
                      <input type="text" class="form-control" [(ngModel)]="newTask.title" name="title" required>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Priorité *</label>
                      <select class="form-select" [(ngModel)]="newTask.priority" name="priority" required>
                        <option value="">Sélectionner</option>
                        <option value="LOW">Basse</option>
                        <option value="MEDIUM">Moyenne</option>
                        <option value="HIGH">Haute</option>
                        <option value="CRITICAL">Critique</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" [(ngModel)]="newTask.description" name="description" rows="3" 
                            placeholder="Description détaillée de la tâche..."></textarea>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Assigné à</label>
                      <select class="form-select" [(ngModel)]="newTask.assignedToUserId" name="assignedToUserId">
                        <option value="">Sélectionner un utilisateur</option>
                        <option *ngFor="let user of users" [value]="user.id">
                          {{ user.username }} ({{ getRoleDisplay(user.role) }})
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Date Limite</label>
                      <input type="date" class="form-control" [(ngModel)]="newTask.dueDate" name="dueDate">
                    </div>
                  </div>
                </div>
                <div class="row" *ngIf="editingTask">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Statut</label>
                      <select class="form-select" [(ngModel)]="newTask.status" name="status">
                        <option value="PENDING">En Attente</option>
                        <option value="IN_PROGRESS">En Cours</option>
                        <option value="COMPLETED">Terminée</option>
                        <option value="CANCELLED">Annulée</option>
                      </select>
                    </div>
                  </div>
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
                <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving ? 'Enregistrement...' : '' }}
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
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  users: any[] = [];
  saving = false;
  deletingTask: number | null = null;
  error: string | null = null;
  
  // Modal states
  showAddModal = false;
  showPendingOnly = false;
  
  // Form data
  newTask: Partial<Task> = {};
  editingTask: Task | null = null;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadTasks();
    this.loadUsers();
  }

  loadTasks() {
    this.error = null;
    
    // For now, we'll use mock data since the API might not have tasks endpoint
    // In a real implementation, you would call: this.api.listTasks().subscribe({...})
    
    // Mock data for demonstration
    setTimeout(() => {
      this.tasks = [
        {
          id: 1,
          title: 'Vérifier les stocks de vaccins',
          description: 'Contrôler les quantités et dates d\'expiration',
          assignedToUserId: 2,
          assignedTo: 'Agent ONSSA',
          createdByUserId: 1,
          createdBy: 'Admin',
          priority: 'HIGH',
          status: 'PENDING',
          dueDate: '2024-12-31',
          createdAt: '2024-12-01',
          updatedAt: '2024-12-01'
        },
        {
          id: 2,
          title: 'Traiter les réclamations en attente',
          description: 'Examiner et résoudre les réclamations urgentes',
          assignedToUserId: 3,
          assignedTo: 'Vétérinaire',
          createdByUserId: 1,
          createdBy: 'Admin',
          priority: 'CRITICAL',
          status: 'IN_PROGRESS',
          dueDate: '2024-12-15',
          createdAt: '2024-12-01',
          updatedAt: '2024-12-01'
        },
        {
          id: 3,
          title: 'Mettre à jour la base de données',
          description: 'Synchroniser les données avec le serveur central',
          assignedToUserId: 1,
          assignedTo: 'Admin',
          createdByUserId: 1,
          createdBy: 'Admin',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          dueDate: '2024-12-10',
          createdAt: '2024-12-01',
          updatedAt: '2024-12-01'
        }
      ];
    }, 1000);
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

  refreshTasks() {
    this.loadTasks();
  }

  // Filter and display methods
  getFilteredTasks(): Task[] {
    if (this.showPendingOnly) {
      return this.tasks.filter(t => t.status === 'PENDING');
    }
    return this.tasks;
  }

  getCompletedTasksCount(): number {
    return this.tasks.filter(t => t.status === 'COMPLETED').length;
  }

  getPendingTasksCount(): number {
    return this.tasks.filter(t => t.status === 'PENDING').length;
  }

  getOverdueTasksCount(): number {
    return this.tasks.filter(t => this.isOverdue(t)).length;
  }

  // Status checking methods
  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'COMPLETED') return false;
    return new Date(task.dueDate) < new Date();
  }

  isCritical(task: Task): boolean {
    return task.priority === 'CRITICAL' && task.status !== 'COMPLETED';
  }

  isCompleted(task: Task): boolean {
    return task.status === 'COMPLETED';
  }

  // Display methods
  getPriorityDisplay(priority: string): string {
    const priorities: { [key: string]: string } = {
      'LOW': 'Basse',
      'MEDIUM': 'Moyenne',
      'HIGH': 'Haute',
      'CRITICAL': 'Critique'
    };
    return priorities[priority] || priority;
  }

  getPriorityBadge(priority: string): string {
    switch (priority) {
      case 'LOW':
        return 'badge bg-secondary';
      case 'MEDIUM':
        return 'badge bg-info';
      case 'HIGH':
        return 'badge bg-warning';
      case 'CRITICAL':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getStatusDisplay(status: string): string {
    const statuses: { [key: string]: string } = {
      'PENDING': 'En Attente',
      'IN_PROGRESS': 'En Cours',
      'COMPLETED': 'Terminée',
      'CANCELLED': 'Annulée'
    };
    return statuses[status] || status;
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'badge bg-warning';
      case 'IN_PROGRESS':
        return 'badge bg-info';
      case 'COMPLETED':
        return 'badge bg-success';
      case 'CANCELLED':
        return 'badge bg-secondary';
      default:
        return 'badge bg-secondary';
    }
  }

  getRoleDisplay(role: string): string {
    const roles: { [key: string]: string } = {
      'ADMIN': 'Admin',
      'AGENT': 'Agent'
    };
    return roles[role] || role;
  }

  getAssignedTo(task: Task): string {
    if (task.assignedTo) return task.assignedTo;
    const user = this.users.find(u => u.id === task.assignedToUserId);
    return user ? user.username : 'Non assigné';
  }

  getDueDateClass(dueDate?: string): string {
    if (!dueDate) return 'text-muted';
    const due = new Date(dueDate);
    const now = new Date();
    if (due < now) return 'text-danger fw-bold';
    if (due.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) return 'text-warning fw-bold';
    return 'text-success';
  }

  formatDate(date?: string): string {
    if (!date) return 'Aucune date';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  // Modal methods
  openAddModal() {
    this.editingTask = null;
    this.newTask = {
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'PENDING'
    };
    this.showAddModal = true;
  }

  editTask(task: Task) {
    this.editingTask = task;
    this.newTask = { ...task };
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.editingTask = null;
    this.newTask = {};
  }

  // Action methods
  saveTask() {
    if (!this.newTask.title || !this.newTask.priority) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.saving = true;

    if (this.editingTask) {
      // Update existing task
      const updatedTask = { ...this.editingTask, ...this.newTask };
      // In a real implementation: this.api.updateTask(this.editingTask.id, updatedTask).subscribe({...})
      
      setTimeout(() => {
        const index = this.tasks.findIndex(t => t.id === this.editingTask!.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.showSuccessMessage('Tâche modifiée avec succès');
        this.closeModal();
        this.saving = false;
      }, 1000);
    } else {
      // Create new task
      const newTask: Task = {
        id: this.tasks.length + 1,
        title: this.newTask.title!,
        description: this.newTask.description,
        assignedToUserId: this.newTask.assignedToUserId,
        assignedTo: this.getAssignedTo({ assignedToUserId: this.newTask.assignedToUserId } as Task),
        createdByUserId: 1, // Current user ID
        createdBy: 'Admin',
        priority: this.newTask.priority!,
        status: 'PENDING',
        dueDate: this.newTask.dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // In a real implementation: this.api.createTask(newTask).subscribe({...})
      
      setTimeout(() => {
        this.tasks.push(newTask);
        this.showSuccessMessage('Tâche créée avec succès');
        this.closeModal();
        this.saving = false;
      }, 1000);
    }
  }

  completeTask(taskId: number) {
    if (!confirm('Êtes-vous sûr de vouloir marquer cette tâche comme terminée ?')) {
      return;
    }

    // In a real implementation: this.api.updateTaskStatus(taskId, 'COMPLETED').subscribe({...})
    
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'COMPLETED';
      task.updatedAt = new Date().toISOString();
      this.showSuccessMessage('Tâche marquée comme terminée');
    }
  }

  startTask(taskId: number) {
    // In a real implementation: this.api.updateTaskStatus(taskId, 'IN_PROGRESS').subscribe({...})
    
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'IN_PROGRESS';
      task.updatedAt = new Date().toISOString();
      this.showSuccessMessage('Tâche démarrée');
    }
  }

  deleteTask(taskId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.')) {
      return;
    }

    this.deletingTask = taskId;

    // In a real implementation: this.api.deleteTask(taskId).subscribe({...})
    
    setTimeout(() => {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.showSuccessMessage('Tâche supprimée avec succès');
      this.deletingTask = null;
    }, 1000);
  }

  exportToCSV() {
    const headers = ['ID', 'Titre', 'Description', 'Assigné à', 'Priorité', 'Statut', 'Date Limite', 'Date Création'];
    const data = this.tasks.map(t => [
      t.id,
      t.title,
      t.description || '',
      this.getAssignedTo(t),
      this.getPriorityDisplay(t.priority),
      this.getStatusDisplay(t.status),
      this.formatDate(t.dueDate),
      this.formatDate(t.createdAt)
    ]);

    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `taches_${new Date().toISOString().split('T')[0]}.csv`);
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
