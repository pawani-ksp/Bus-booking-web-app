import { Component, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  protected readonly errorMsg = signal('');
  protected readonly loading  = signal(false);

  constructor(private router: Router) {}

  async onSubmit(e: Event): Promise<void> {
    e.preventDefault();
    this.errorMsg.set('');

    const form     = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const password        = String(formData.get('password')         ?? '');
    const confirmPassword = String(formData.get('confirm-password') ?? '');

    if (password !== confirmPassword) {
      this.errorMsg.set('Passwords do not match.');
      return;
    }

    const data = {
      name:     String(formData.get('name')   ?? ''),
      phone:    String(formData.get('number') ?? ''),
      email:    String(formData.get('email')  ?? ''),
      password,
      role:     String(formData.get('role')   ?? 'passenger')
    };

    if (!data.name || !data.email || !data.password || !data.role) {
      this.errorMsg.set('Please fill in all required fields.');
      return;
    }

    this.loading.set(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        await this.router.navigateByUrl('/login');
      } else {
        const err = await res.json();
        this.errorMsg.set(err.message || 'Registration failed');
      }
    } catch {
      this.errorMsg.set('Network error — please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
