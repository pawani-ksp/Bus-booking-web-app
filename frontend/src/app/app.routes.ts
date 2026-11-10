import { Routes } from '@angular/router';

import { Landing }           from './pages/landing/landing';
import { Login }             from './pages/login/login';
import { Register }          from './pages/register/register';
import { PassengerDashboard } from './pages/passenger-dashboard/passenger-dashboard';
import { PassengerProfile }  from './pages/passenger-profile/passenger-profile';
import { BusList }           from './pages/bus_list/bus-list';
import { OwnerDashboard }    from './pages/owner-dashboard/owner-dashboard';
import { DriverDashboard }   from './pages/driver-dashboard/driver-dashboard';
import { SeatBooking }       from './pages/seat-booking/seat-booking';

import { OwnerGuard }        from './guards/owner.guard';
import { DriverGuard }       from './guards/driver.guard';
import { PassengerGuard }    from './guards/passenger.guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: 'landing', pathMatch: 'full' },

  // Public routes
  { path: 'landing',  component: Landing },
  { path: 'login',    component: Login },
  { path: 'register', component: Register },
  { path: 'bus-list', component: BusList },

  // Passenger routes (guarded)
  { path: 'passenger-dashboard', component: PassengerDashboard, canActivate: [PassengerGuard] },
  { path: 'passenger-profile',   component: PassengerProfile,   canActivate: [PassengerGuard] },
  { path: 'seat-booking',        component: SeatBooking,        canActivate: [PassengerGuard] },

  // Owner routes (guarded)
  { path: 'owner-dashboard', component: OwnerDashboard, canActivate: [OwnerGuard] },

  // Driver routes (guarded)
  { path: 'driver-dashboard', component: DriverDashboard, canActivate: [DriverGuard] },

  // Fallback
  { path: '**', redirectTo: 'landing' }
];
