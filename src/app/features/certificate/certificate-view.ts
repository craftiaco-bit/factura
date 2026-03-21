import { Component, inject, computed, PLATFORM_ID, ElementRef, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CertificateService } from '../../core/services/certificate.service';
import { CertificateTemplate } from './certificate-template';

@Component({
  selector: 'app-certificate-view',
  imports: [CertificateTemplate, RouterLink],
  template: `
    @if (certificate()) {
      <!-- Action Bar -->
      <div class="bg-white border-b shadow-sm sticky top-0 z-50 print:hidden">
        <div class="max-w-[850px] mx-auto flex items-center justify-between px-4 py-3">
          <a routerLink="/certificado" class="text-sm text-gray-600 hover:text-[#D5150D] flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Nuevo certificado
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
      <div class="bg-gray-100 py-8 print:bg-white print:py-0 overflow-x-auto">
        <div #templateContainer class="mx-auto w-fit">
          <app-certificate-template [data]="certificate()!" />
        </div>
      </div>
    } @else {
      <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="text-center">
          <h2 class="font-[Oxanium] text-2xl font-bold text-gray-400 mb-4">
            Certificado no encontrado
          </h2>
          <a routerLink="/certificado" class="text-[#D5150D] font-semibold hover:underline">
            Crear nuevo certificado
          </a>
        </div>
      </div>
    }
  `,
})
export class CertificateView {
  private readonly route = inject(ActivatedRoute);
  private readonly certificateService = inject(CertificateService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly templateContainer = viewChild<ElementRef>('templateContainer');

  private readonly routeId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? ''))
  );

  readonly certificate = computed(() => {
    const id = this.routeId();
    if (!id) return null;
    return this.certificateService.getById(id)();
  });

  linkCopied = false;

  private getElement(): HTMLElement | null {
    const container = this.templateContainer()?.nativeElement as HTMLElement;
    if (!container) return null;
    return container.querySelector('.cert-page') ?? container;
  }

  /** Convert ALL images to inline data URLs so html2canvas can render them reliably */
  private async inlineAllImages(container: HTMLElement): Promise<Array<{ img: HTMLImageElement; originalSrc: string; originalFilter?: string }>> {
    const allImages = Array.from(container.querySelectorAll('img'));
    const restored: Array<{ img: HTMLImageElement; originalSrc: string; originalFilter?: string }> = [];

    for (const imgEl of allImages) {
      const originalSrc = imgEl.src;
      const cssFilter = getComputedStyle(imgEl).filter;
      const hasFilter = cssFilter && cssFilter !== 'none';

      if (originalSrc.startsWith('data:')) {
        try {
          const pngDataUrl = await this.drawImgElToDataUrl(imgEl, hasFilter ? cssFilter : undefined);
          if (hasFilter) imgEl.style.filter = 'none';
          imgEl.src = pngDataUrl;
          restored.push({ img: imgEl, originalSrc, originalFilter: hasFilter ? cssFilter : undefined });
        } catch { /* keep original */ }
      } else {
        try {
          const dataUrl = await this.fetchAsDataUrl(originalSrc);
          if (hasFilter) {
            const pngDataUrl = await this.drawDataUrlWithFilter(dataUrl, imgEl, cssFilter);
            imgEl.style.filter = 'none';
            imgEl.src = pngDataUrl;
          } else {
            imgEl.src = dataUrl;
          }
          restored.push({ img: imgEl, originalSrc, originalFilter: hasFilter ? cssFilter : undefined });
        } catch {
          try {
            const pngDataUrl = await this.drawImgElToDataUrl(imgEl, hasFilter ? cssFilter : undefined);
            if (hasFilter) imgEl.style.filter = 'none';
            imgEl.src = pngDataUrl;
            restored.push({ img: imgEl, originalSrc, originalFilter: hasFilter ? cssFilter : undefined });
          } catch { /* keep original */ }
        }
      }
    }

    return restored;
  }

  /** Fetch an image URL as a data URL via fetch+blob */
  private async fetchAsDataUrl(url: string): Promise<string> {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /** Draw an already-loaded <img> element onto a canvas, optionally applying a CSS filter */
  private drawImgElToDataUrl(imgEl: HTMLImageElement, filter?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const w = (imgEl.naturalWidth || imgEl.clientWidth || 260) * 2;
      const h = (imgEl.naturalHeight || imgEl.clientHeight || 80) * 2;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('no context');
      if (filter) ctx.filter = filter;

      if (imgEl.complete && imgEl.naturalWidth > 0) {
        ctx.drawImage(imgEl, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      } else {
        const tmp = new Image();
        tmp.onload = () => {
          canvas.width = (tmp.naturalWidth || w);
          canvas.height = (tmp.naturalHeight || h);
          if (filter) ctx.filter = filter;
          ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        };
        tmp.onerror = reject;
        tmp.src = imgEl.src;
      }
    });
  }

  /** Load a data URL into a canvas with a CSS filter applied */
  private drawDataUrlWithFilter(dataUrl: string, refEl: HTMLImageElement, filter: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const tmp = new Image();
      tmp.onload = () => {
        const w = (tmp.naturalWidth || refEl.clientWidth || 260) * 2;
        const h = (tmp.naturalHeight || refEl.clientHeight || 80) * 2;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('no context');
        ctx.filter = filter;
        ctx.drawImage(tmp, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      };
      tmp.onerror = reject;
      tmp.src = dataUrl;
    });
  }

  async exportPDF() {
    if (!isPlatformBrowser(this.platformId)) return;
    const element = this.getElement();
    if (!element) return;

    const original = element.style.minHeight;
    element.style.minHeight = 'unset';

    // Rasterize SVG signatures before capture
    const restored = await this.inlineAllImages(element);

    const html2canvas = (await import('html2canvas-pro')).default;
    const { jsPDF } = await import('jspdf');

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#f5f3f0',
    });

    // Restore original SVG sources
    for (const r of restored) { r.img.src = r.originalSrc; if (r.originalFilter) r.img.style.filter = ''; }
    element.style.minHeight = original;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    // Letter landscape: 279.4 × 215.9 mm
    const imgWidth = 279.4;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('l', 'mm', 'letter');
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    pdf.save(`certificado-cuenta-${this.certificate()?.personName?.replace(/\s+/g, '-') ?? 'honda'}.pdf`);
  }

  async exportJPG() {
    if (!isPlatformBrowser(this.platformId)) return;
    const element = this.getElement();
    if (!element) return;

    const original = element.style.minHeight;
    element.style.minHeight = 'unset';

    // Rasterize SVG signatures before capture
    const restored = await this.inlineAllImages(element);

    const html2canvas = (await import('html2canvas-pro')).default;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#f5f3f0',
    });

    // Restore original SVG sources
    for (const r of restored) { r.img.src = r.originalSrc; if (r.originalFilter) r.img.style.filter = ''; }
    element.style.minHeight = original;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `certificado-cuenta-${this.certificate()?.personName?.replace(/\s+/g, '-') ?? 'honda'}.jpg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.95);
  }

  copyLink() {
    if (!isPlatformBrowser(this.platformId)) return;
    navigator.clipboard.writeText(window.location.href);
    this.linkCopied = true;
    setTimeout(() => (this.linkCopied = false), 2000);
  }
}
