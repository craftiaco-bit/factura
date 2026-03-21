import { Component, inject, computed, PLATFORM_ID, ElementRef, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { InvoiceService } from '../../core/services/invoice.service';
import { InvoiceTemplate } from './invoice-template';

@Component({
  selector: 'app-invoice-view',
  imports: [InvoiceTemplate, RouterLink],
  template: `
    @if (invoice()) {
      <!-- Action Bar -->
      <div class="bg-white border-b shadow-sm sticky top-0 z-50 print:hidden">
        <div class="max-w-[850px] mx-auto flex items-center justify-between px-4 py-3">
          <a routerLink="/factura" class="text-sm text-gray-600 hover:text-[#D5150D] flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Nueva factura
          </a>
          <div class="flex gap-2">
            <button
              class="px-4 py-2 bg-[#D5150D] text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              (click)="exportPDF()"
            >
              Descargar PDF
            </button>
            <button
              class="px-4 py-2 bg-gray-700 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              (click)="exportJPG()"
            >
              Descargar JPG
            </button>
            <button
              class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              (click)="copyLink()"
            >
              {{ linkCopied ? 'Copiado!' : 'Copiar link' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Template -->
      <div class="bg-gray-100 py-8 print:bg-white print:py-0">
        <div #templateContainer>
          <app-invoice-template [data]="invoice()!" />
        </div>
      </div>
    } @else {
      <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="text-center">
          <h2 class="font-[Oxanium] text-2xl font-bold text-gray-400 mb-4">
            Factura no encontrada
          </h2>
          <a routerLink="/factura" class="text-[#D5150D] font-semibold hover:underline">
            Crear nueva factura
          </a>
        </div>
      </div>
    }
  `,
})
export class InvoiceView {
  private readonly route = inject(ActivatedRoute);
  private readonly invoiceService = inject(InvoiceService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly templateContainer = viewChild<ElementRef>('templateContainer');

  private readonly routeId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? ''))
  );

  readonly invoice = computed(() => {
    const id = this.routeId();
    if (!id) return null;
    return this.invoiceService.getById(id)();
  });

  linkCopied = false;

  private getInvoiceElement(): HTMLElement | null {
    const container = this.templateContainer()?.nativeElement as HTMLElement;
    if (!container) return null;
    return container.querySelector('.invoice-page') ?? container;
  }

  async exportPDF() {
    if (!isPlatformBrowser(this.platformId)) return;

    const element = this.getInvoiceElement();
    if (!element) return;

    const original = element.style.minHeight;
    element.style.minHeight = 'unset';

    const html2canvas = (await import('html2canvas-pro')).default;
    const { jsPDF } = await import('jspdf');

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    element.style.minHeight = original;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm', [imgWidth, imgHeight]);
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    pdf.save(`factura-${this.invoice()?.number ?? 'honda'}.pdf`);
  }

  async exportJPG() {
    if (!isPlatformBrowser(this.platformId)) return;

    const element = this.getInvoiceElement();
    if (!element) return;

    const original = element.style.minHeight;
    element.style.minHeight = 'unset';

    const html2canvas = (await import('html2canvas-pro')).default;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    element.style.minHeight = original;

    const link = document.createElement('a');
    link.download = `factura-${this.invoice()?.number ?? 'honda'}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  }

  copyLink() {
    if (!isPlatformBrowser(this.platformId)) return;
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    this.linkCopied = true;
    setTimeout(() => (this.linkCopied = false), 2000);
  }
}
