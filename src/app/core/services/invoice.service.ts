import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Invoice, InvoiceItem } from '../models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);

  readonly invoices = signal<Invoice[]>([]);

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<Invoice[]>('/api/invoices').subscribe({
      next: (data) => this.invoices.set(data),
      error: () => this.invoices.set([]),
    });
  }

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

    this.http.post('/api/invoices', invoice).subscribe();
    return invoice;
  }

  delete(id: string): void {
    this.invoices.set(this.invoices().filter((i) => i.id !== id));
    this.http.delete(`/api/invoices?id=${id}`).subscribe();
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
}
