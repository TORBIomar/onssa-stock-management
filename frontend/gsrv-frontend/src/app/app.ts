import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { GlobalLoadingComponent } from './components/global-loading/global-loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, GlobalLoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Gestion des stocks ONSSA');
  protected readonly isAuthed = signal(false);
  protected readonly currentUser = signal<{ username: string; role: string } | null>(null);

  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth_token');
      const userRaw = localStorage.getItem('auth_user');
      this.isAuthed.set(!!token);
      if (userRaw) {
        try { this.currentUser.set(JSON.parse(userRaw)); } catch { }
      }
      window.addEventListener('storage', () => {
        const t = localStorage.getItem('auth_token');
        const u = localStorage.getItem('auth_user');
        this.isAuthed.set(!!t);
        this.currentUser.set(u ? JSON.parse(u) : null);
      });
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      this.isAuthed.set(false);
      this.currentUser.set(null);
      this.router.navigateByUrl('/login');
    }
  }
}