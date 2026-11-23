import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface Contribution {
  id: number;
  who: string;
  amount: number;
  date: string;
  note: string;
}

@Component({
  selector: 'app-goal-detail',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './goal-detail.html',
  styleUrl: './goal-detail.scss'
})
export class GoalDetail {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  goalId = Number(this.route.snapshot.paramMap.get('id'));

  goal = signal({ name: 'Liburan Bali', target: 10000000, saved: 3500000, deadline: '2027-06-30', color: '#5b8e7d' });

  contributions = signal<Contribution[]>([
    { id: 1, who: 'Rezi', amount: 1000000, date: '2026-11-01', note: 'Gajian November' },
    { id: 2, who: 'Pasangan', amount: 1500000, date: '2026-11-10', note: 'Bonus' },
    { id: 3, who: 'Rezi', amount: 1000000, date: '2026-11-20', note: 'Sisa jajan' },
  ]);

  form = this.fb.group({
    who: ['Rezi', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(1000)]],
    note: [''],
  });

  percent() { return Math.round((this.goal().saved / this.goal().target) * 100); }
  rupiah(n: number) { return 'Rp' + n.toLocaleString('id-ID'); }

  add() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const amount = Number(v.amount);
    this.contributions.update(list => [
      { id: Date.now(), who: v.who!, amount, date: new Date().toISOString().slice(0, 10), note: v.note || '' },
      ...list,
    ]);
    this.goal.update(g => ({ ...g, saved: g.saved + amount }));
    this.form.reset({ who: 'Rezi', amount: null, note: '' });
  }
}
