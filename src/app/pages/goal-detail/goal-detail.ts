import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { fetchGoalById, fetchContributionsByGoal, insertContribution, GoalRow, ContributionRow } from '../../supabase';

@Component({
  selector: 'app-goal-detail',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './goal-detail.html',
  styleUrl: './goal-detail.scss'
})
export class GoalDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  goalId = Number(this.route.snapshot.paramMap.get('id'));
  goal = signal<GoalRow | null>(null);
  contributions = signal<ContributionRow[]>([]);
  saving = signal(false);

  form = this.fb.group({
  who: ['Rezi', Validators.required],
  amount: ['', Validators.required],
  note: [''],
  });

  async ngOnInit() { await this.load(); }

  async load() {
    const [goal, contributions] = await Promise.all([
      fetchGoalById(this.goalId),
      fetchContributionsByGoal(this.goalId),
    ]);
    this.goal.set(goal);
    this.contributions.set(contributions);
  }

  saved() { return this.contributions().reduce((s, c) => s + c.amount, 0); }
  percent() {
    const g = this.goal();
    return g ? Math.min(100, Math.round((this.saved() / g.target) * 100)) : 0;
  }
  rupiah(n: number) { return 'Rp' + n.toLocaleString('id-ID'); }
  dateOnly(s: string) { return s.slice(0, 10); }

  formatAmount(event: Event) {
  const input = event.target as HTMLInputElement;
  const digits = input.value.replace(/\D/g, '');
  const formatted = digits ? Number(digits).toLocaleString('id-ID') : '';
  input.value = formatted;
  this.form.controls.amount.setValue(formatted, { emitEvent: false });
}

parseAmount(): number {
  return Number(String(this.form.value.amount).replace(/\D/g, ''));
}

  async add() {
  const amount = this.parseAmount();
  if (this.form.invalid || this.saving() || amount < 1000) return;
  this.saving.set(true);
  const v = this.form.value;
  await insertContribution(this.goalId, v.who!, amount, v.note || '');
  this.form.reset({ who: 'Rezi', amount: '', note: '' });
  await this.load();
  this.saving.set(false);
  }
}
