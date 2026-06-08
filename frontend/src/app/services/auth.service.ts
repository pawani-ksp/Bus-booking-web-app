import { Injectable } from '@angular/core';

type User = { id: string; name: string; email: string; role: string } | null;

@Injectable({ providedIn: 'root' })
export class AuthService {
  get token(): string | null {
    return localStorage.getItem('token');
  }

  get user(): User {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  hasRole(role: string): boolean {
    const u = this.user as any;
    return !!u && u.role === role;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
