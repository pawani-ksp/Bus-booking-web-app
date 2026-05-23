import { Routes } from '@angular/router';

import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Admin } from './pages/admin/admin';

export const routes: Routes = [
  { path: 'landing', component: Landing },
  { path: 'login', component: Login },
  { path: 'admin', component: Admin },
  { path: 'register', component: Register }

];