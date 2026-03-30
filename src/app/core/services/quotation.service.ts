import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Quotation } from '../models/quotation.model';

const STORAGE_KEY = 'quotations';

@Injectable({ providedIn: 'root' })
export class QuotationService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  readonly quotations = signal<Quotation[]>([]);

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    const local = this.readLocal();
    if (local.length) this.quotations.set(local);

    this.http.get<Quotation[]>('/api/quotations').subscribe({
      next: (data) => {
        this.quotations.set(data);
        this.writeLocal(data);
      },
      error: () => {
        if (!local.length) this.quotations.set([]);
      },
    });
  }

  getById(id: string) {
    return computed(() => this.quotations().find((q) => q.id === id) ?? null);
  }

  save(quotation: Quotation): Quotation {
    const existing = this.quotations();
    const index = existing.findIndex((q) => q.id === quotation.id);

    if (index >= 0) {
      const updated = [...existing];
      updated[index] = quotation;
      this.quotations.set(updated);
    } else {
      this.quotations.set([...existing, quotation]);
    }

    this.writeLocal(this.quotations());
    this.http.post('/api/quotations', quotation).subscribe();
    return quotation;
  }

  delete(id: string): void {
    this.quotations.set(this.quotations().filter((q) => q.id !== id));
    this.writeLocal(this.quotations());
    this.http.delete(`/api/quotations?id=${id}`).subscribe();
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }

  generateNumber(): string {
    const num = Math.floor(10000000 + Math.random() * 90000000);
    return num.toString();
  }

  calculateTotal(q: Partial<Quotation>): number {
    const subtotal = (
      (q.priceWithTax ?? 0) +
      (q.soatValue ?? 0) +
      (q.registrationValue ?? 0) +
      (q.insuranceValue ?? 0)
    ) * (q.quantity ?? 1);
    return subtotal - (q.initialPayment ?? 0);
  }

  private readLocal(): Quotation[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  private writeLocal(data: Quotation[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }
}
