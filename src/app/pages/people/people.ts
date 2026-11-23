import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { fetchPeople, insertPerson, updatePerson, deletePerson, PersonRow } from '../../supabase';

@Component({
  selector: 'app-people',
  imports: [ReactiveFormsModule],
  templateUrl: './people.html',
  styleUrl: './people.scss'
})
export class People implements OnInit {
  private fb = inject(FormBuilder);

  people = signal<PersonRow[]>([]);
  loading = signal(true);
  saving = signal(false);
  editingId = signal<number | null>(null);

  form = this.fb.group({ name: ['', Validators.required] });

  async ngOnInit() { await this.load(); }

  async load() {
    this.people.set(await fetchPeople());
    this.loading.set(false);
  }

  async save() {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const name = this.form.value.name!.trim();
    if (this.editingId()) {
      await updatePerson(this.editingId()!, name);
      this.editingId.set(null);
    } else {
      await insertPerson(name);
    }
    this.form.reset({ name: '' });
    await this.load();
    this.saving.set(false);
  }

  edit(p: PersonRow) {
    this.editingId.set(p.id);
    this.form.patchValue({ name: p.name });
  }

  cancelEdit() {
    this.editingId.set(null);
    this.form.reset({ name: '' });
  }

  async remove(p: PersonRow) {
    if (!confirm(`Hapus "${p.name}" dari daftar? Transaksi lama tetap tersimpan.`)) return;
    await deletePerson(p.id);
    await this.load();
  }
}
