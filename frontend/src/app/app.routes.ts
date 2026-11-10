import { Routes } from '@angular/router';

import { Landing }            from './pages/landing/landing';
import { Login }              from './pages/login/login';
import { Register }           from './pages/register/register';
import { PassengerDashboard }  from './pages/passenger-dashboard/passenger-dashboard';
import { PassengerProfile }   from './pages/passenger-profile/passenger-profile';
import { BusList }            from './pages/bus_list/bus-list';
import { OwnerDashboard }     from './pages/owner-dashboard/owner-dashboard';
import { DriverDashboard }    from './pages/driver-dashboard/driver-dashboard';
import { SeatBooking }        from './pages/seat-booking/seat-booking';
import { BusStationMap }      from './pages/bus_station_map/bus-station-map';
import { RouteMap }           from './pages/route_map/route-map';
import { MyBookings }         from './pages/my_bookings/my-bookings';
import { BusRating }          from './pages/bus_rating/bus-rating';
import { RegisterBus }        from './pages/register_bus/register-bus';

import { OwnerGuard }         from './guards/owner.guard';
import { DriverGuard }        from './guards/driver.guard';
import { PassengerGuard }     from './guards/passenger.guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: 'landing', pathMatch: 'full' },

  // Public routes
  { path: 'landing',         component: Landing },
  { path: 'login',           component: Login },
  { path: 'register',        component: Register },
  { path: 'bus-list',        component: BusList },
  { path: 'bus-station-map', component: BusStationMap },
  { path: 'route-map',       component: RouteMap },
  { path: 'bus-rating',      component: BusRating },

  // Aliases for legacy/quick links
  { path: 'seat-selection',  redirectTo: 'seat-booking', pathMatch: 'full' },
  { path: 'cancel-booking',  redirectTo: 'my-bookings',  pathMatch: 'full' },

  // Passenger routes (guarded)
  { path: 'passenger-dashboard', component: PassengerDashboard, canActivate: [PassengerGuard] },
  { path: 'passenger-profile',   component: PassengerProfile,   canActivate: [PassengerGuard] },
  { path: 'seat-booking',        component: SeatBooking,        canActivate: [PassengerGuard] },
  { path: 'my-bookings',         component: MyBookings,         canActivate: [PassengerGuard] },

  // Owner routes (guarded)
  { path: 'owner-dashboard', component: OwnerDashboard, canActivate: [OwnerGuard] },
  { path: 'register-bus',    component: RegisterBus,    canActivate: [OwnerGuard] },

  // Driver routes (guarded)
  { path: 'driver-dashboard', component: DriverDashboard, canActivate: [DriverGuard] },

  // Fallback
  { path: '**', redirectTo: 'landing' }
];
