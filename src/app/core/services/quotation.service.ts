import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Quotation } from '../models/quotation.model';

@Injectable({ providedIn: 'root' })
export class QuotationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'honda_quotations';

  readonly quotations = signal<Quotation[]>(this.loadFromStorage());

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

    this.persistToStorage();
    return quotation;
  }

  delete(id: string): void {
    this.quotations.set(this.quotations().filter((q) => q.id !== id));
    this.persistToStorage();
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }

  generateNumber(): string {
    const num = Math.floor(10000000 + Math.random() * 90000000);
    return num.toString();
  }

  calculateTotal(q: Partial<Quotation>): number {
    return (
      (q.priceWithTax ?? 0) +
      (q.soatValue ?? 0) +
      (q.helmetValue ?? 0) +
      (q.accessoriesValue ?? 0) +
      (q.registrationValue ?? 0) +
      (q.insuranceValue ?? 0)
    ) * (q.quantity ?? 1);
  }

  private loadFromStorage(): Quotation[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private persistToStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.quotations()));
  }
}
