import { Routes } from '@angular/router';
import { authGuard } from './auth-guard';

export const routes: Routes = [
  { path: '', canActivate: [authGuard], loadComponent: () => import('./pages/goals/goals').then(m => m.Goals) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'goal/new', canActivate: [authGuard], loadComponent: () => import('./pages/goal-new/goal-new').then(m => m.GoalNew) },
  { path: 'transaksi', canActivate: [authGuard], loadComponent: () => import('./pages/transactions/transactions').then(m => m.Transactions) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
  { path: 'orang', canActivate: [authGuard], loadComponent: () => import('./pages/people/people').then(m => m.People) },
  { path: 'goal/:id', canActivate: [authGuard], loadComponent: () => import('./pages/goal-detail/goal-detail').then(m => m.GoalDetail) },
];
