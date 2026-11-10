import { Component, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  protected readonly errorMsg = signal('');
  protected readonly loading  = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit(e: Event): Promise<void> {
    e.preventDefault();
    this.errorMsg.set('');

    const form     = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email    = String(formData.get('email')    ?? '');
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
      this.errorMsg.set('Please enter your email and password.');
      return;
    }

    this.loading.set(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const err = await res.json();
        this.errorMsg.set(err.message || 'Login failed');
        return;
      }

      const data = await res.json();
      this.auth.saveSession(data.token, data.user);

      // Navigate based on role
      const roleRoutes: Record<string, string> = {
        driver:    '/driver-dashboard',
        owner:     '/owner-dashboard',
        passenger: '/passenger-dashboard'
      };
      await this.router.navigateByUrl(roleRoutes[data.user.role] ?? '/landing');
    } catch {
      this.errorMsg.set('Network error — please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
