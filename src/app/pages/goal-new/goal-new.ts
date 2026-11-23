import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { insertGoal } from '../../supabase';

@Component({
  selector: 'app-goal-new',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './goal-new.html',
  styleUrl: './goal-new.scss'
})
export class GoalNew {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  saving = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    target: ['', Validators.required],
    deadline: ['', Validators.required],
    color: ['#5b8e7d'],
  });

  colors = ['#5b8e7d', '#d9a05b', '#bc6c25', '#7fb069', '#e07a5f', '#6d8ea0'];

  formatAmount(event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    const formatted = digits ? Number(digits).toLocaleString('id-ID') : '';
    input.value = formatted;
    this.form.controls.target.setValue(formatted, { emitEvent: false });
  }

  async save() {
    const target = Number(String(this.form.value.target).replace(/\D/g, ''));
    if (this.form.invalid || this.saving() || target < 1000) return;
    this.saving.set(true);
    const v = this.form.value;
    await insertGoal(v.name!, target, v.deadline!, v.color!);
    this.router.navigate(['/']);
  }
}
