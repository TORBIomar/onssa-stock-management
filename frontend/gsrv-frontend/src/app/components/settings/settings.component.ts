import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h3 mb-0 gradient-text">
            <i class="bi bi-gear me-2"></i>Paramètres du Système
          </h2>
          <p class="text-muted">Configurer et personnaliser le système GSRV</p>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline-primary btn-sm" (click)="refreshSettings()">
            <i class="bi bi-arrow-clockwise me-2"></i>Actualiser
          </button>
          <button class="btn btn-primary btn-sm" (click)="saveAllSettings()">
            <i class="bi bi-check me-2"></i>Sauvegarder
          </button>
        </div>
      </div>

      <!-- Settings Content -->
      <div class="row g-4">
        
        <!-- System Configuration -->
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0"><i class="bi bi-cpu me-2"></i>Configuration Système</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Nom du Système</label>
                <input type="text" class="form-control" [(ngModel)]="systemSettings.systemName" placeholder="GSRV System">
              </div>
              <div class="mb-3">
                <label class="form-label">Version</label>
                <input type="text" class="form-control" [(ngModel)]="systemSettings.version" placeholder="1.0.0" readonly>
              </div>
              <div class="mb-3">
                <label class="form-label">Mode Maintenance</label>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" [(ngModel)]="systemSettings.maintenanceMode">
                  <label class="form-check-label">Activer le mode maintenance</label>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Langue par défaut</label>
                <select class="form-select" [(ngModel)]="systemSettings.defaultLanguage">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header bg-warning text-dark">
              <h5 class="mb-0"><i class="bi bi-shield-lock me-2"></i>Sécurité</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Durée de session (minutes)</label>
                <input type="number" class="form-control" [(ngModel)]="securitySettings.sessionTimeout" min="15" max="480">
              </div>
              <div class="mb-3">
                <label class="form-label">Tentatives de connexion max</label>
                <input type="number" class="form-control" [(ngModel)]="securitySettings.maxLoginAttempts" min="3" max="10">
              </div>
              <div class="mb-3">
                <label class="form-label">Authentification à deux facteurs</label>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" [(ngModel)]="securitySettings.twoFactorAuth">
                  <label class="form-check-label">Activer la 2FA</label>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Complexité des mots de passe</label>
                <select class="form-select" [(ngModel)]="securitySettings.passwordComplexity">
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                </select>
              </div>
            </div>
          </div>
        </div>



        <!-- Backup & Maintenance -->
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0"><i class="bi bi-database me-2"></i>Sauvegarde & Maintenance</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Sauvegarde automatique</label>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" [(ngModel)]="backupSettings.autoBackup">
                  <label class="form-check-label">Activer la sauvegarde automatique</label>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Fréquence de sauvegarde</label>
                <select class="form-select" [(ngModel)]="backupSettings.backupFrequency">
                  <option value="daily">Quotidienne</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuelle</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Rétention des sauvegardes (jours)</label>
                <input type="number" class="form-control" [(ngModel)]="backupSettings.retentionDays" min="7" max="365">
              </div>
              <div class="mb-3">
                <label class="form-label">Nettoyage automatique des logs</label>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" [(ngModel)]="backupSettings.autoLogCleanup">
                  <label class="form-check-label">Activer le nettoyage automatique</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Management -->
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-secondary text-white">
              <h5 class="mb-0"><i class="bi bi-people me-2"></i>Gestion des Utilisateurs</h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Création de comptes</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" [(ngModel)]="userSettings.allowRegistration">
                      <label class="form-check-label">Autoriser l'inscription publique</label>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Validation email</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" [(ngModel)]="userSettings.emailVerification">
                      <label class="form-check-label">Exiger la validation email</label>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Rôles par défaut</label>
                    <select class="form-select" [(ngModel)]="userSettings.defaultRole">
                      <option value="ADMIN">Admin</option>
                      <option value="AGENT">Agent</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Expiration des comptes inactifs (jours)</label>
                    <input type="number" class="form-control" [(ngModel)]="userSettings.inactiveAccountExpiry" min="30" max="365">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Settings -->
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-dark text-white">
              <h5 class="mb-0"><i class="bi bi-tools me-2"></i>Paramètres Avancés</h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Mode Debug</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" [(ngModel)]="advancedSettings.debugMode">
                      <label class="form-check-label">Activer le mode debug</label>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Log Level</label>
                    <select class="form-select" [(ngModel)]="advancedSettings.logLevel">
                      <option value="ERROR">Erreur</option>
                      <option value="WARN">Avertissement</option>
                      <option value="INFO">Information</option>
                      <option value="DEBUG">Debug</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Cache TTL (secondes)</label>
                    <input type="number" class="form-control" [(ngModel)]="advancedSettings.cacheTTL" min="60" max="3600">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Taille max des fichiers (MB)</label>
                    <input type="number" class="form-control" [(ngModel)]="advancedSettings.maxFileSize" min="1" max="100">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Action Buttons -->
      <div class="row mt-4">
        <div class="col-12 text-center">
          <div class="btn-group">
            <button class="btn btn-primary" (click)="saveAllSettings()">
              <i class="bi bi-check-circle me-2"></i>Sauvegarder tous les paramètres
            </button>
            <button class="btn btn-secondary" (click)="resetToDefaults()">
              <i class="bi bi-arrow-clockwise me-2"></i>Réinitialiser aux valeurs par défaut
            </button>
            <button class="btn btn-outline-info" (click)="exportSettings()">
              <i class="bi bi-download me-2"></i>Exporter la configuration
            </button>
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
    
    .btn {
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .form-check-input:checked {
      background-color: #0d6efd;
      border-color: #0d6efd;
    }
    
    .form-control, .form-select {
      border-radius: 8px;
      border: 1px solid #dee2e6;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }
    
    .form-control:focus, .form-select:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
  `]
})
export class SettingsComponent implements OnInit {
  systemSettings = {
    systemName: 'GSRV System',
    version: '1.0.0',
    maintenanceMode: false,
    defaultLanguage: 'fr'
  };

  securitySettings = {
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    passwordComplexity: 'medium'
  };



  backupSettings = {
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    autoLogCleanup: true
  };

  userSettings = {
    allowRegistration: false,
    emailVerification: true,
    defaultRole: 'AGENT',
    inactiveAccountExpiry: 90
  };

  advancedSettings = {
    debugMode: false,
    logLevel: 'INFO',
    cacheTTL: 300,
    maxFileSize: 10
  };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    // Charger les paramètres depuis l'API ou le localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedSettings = localStorage.getItem('gsrv_settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          this.systemSettings = { ...this.systemSettings, ...settings.systemSettings };
          this.securitySettings = { ...this.securitySettings, ...settings.securitySettings };

          this.backupSettings = { ...this.backupSettings, ...settings.backupSettings };
          this.userSettings = { ...this.userSettings, ...settings.userSettings };
          this.advancedSettings = { ...this.advancedSettings, ...settings.advancedSettings };
        } catch (error) {
          console.error('Erreur lors du chargement des paramètres:', error);
        }
      }
    }
    this.cdr.detectChanges(); // Add this line to detect changes after loading settings
  }

  saveAllSettings() {
    const allSettings = {
      systemSettings: this.systemSettings,
      securitySettings: this.securitySettings,
      backupSettings: this.backupSettings,
      userSettings: this.userSettings,
      advancedSettings: this.advancedSettings
    };

    // Sauvegarder dans le localStorage (remplacer par l'appel API)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('gsrv_settings', JSON.stringify(allSettings));
    }

    // Afficher un message de confirmation
    this.showSuccessMessage('Paramètres sauvegardés avec succès !');
  }

  resetToDefaults() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?')) {
      this.ngOnInit(); // Recharger les valeurs par défaut
      this.showSuccessMessage('Paramètres réinitialisés aux valeurs par défaut !');
    }
  }

  exportSettings() {
    const allSettings = {
      systemSettings: this.systemSettings,
      securitySettings: this.securitySettings,
      backupSettings: this.backupSettings,
      userSettings: this.userSettings,
      advancedSettings: this.advancedSettings
    };

    const dataStr = JSON.stringify(allSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `gsrv_settings_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    this.showSuccessMessage('Configuration exportée avec succès !');
  }

  refreshSettings() {
    this.loadSettings();
    this.showSuccessMessage('Paramètres actualisés !');
  }

  showSuccessMessage(message: string) {
    // Simple console log instead of toast notification
    console.log('SUCCESS:', message);
  }
}
