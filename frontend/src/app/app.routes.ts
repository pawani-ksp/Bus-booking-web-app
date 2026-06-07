import { Routes } from '@angular/router';

import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Admin } from './pages/admin/admin';
import { PassengerDashboard } from './pages/passenger-dashboard/passenger-dashboard';

export const routes: Routes = [
  { path: 'landing', component: Landing },
  { path: 'login', component: Login },
  { path: 'admin', component: Admin },
  { path: 'passenger-dashboard', component: PassengerDashboard },
  { path: 'register', component: Register }

];