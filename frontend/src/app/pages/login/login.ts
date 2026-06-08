import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  async onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Login failed');
        return;
      }
      const data = await res.json();
      // store token and basic user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // redirect based on role
      if (data.user.role === 'driver') window.location.href = '/driver-dashboard';
      else if (data.user.role === 'owner') window.location.href = '/owner-dashboard';
      else window.location.href = '/passenger-dashboard';
    } catch (err) {
      alert('Network error');
    }
  }
}