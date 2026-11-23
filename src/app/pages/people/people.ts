import { Component, signal, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { fetchPeople, insertPerson, updatePerson, deletePerson, updatePersonBalance, PersonRow } from '../../supabase';

@Component({
  selector: 'app-people',
  imports: [ReactiveFormsModule],
  templateUrl: './people.html',
  styleUrl: './people.scss'
})
export class People implements OnInit {
  private fb = inject(FormBuilder);

  people = signal<PersonRow[]>([]);
  editingId = signal<number | null>(null);
  saving = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    balance: [''],
  });

  async ngOnInit() { await this.load(); }

  async load() { this.people.set(await fetchPeople()); }

  formatAmount(event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    const formatted = digits ? Number(digits).toLocaleString('id-ID') : '';
    input.value = formatted;
    this.form.controls.balance.setValue(formatted, { emitEvent: false });
  }

  parseAmount(): number {
    return Number(String(this.form.value.balance).replace(/\D/g, ''));
  }

  rupiah(n: number) { return 'Rp' + (n || 0).toLocaleString('id-ID'); }

  edit(p: PersonRow) {
    this.editingId.set(p.id);
    this.form.patchValue({ name: p.name, balance: (p.balance || 0).toLocaleString('id-ID') });
  }

  cancelEdit() {
    this.editingId.set(null);
    this.form.reset({ name: '', balance: '' });
  }

  async save() {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const name = this.form.value.name!;
    const balance = this.parseAmount();
    if (this.editingId()) {
      await updatePerson(this.editingId()!, name);
      await updatePersonBalance(this.editingId()!, balance);
    } else {
      await insertPerson(name);
    }
    this.cancelEdit();
    await this.load();
    this.saving.set(false);
  }

  async remove(id: number) {
    if (!confirm('Hapus orang ini? Transaksi lamanya tidak ikut terhapus.')) return;
    await deletePerson(id);
    await this.load();
  }
}
