import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Certificate } from '../models/certificate.model';

const STORAGE_KEY = 'certificates';

@Injectable({ providedIn: 'root' })
export class CertificateService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  readonly certificates = signal<Certificate[]>([]);

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    const local = this.readLocal();
    if (local.length) this.certificates.set(local);

    this.http.get<Certificate[]>('/api/certificates').subscribe({
      next: (data) => {
        this.certificates.set(data);
        this.writeLocal(data);
      },
      error: () => {
        if (!local.length) this.certificates.set([]);
      },
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

    this.writeLocal(this.certificates());
    this.http.post('/api/certificates', certificate).subscribe();
    return certificate;
  }

  delete(id: string): void {
    this.certificates.set(this.certificates().filter((c) => c.id !== id));
    this.writeLocal(this.certificates());
    this.http.delete(`/api/certificates?id=${id}`).subscribe();
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }

  private readLocal(): Certificate[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  private writeLocal(data: Certificate[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }
}
