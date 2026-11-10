import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'passenger' | 'owner' | 'driver';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor(private router: Router) {}

  get token(): string | null {
    if (!this.isBrowser) return null;
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  }

  get user(): User | null {
    if (!this.isBrowser) return null;
    try {
      const raw = localStorage.getItem('user');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  /**
   * Saves token + user to localStorage.
   * Called by the Login component after a successful /api/auth/login response.
   */
  saveSession(token: string, user: User): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch {
      // safe fallback
    }
  }

  /** Clears session and redirects to /login */
  logout(): void {
    if (this.isBrowser) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {
        // safe fallback
      }
    }
    this.router.navigate(['/login']);
  }

  /** Convenience: auth header value for fetch() calls */
  get authHeader(): string {
    return this.token ? `Bearer ${this.token}` : '';
  }
}
