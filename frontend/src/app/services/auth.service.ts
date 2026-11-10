import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'passenger' | 'owner' | 'driver';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router) {}

  get token(): string | null {
    return localStorage.getItem('token');
  }

  get user(): User | null {
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
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /** Clears session and redirects to /login */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  /** Convenience: auth header value for fetch() calls */
  get authHeader(): string {
    return this.token ? `Bearer ${this.token}` : '';
  }
}
