import { Component, signal, OnInit } from '@angular/core';
import { fetchTransactions, fetchGoals, fetchContributions, TransactionRow } from '../../supabase';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  loading = signal(true);
  incomeMonth = signal(0);
  expenseMonth = signal(0);
  totalSaved = signal(0);
  byCategory = signal<{ category: string; amount: number }[]>([]);
  byPerson = signal<{ who: string; amount: number }[]>([]);
  monthly = signal<{ month: string; income: number; expense: number }[]>([]);
  personDetails = signal<{ who: string; income: number; expense: number; categories: { category: string; amount: number }[] }[]>([]);

  async ngOnInit() {
    const [tx, goals, contributions] = await Promise.all([
      fetchTransactions(), fetchGoals(), fetchContributions(),
    ]);
    const now = new Date();
    const inMonth = (s: string) => {
      const d = new Date(s);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    };

    this.incomeMonth.set(tx.filter(t => t.type === 'income' && inMonth(t.created_at)).reduce((s, t) => s + t.amount, 0));
    this.expenseMonth.set(tx.filter(t => t.type === 'expense' && inMonth(t.created_at)).reduce((s, t) => s + t.amount, 0));
    this.totalSaved.set(contributions.reduce((s, c) => s + c.amount, 0));

    const catMap = new Map<string, number>();
    tx.filter(t => t.type === 'expense' && inMonth(t.created_at))
      .forEach(t => catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount));
    this.byCategory.set([...catMap.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount));

    const personMap = new Map<string, number>();
    tx.filter(t => t.type === 'expense' && inMonth(t.created_at))
      .forEach(t => personMap.set(t.who, (personMap.get(t.who) || 0) + t.amount));
    this.byPerson.set([...personMap.entries()].map(([who, amount]) => ({ who, amount })));

    const peopleNames = [...new Set(tx.map(t => t.who))];
this.personDetails.set(peopleNames.map(who => {
  const mine = tx.filter(t => t.who === who && inMonth(t.created_at));
  const catMap2 = new Map<string, number>();
  mine.filter(t => t.type === 'expense').forEach(t => catMap2.set(t.category, (catMap2.get(t.category) || 0) + t.amount));
  return {
    who,
    income: mine.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expense: mine.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    categories: [...catMap2.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount),
  };
}));

    this.monthly.set(this.last6Months(tx));
    this.loading.set(false);
  }

  last6Months(tx: TransactionRow[]) {
    const names = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const same = (s: string) => { const cd = new Date(s); return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth(); };
      result.push({
        month: names[d.getMonth()],
        income: tx.filter(t => t.type === 'income' && same(t.created_at)).reduce((s, t) => s + t.amount, 0),
        expense: tx.filter(t => t.type === 'expense' && same(t.created_at)).reduce((s, t) => s + t.amount, 0),
      });
    }
    return result;
  }

  net() { return this.incomeMonth() - this.expenseMonth(); }
  catWidth(amount: number) {
    const max = Math.max(...this.byCategory().map(c => c.amount), 1);
    return Math.round((amount / max) * 100);
  }
  barHeight(amount: number) {
    const max = Math.max(...this.monthly().flatMap(m => [m.income, m.expense]), 1);
    return Math.round((amount / max) * 100);
  }
  rupiah(n: number) { return 'Rp' + n.toLocaleString('id-ID'); }
  short(n: number) { return n >= 1000000 ? (n / 1000000).toFixed(1).replace('.0', '') + 'jt' : (n / 1000) + 'rb'; }
  personCatWidth(cats: { amount: number }[], amount: number) {
  const max = Math.max(...cats.map(c => c.amount), 1);
  return Math.round((amount / max) * 100);
}

}
