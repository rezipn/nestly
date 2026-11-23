import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { signIn, signUp } from '../../supabase';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  mode = signal<'login' | 'daftar'>('login');
  error = signal('');
  loading = signal(false);
  shake = signal(false);
  animKey = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  toggle() {
    this.mode.update(m => (m === 'login' ? 'daftar' : 'login'));
    this.error.set('');
    this.animKey.set(false);
    setTimeout(() => this.animKey.set(true), 10);
  }

  async submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.value;
    try {
      if (this.mode() === 'daftar') {
        await signUp(email!, password!);
      }
      await signIn(email!, password!);
      this.router.navigate(['/']);
    } catch (e: any) {
      this.error.set(e.message || 'Terjadi kesalahan');
      this.shake.set(true);
      setTimeout(() => this.shake.set(false), 500);
    }
    this.loading.set(false);
  }
}
