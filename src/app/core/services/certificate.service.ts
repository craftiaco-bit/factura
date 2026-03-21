import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Certificate } from '../models/certificate.model';

@Injectable({ providedIn: 'root' })
export class CertificateService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'honda_certificates';

  readonly certificates = signal<Certificate[]>(this.loadFromStorage());

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

    this.persistToStorage();
    return certificate;
  }

  delete(id: string): void {
    this.certificates.set(this.certificates().filter((c) => c.id !== id));
    this.persistToStorage();
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }

  private loadFromStorage(): Certificate[] {
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
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.certificates()));
  }
}
