import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CertificateService } from '../../core/services/certificate.service';
import { Certificate } from '../../core/models/certificate.model';

@Component({
  selector: 'app-certificate-edit',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 py-8 px-4">
      <div class="max-w-2xl mx-auto">

        <!-- Header -->
        <div class="bg-[#222] text-white p-6 rounded-t-lg">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="font-[Oxanium] text-2xl font-bold uppercase tracking-wide">
                Buscar / Editar Certificado
              </h1>
              <p class="text-sm text-gray-400 mt-1">Busca por nombre del titular</p>
            </div>
            <img src="/Honda_Logo.svg.png" alt="Honda" class="h-10 invert" />
          </div>
        </div>

        <div class="bg-white rounded-b-lg shadow-lg p-6 space-y-6">

          <!-- Search -->
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#D5150D] focus:border-transparent"
              placeholder="Buscar por nombre del titular..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearch($event)"
            />
          </div>

          <!-- Search Results -->
          @if (searchQuery && !editingCert()) {
            @if (searchResults().length > 0) {
              <div class="space-y-2">
                <p class="text-sm text-gray-500">{{ searchResults().length }} resultado(s)</p>
                @for (cert of searchResults(); track cert.id) {
                  <div
                    class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#D5150D] hover:bg-red-50 transition-all cursor-pointer"
                    (click)="loadCert(cert)"
                  >
                    <div>
                      <p class="font-[Oxanium] font-bold text-sm">{{ cert.personName }}</p>
                      <p class="text-xs text-gray-500">CC {{ cert.documentNumber }} &bull; {{ cert.accountBank }} &bull; {{ cert.accountType }}</p>
                    </div>
                    <div class="text-right text-xs text-gray-500">
                      {{ cert.accountNumber }}
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto text-gray-300 mb-3">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <p class="text-gray-400 font-semibold">No se encontraron certificados</p>
              </div>
            }
          }

          <!-- All certs (when no search) -->
          @if (!searchQuery && !editingCert()) {
            @if (allCerts().length > 0) {
              <p class="text-sm text-gray-500 font-semibold">Todos los certificados ({{ allCerts().length }})</p>
              <div class="space-y-2">
                @for (cert of allCerts(); track cert.id) {
                  <div
                    class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#D5150D] hover:bg-red-50 transition-all cursor-pointer"
                    (click)="loadCert(cert)"
                  >
                    <div>
                      <p class="font-[Oxanium] font-bold text-sm">{{ cert.personName }}</p>
                      <p class="text-xs text-gray-500">CC {{ cert.documentNumber }} &bull; {{ cert.accountBank }} &bull; {{ cert.accountType }}</p>
                    </div>
                    <div class="text-right flex items-center gap-4">
                      <span class="text-xs text-gray-500">{{ cert.accountNumber }}</span>
                      <button
                        class="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                        (click)="deleteCert(cert.id, $event)"
                        title="Eliminar certificado"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto text-gray-300 mb-3">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <p class="text-gray-400 font-semibold">No hay certificados creados</p>
                <a routerLink="/certificado" class="text-sm text-[#D5150D] font-semibold hover:underline mt-2 inline-block">
                  Crear nuevo certificado
                </a>
              </div>
            }
          }

          <!-- EDIT FORM -->
          @if (editingCert()) {
            <div class="border-t-2 border-[#D5150D] pt-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="font-[Oxanium] text-xl font-bold">
                  Editando: {{ editingCert()!.personName }}
                </h2>
                <button class="text-sm text-gray-500 hover:text-gray-700 cursor-pointer" (click)="cancelEdit()">
                  Cancelar
                </button>
              </div>

              <!-- Person Info -->
              <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#D5150D] pb-2 mb-4">
                Datos del Titular
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre completo</label>
                  <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.personName" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Numero de cedula (CC)</label>
                  <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.documentNumber" />
                </div>
              </div>

              <!-- Account Info -->
              <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#D5150D] pb-2 mb-4">
                Datos de la Cuenta
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Banco / Entidad</label>
                  <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.accountBank" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Tipo de cuenta</label>
                  <select class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.accountType">
                    <option value="AHORROS">Ahorros</option>
                    <option value="CORRIENTE">Corriente</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Numero de cuenta</label>
                  <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.accountNumber" />
                </div>
              </div>

              <!-- Signer -->
              <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#D5150D] pb-2 mb-4">
                Firma Autorizada
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre de quien firma</label>
                  <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.signerName" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Cargo</label>
                  <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.signerRole" />
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-between items-center pt-4 border-t">
                <button
                  class="px-4 py-2 text-red-500 border border-red-300 rounded-lg hover:bg-red-50 text-sm font-semibold cursor-pointer"
                  (click)="deleteAndClose()"
                >
                  Eliminar Certificado
                </button>
                <div class="flex gap-3">
                  <button class="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-semibold cursor-pointer"
                    (click)="cancelEdit()">
                    Cancelar
                  </button>
                  <a [routerLink]="['/certificado', editingCert()!.id]"
                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold">
                    Ver Certificado
                  </a>
                  <button
                    class="px-8 py-2 bg-[#D5150D] text-white font-[Oxanium] font-bold rounded-lg uppercase tracking-wide hover:bg-red-700 transition-colors cursor-pointer"
                    (click)="saveCert()"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>

            @if (showSaved()) {
              <div class="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm font-semibold text-center">
                Certificado guardado correctamente
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class CertificateEdit {
  private readonly router = inject(Router);
  private readonly certService = inject(CertificateService);

  readonly allCerts = this.certService.certificates;

  searchQuery = '';
  readonly searchResults = signal<Certificate[]>([]);
  readonly editingCert = signal<Certificate | null>(null);
  readonly showSaved = signal(false);

  editForm = {
    personName: '',
    documentNumber: '',
    accountBank: '',
    accountType: 'AHORROS',
    accountNumber: '',
    signerName: '',
    signerRole: '',
  };

  onSearch(query: string) {
    if (!query.trim()) {
      this.searchResults.set([]);
      return;
    }
    const q = query.trim().toUpperCase();
    const results = this.allCerts().filter((c) =>
      c.personName.toUpperCase().includes(q) ||
      c.documentNumber.includes(q)
    );
    this.searchResults.set(results);
  }

  loadCert(cert: Certificate) {
    this.editingCert.set(cert);
    this.editForm = {
      personName: cert.personName,
      documentNumber: cert.documentNumber,
      accountBank: cert.accountBank,
      accountType: cert.accountType,
      accountNumber: cert.accountNumber,
      signerName: cert.signerName,
      signerRole: cert.signerRole,
    };
    this.showSaved.set(false);
  }

  cancelEdit() {
    this.editingCert.set(null);
    this.showSaved.set(false);
  }

  saveCert() {
    const original = this.editingCert();
    if (!original) return;

    const updated: Certificate = {
      ...original,
      personName: this.editForm.personName,
      documentNumber: this.editForm.documentNumber,
      accountBank: this.editForm.accountBank,
      accountType: this.editForm.accountType,
      accountNumber: this.editForm.accountNumber,
      signerName: this.editForm.signerName,
      signerRole: this.editForm.signerRole,
    };

    this.certService.save(updated);
    this.editingCert.set(updated);
    this.showSaved.set(true);
    setTimeout(() => this.showSaved.set(false), 3000);

    if (this.searchQuery) {
      this.onSearch(this.searchQuery);
    }
  }

  deleteCert(id: string, event: Event) {
    event.stopPropagation();
    this.certService.delete(id);
    if (this.searchQuery) {
      this.onSearch(this.searchQuery);
    }
  }

  deleteAndClose() {
    const cert = this.editingCert();
    if (!cert) return;
    this.certService.delete(cert.id);
    this.cancelEdit();
  }
}
