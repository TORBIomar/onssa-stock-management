import { Routes } from '@angular/router';
import { LoginComponent } from './components/backend-status/auth/login.component';
import { RegisterComponent } from './components/backend-status/auth/register.component';
import { BackendStatusComponent } from './components/backend-status/backend-status.component';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard.component';
import { AgentDashboardComponent } from './components/dashboard/agent-dashboard.component';
import { UsersPageComponent } from './components/users/users.page';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { ProductsPageComponent } from './components/products/products.page';
import { ReclamationsPageComponent } from './components/reclamations/reclamations.page';
import { TasksComponent } from './components/tasks/tasks.component';
import { ReportsComponent } from './components/reports/reports.component';
import { SettingsComponent } from './components/settings/settings.component';
import { InspectionsComponent } from './components/inspections/inspections.component';
import { authGuard, roleRedirect } from './services/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/login' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'status', component: BackendStatusComponent },

  // Dashboard routes - redirect to role-specific dashboard
  { path: 'dashboard', redirectTo: '/dashboard/admin', pathMatch: 'full' },
  { path: 'dashboard/admin', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: 'dashboard/agent', component: AgentDashboardComponent, canActivate: [authGuard] },

  // Main feature routes
  { path: 'users', component: UsersPageComponent, canActivate: [authGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductsPageComponent, canActivate: [authGuard] },
  { path: 'reclamations', component: ReclamationsPageComponent, canActivate: [authGuard] },
  { path: 'tasks', component: TasksComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },

  // Role-specific routes
  { path: 'inspections', component: InspectionsComponent, canActivate: [authGuard] },

  // Catch all route - redirect to login
  { path: '**', redirectTo: '/login' }
];