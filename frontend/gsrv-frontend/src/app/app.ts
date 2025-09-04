import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, CommonModule],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App {
    protected readonly title = signal('ONSSA SM - Système de Gestion');
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
                try {
                    this.currentUser.set(JSON.parse(userRaw));
                } catch {
                    // Invalid user data, clear it
                    localStorage.removeItem('auth_user');
                    localStorage.removeItem('auth_token');
                    this.isAuthed.set(false);
                    this.currentUser.set(null);
                }
            }

            // Listen for storage changes
            window.addEventListener('storage', () => {
                const t = localStorage.getItem('auth_token');
                const u = localStorage.getItem('auth_user');
                this.isAuthed.set(!!t);
                this.currentUser.set(u ? JSON.parse(u) : null);
            });

            // Check if we're on the root path and redirect appropriately
            if (window.location.pathname === '/') {
                if (!token || !userRaw) {
                    this.router.navigateByUrl('/login');
                } else {
                    // User is authenticated, redirect to appropriate dashboard
                    try {
                        const user = JSON.parse(userRaw);
                        if (user.role === 'ADMIN') {
                            this.router.navigateByUrl('/admin-dashboard');
                        } else if (user.role === 'AGENT') {
                            this.router.navigateByUrl('/agent-dashboard');
                        } else {
                            this.router.navigateByUrl('/login');
                        }
                    } catch {
                        this.router.navigateByUrl('/login');
                    }
                }
            }
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
