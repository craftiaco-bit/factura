import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Certificate } from '../models/certificate.model';

@Injectable({ providedIn: 'root' })
export class CertificateService {
  private readonly http = inject(HttpClient);

  readonly certificates = signal<Certificate[]>([]);

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<Certificate[]>('/api/certificates').subscribe({
      next: (data) => this.certificates.set(data),
      error: () => this.certificates.set([]),
    });
  }

  getById(id: string) {
    return computed(() => this.certificates().find((c) => c.id === id) ?? null);
  }

  save(certificate: Certificate): Certificate {
    const existing = this.certificates();
    const index = existing.findIndex((c) => c.id === certificate.id);

    if (index >= 0) {
      const updated = [...existing];
      updated[index] = certificate;
      this.certificates.set(updated);
    } else {
      this.certificates.set([...existing, certificate]);
    }

    this.http.post('/api/certificates', certificate).subscribe();
    return certificate;
  }

  delete(id: string): void {
    this.certificates.set(this.certificates().filter((c) => c.id !== id));
    this.http.delete(`/api/certificates?id=${id}`).subscribe();
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }
}
