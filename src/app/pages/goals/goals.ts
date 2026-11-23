import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Goal {
  id: number;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  color: string;
}

@Component({
  selector: 'app-goals',
  imports: [RouterLink],
  templateUrl: './goals.html',
  styleUrl: './goals.scss'
})
export class Goals {
  goals = signal<Goal[]>([
    { id: 1, name: 'Liburan Bali', target: 10000000, saved: 3500000, deadline: '2027-06-30', color: '#5b8e7d' },
    { id: 2, name: 'Dana Nikah', target: 50000000, saved: 12000000, deadline: '2027-12-31', color: '#d9a05b' },
    { id: 3, name: 'Motor Baru', target: 20000000, saved: 20000000, deadline: '2026-12-31', color: '#bc6c25' },
  ]);

  monthly = signal([
    { month: 'Jun', amount: 1200000 },
    { month: 'Jul', amount: 1800000 },
    { month: 'Agu', amount: 900000 },
    { month: 'Sep', amount: 2200000 },
    { month: 'Okt', amount: 2600000 },
    { month: 'Nov', amount: 3100000 },
  ]);

  percent(g: Goal) { return Math.round((g.saved / g.target) * 100); }
  rupiah(n: number) { return 'Rp' + n.toLocaleString('id-ID'); }
  short(n: number) { return n >= 1000000 ? (n / 1000000).toFixed(1).replace('.0', '') + 'jt' : (n / 1000) + 'rb'; }

  // Donut: keliling lingkaran r=26 adalah 163.36
  dash(g: Goal) { return (this.percent(g) / 100) * 163.36; }
  barHeight(amount: number) {
    const max = Math.max(...this.monthly().map(m => m.amount));
    return Math.round((amount / max) * 100);
  }
}
