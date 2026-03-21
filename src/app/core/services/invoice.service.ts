import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Invoice, InvoiceItem } from '../models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'honda_invoices';

  readonly invoices = signal<Invoice[]>(this.loadFromStorage());

  getById(id: string) {
    return computed(() => this.invoices().find((i) => i.id === id) ?? null);
  }

  getByNumber(number: string) {
    return computed(() => this.invoices().find((i) => i.number === number) ?? null);
  }

  searchByNumber(query: string) {
    return computed(() => {
      if (!query.trim()) return [];
      const q = query.trim().toUpperCase();
      return this.invoices().filter((i) => i.number.toUpperCase().includes(q));
    });
  }

  save(invoice: Invoice): Invoice {
    const existing = this.invoices();
    const index = existing.findIndex((i) => i.id === invoice.id);

    if (index >= 0) {
      const updated = [...existing];
      updated[index] = invoice;
      this.invoices.set(updated);
    } else {
      this.invoices.set([...existing, invoice]);
    }

    this.persistToStorage();
    return invoice;
  }

  delete(id: string): void {
    this.invoices.set(this.invoices().filter((i) => i.id !== id));
    this.persistToStorage();
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }

  generateNumber(): string {
    const num = Math.floor(10000 + Math.random() * 90000);
    return `FAC-${num}`;
  }

  calculateItemTotal(item: InvoiceItem): number {
    return item.quantity * item.unitPrice;
  }

  calculateSubtotal(items: InvoiceItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  calculateTax(subtotal: number, taxRate = 0.19): number {
    return Math.round(subtotal * taxRate);
  }

  calculateTotal(subtotal: number, tax: number): number {
    return subtotal + tax;
  }

  private loadFromStorage(): Invoice[] {
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
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.invoices()));
  }
}
