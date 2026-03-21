import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CertificateService } from '../../core/services/certificate.service';
import { Certificate } from '../../core/models/certificate.model';

@Component({
  selector: 'app-certificate-form',
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 py-8 px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="bg-[#D5150D] text-white p-6 rounded-t-lg">
          <div class="flex items-center justify-between">
            <h1 class="font-[Oxanium] text-2xl font-bold uppercase tracking-wide">
              Certificado de Cuenta
            </h1>
            <img src="/Honda_Logo.svg.png" alt="Honda" class="h-10 invert" />
          </div>
        </div>

        <div class="bg-white rounded-b-lg shadow-lg p-6 space-y-5">
          <!-- Person Info -->
          <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#D5150D] pb-2">
            Datos del Titular
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre completo</label>
              <input
                type="text"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                placeholder="Ej: Antonio Salamanca"
                [(ngModel)]="form.personName"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Número de cédula (CC)</label>
              <input
                type="text"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                placeholder="Ej: 88160418"
                [(ngModel)]="form.documentNumber"
              />
            </div>
          </div>

          <!-- Account Info -->
          <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#D5150D] pb-2">
            Datos de la Cuenta
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Banco / Entidad</label>
              <input
                type="text"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                placeholder="Ej: Nequi, Bancolombia..."
                [(ngModel)]="form.accountBank"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Tipo de cuenta</label>
              <select
                class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                [(ngModel)]="form.accountType"
              >
                <option value="AHORROS">Ahorros</option>
                <option value="CORRIENTE">Corriente</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Número de cuenta</label>
              <input
                type="text"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                placeholder="Ej: 3232110435"
                [(ngModel)]="form.accountNumber"
              />
            </div>
          </div>

          <!-- Signer -->
          <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#D5150D] pb-2">
            Firma Autorizada
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre de quien firma</label>
              <input
                type="text"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                placeholder="Ej: Julian Alonzo"
                [(ngModel)]="form.signerName"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Cargo</label>
              <input
                type="text"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                placeholder="Ej: Gerente crédito y cobranzas"
                [(ngModel)]="form.signerRole"
              />
            </div>
          </div>

          <!-- SUBMIT -->
          <div class="flex justify-end pt-4">
            <button
              class="px-8 py-3 bg-[#D5150D] text-white font-[Oxanium] font-bold text-lg rounded-lg uppercase tracking-wide hover:bg-red-700 transition-colors cursor-pointer"
              (click)="createCertificate()"
            >
              Generar Certificado
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CertificateForm {
  private readonly router = inject(Router);
  private readonly certificateService = inject(CertificateService);

  form = {
    personName: '',
    documentNumber: '',
    accountBank: '',
    accountType: 'AHORROS',
    accountNumber: '',
    signerName: '',
    signerRole: 'Gerente crédito y cobranzas',
  };

  createCertificate() {
    const certificate: Certificate = {
      id: this.certificateService.generateId(),
      personName: this.form.personName,
      documentNumber: this.form.documentNumber,
      accountBank: this.form.accountBank,
      accountType: this.form.accountType,
      accountNumber: this.form.accountNumber,
      signerName: this.form.signerName,
      signerRole: this.form.signerRole,
      createdAt: new Date().toISOString(),
    };

    this.certificateService.save(certificate);
    this.router.navigate(['/certificado', certificate.id]);
  }
}
