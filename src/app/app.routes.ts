import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/goals/goals').then(m => m.Goals) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'goal/new', loadComponent: () => import('./pages/goal-new/goal-new').then(m => m.GoalNew) },
  { path: 'goal/:id', loadComponent: () => import('./pages/goal-detail/goal-detail').then(m => m.GoalDetail) },
];
