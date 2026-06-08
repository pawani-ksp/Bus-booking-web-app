import { Routes } from '@angular/router';

import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { PassengerDashboard } from './pages/passenger-dashboard/passenger-dashboard';
import { PassengerProfile } from './pages/passenger-profile/passenger-profile';
import { BusList } from './pages/bus_list/bus-list';
import { OwnerDashboard } from './pages/owner-dashboard/owner-dashboard';
import { DriverDashboard } from './pages/driver-dashboard/driver-dashboard';
import { OwnerGuard } from './guards/owner.guard';
import { DriverGuard } from './guards/driver.guard';

export const routes: Routes = [
  { path: 'landing', component: Landing },
  { path: 'login', component: Login },
  { path: 'bus-list', component: BusList },
  { path: 'passenger-dashboard', component: PassengerDashboard },
  { path: 'passenger-profile', component: PassengerProfile },
  { path: 'owner-dashboard', component: OwnerDashboard, canActivate: [OwnerGuard] },
  { path: 'driver-dashboard', component: DriverDashboard, canActivate: [DriverGuard] },
  { path: 'register', component: Register }

];