import { Routes } from '@angular/router';

import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Admin } from './pages/admin/admin';
import { PassengerDashboard } from './pages/passenger-dashboard/passenger-dashboard';
import { PassengerProfile } from './pages/passenger-profile/passenger-profile';

export const routes: Routes = [
  { path: 'landing', component: Landing },
  { path: 'login', component: Login },
  { path: 'admin', component: Admin },
  { path: 'passenger-dashboard', component: PassengerDashboard },
  { path: 'passenger-profile', component: PassengerProfile },
  { path: 'register', component: Register }

];