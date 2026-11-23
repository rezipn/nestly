import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { fetchGoalById, fetchContributionsByGoal, insertContribution, deleteGoal, deleteContribution, fetchPeople, GoalRow, ContributionRow, PersonRow } from '../../supabase';

@Component({
  selector: 'app-goal-detail',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './goal-detail.html',
  styleUrl: './goal-detail.scss'
})
export class GoalDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  goalId = Number(this.route.snapshot.paramMap.get('id'));
  goal = signal<GoalRow | null>(null);
  contributions = signal<ContributionRow[]>([]);
  people = signal<PersonRow[]>([]);
  saving = signal(false);

  form = this.fb.group({
  who: ['Rezi', Validators.required],
  amount: ['', Validators.required],
  note: [''],
});
  
  async ngOnInit() { await this.load(); }

  async load() {
  this.people.set(await fetchPeople());
  if (this.people().length) this.form.patchValue({ who: this.people()[0].name });
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
  // import: tambahkan deleteGoal, deleteContribution
// di dalam class:
async removeContribution(id: number) {
  if (!confirm('Hapus setoran ini?')) return;
  await deleteContribution(id);
  await this.load();
}

async removeGoal() {
  if (!confirm('Hapus goal ini beserta semua setorannya?')) return;
  await deleteGoal(this.goalId);
  this.router.navigate(['/']);
}

}

