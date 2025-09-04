import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard.component';
import { AgentDashboardComponent } from './components/dashboard/agent-dashboard.component';
import { ProductsPageComponent } from './components/products/products.page';
import { ReclamationsPageComponent } from './components/reclamations/reclamations.page';
import { TasksComponent } from './components/tasks/tasks.component';
import { ReportsComponent } from './components/reports/reports.component';
import { UsersPageComponent } from './components/users/users.page';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { SettingsComponent } from './components/settings/settings.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: 'agent-dashboard', component: AgentDashboardComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductsPageComponent, canActivate: [authGuard] },
  { path: 'reclamations', component: ReclamationsPageComponent, canActivate: [authGuard] },
  { path: 'tasks', component: TasksComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersPageComponent, canActivate: [authGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' }
];