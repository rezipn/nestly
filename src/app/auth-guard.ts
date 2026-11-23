import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getSession } from './supabase';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const session = await getSession();
  if (session) return true;
  router.navigate(['/login']);
  return false;
};
