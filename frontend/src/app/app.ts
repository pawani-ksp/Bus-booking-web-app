import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private auth: AuthService) {}

  readonly isLoggedIn = computed(() => this.auth.isAuthenticated());

  readonly dashboardRoute = computed(() => {
    const role = this.auth.user?.role;
    if (role === 'owner')  return '/owner-dashboard';
    if (role === 'driver') return '/driver-dashboard';
    return '/passenger-dashboard';
  });

  logout(): void {
    this.auth.logout();
  }
}
