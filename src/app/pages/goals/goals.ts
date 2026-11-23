import { Component, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { fetchGoals, fetchContributions, GoalRow, ContributionRow } from '../../supabase';

interface Goal extends GoalRow { saved: number; }

@Component({
  selector: 'app-goals',
  imports: [RouterLink],
  templateUrl: './goals.html',
  styleUrl: './goals.scss'
})
export class Goals implements OnInit {
  goals = signal<Goal[]>([]);
  monthly = signal<{ month: string; amount: number }[]>([]);
  loading = signal(true);

  async ngOnInit() {
    const [goals, contributions] = await Promise.all([fetchGoals(), fetchContributions()]);
    this.goals.set(goals.map(g => ({
      ...g,
      saved: contributions.filter(c => c.goal_id === g.id).reduce((s, c) => s + c.amount, 0),
    })));
    this.monthly.set(this.last6Months(contributions));
    this.loading.set(false);
  }

  last6Months(contributions: ContributionRow[]) {
    const names = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const now = new Date();
    const result: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const amount = contributions
        .filter(c => {
          const cd = new Date(c.created_at);
          return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
        })
        .reduce((s, c) => s + c.amount, 0);
      result.push({ month: names[d.getMonth()], amount });
    }
    return result;
  }

  percent(g: Goal) { return Math.min(100, Math.round((g.saved / g.target) * 100)); }
  rupiah(n: number) { return 'Rp' + n.toLocaleString('id-ID'); }
  short(n: number) { return n >= 1000000 ? (n / 1000000).toFixed(1).replace('.0', '') + 'jt' : (n / 1000) + 'rb'; }
  dash(g: Goal) { return (this.percent(g) / 100) * 163.36; }
  barHeight(amount: number) {
    const max = Math.max(...this.monthly().map(m => m.amount), 1);
    return Math.round((amount / max) * 100);
  }
}
