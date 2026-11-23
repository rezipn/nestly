import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { fetchTransactions, insertTransaction, deleteTransaction, TransactionRow } from '../../supabase';

@Component({
  selector: 'app-transactions',
  imports: [ReactiveFormsModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss'
})
export class Transactions implements OnInit {
  private fb = inject(FormBuilder);

  items = signal<TransactionRow[]>([]);
  loading = signal(true);
  saving = signal(false);
  type = signal<'income' | 'expense'>('expense');

  categories = {
    expense: ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Kesehatan', 'Hiburan', 'Lainnya'],
    income: ['Gaji', 'Bonus', 'THR', 'Usaha', 'Lainnya'],
  };

  form = this.fb.group({
    category: ['Makan', Validators.required],
    who: ['Rezi', Validators.required],
    amount: ['', Validators.required],
    note: [''],
  });

  async ngOnInit() { await this.load(); }

  async load() {
    this.items.set(await fetchTransactions());
    this.loading.set(false);
  }

  setType(t: 'income' | 'expense') {
    this.type.set(t);
    this.form.patchValue({ category: this.categories[t][0] });
  }

  formatAmount(e: Event) {
    const input = e.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    input.value = digits ? Number(digits).toLocaleString('id-ID') : '';
    this.form.patchValue({ amount: input.value }, { emitEvent: false });
  }

  parseAmount() {
    return Number((this.form.value.amount || '').replace(/\D/g, ''));
  }

  async add() {
    const amount = this.parseAmount();
    if (this.form.invalid || this.saving() || amount < 1000) return;
    this.saving.set(true);
    const v = this.form.value;
    await insertTransaction({
      type: this.type(),
      category: v.category!,
      who: v.who!,
      amount,
      note: v.note || '',
    });
    this.form.reset({ category: this.categories[this.type()][0], who: 'Rezi', amount: '', note: '' });
    await this.load();
    this.saving.set(false);
  }

  async remove(id: number) {
    if (!confirm('Hapus transaksi ini?')) return;
    await deleteTransaction(id);
    await this.load();
  }

  rupiah(n: number) { return 'Rp' + n.toLocaleString('id-ID'); }
  dateOnly(s: string) { return s.slice(0, 10); }
}
