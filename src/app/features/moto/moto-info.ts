import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { SiteConfigService } from '../../core/services/site-config.service';
import {
  getProductQuotationProfile,
  ProductQuotationProfile,
} from '../../core/data/product-quotation-data';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-moto-info',
  standalone: true,
  template: `
    @if (notFound()) {
      <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div class="text-center">
          <img src="/Honda_Logo.svg.png" alt="Honda" class="h-12 mx-auto mb-6" />
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Moto no encontrada</h1>
          <p class="text-gray-500">El modelo que buscas no está disponible.</p>
        </div>
      </div>
    } @else if (product()) {
      <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-[#222222] text-white">
          <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img src="/Honda_Logo.svg.png" alt="Honda" class="h-8 invert" />
              <span class="font-[Oxanium] font-bold text-lg tracking-tight uppercase">Honda</span>
            </div>
            <a
              [href]="siteConfig.whatsappUrl()"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </header>

        <!-- Hero: Main Image -->
        <section class="bg-white">
          <div class="max-w-5xl mx-auto px-4 py-8 md:py-12">
            <div class="text-center mb-6">
              <span class="inline-block bg-[#D5150D] text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full mb-3">
                {{ profile()?.category }}
              </span>
              <h1 class="text-3xl md:text-4xl font-[Oxanium] font-extrabold text-[#222] uppercase tracking-tight">
                {{ product()!.name }}
              </h1>
            </div>
            <div class="flex justify-center">
              <img
                [src]="selectedImage()"
                [alt]="product()!.name"
                class="max-w-full max-h-[400px] object-contain"
              />
            </div>
          </div>
        </section>

        <!-- Color Variants -->
        @if (profile()?.colorVariants?.length) {
          <section class="bg-gray-100">
            <div class="max-w-5xl mx-auto px-4 py-6">
              <h2 class="text-center text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Colores disponibles</h2>
              <div class="flex flex-wrap justify-center gap-3">
                @for (variant of profile()!.colorVariants; track variant.color) {
                  <button
                    (click)="selectVariant(variant)"
                    class="group flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all"
                    [class.border-[#D5150D]]="selectedColor() === variant.color"
                    [class.border-transparent]="selectedColor() !== variant.color"
                    [class.bg-white]="selectedColor() === variant.color"
                    [class.shadow-md]="selectedColor() === variant.color"
                  >
                    <img
                      [src]="variant.image"
                      [alt]="variant.color"
                      class="w-20 h-14 md:w-28 md:h-20 object-contain"
                    />
                    <span class="text-xs font-semibold text-gray-600 group-hover:text-[#D5150D] transition-colors">
                      {{ variant.color }}
                    </span>
                  </button>
                }
              </div>
            </div>
          </section>
        }

        <!-- Specifications -->
        @if (specEntries().length) {
          <section class="bg-white">
            <div class="max-w-5xl mx-auto px-4 py-8 md:py-12">
              <h2 class="text-center text-2xl font-[Oxanium] font-extrabold text-[#222] uppercase mb-8">
                Especificaciones Técnicas
              </h2>
              <div class="max-w-2xl mx-auto">
                <div class="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
                  @for (entry of specEntries(); track entry[0]) {
                    <div class="flex">
                      <div class="w-2/5 bg-gray-50 px-4 py-3 font-bold text-sm text-[#D5150D]">
                        {{ entry[0] }}
                      </div>
                      <div class="w-3/5 px-4 py-3 text-sm text-gray-700">
                        {{ entry[1] }}
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </section>
        }

        <!-- Benefits -->
        @if (profile()?.benefits?.length) {
          <section class="bg-gray-100">
            <div class="max-w-5xl mx-auto px-4 py-8 md:py-12">
              <h2 class="text-center text-2xl font-[Oxanium] font-extrabold text-[#222] uppercase mb-8">
                Beneficios
              </h2>
              <div class="max-w-2xl mx-auto grid gap-4">
                @for (benefit of profile()!.benefits; track $index) {
                  <div class="flex items-start gap-3 bg-white rounded-xl px-5 py-4 shadow-sm">
                    <div class="flex-shrink-0 w-6 h-6 bg-[#D5150D] rounded-full flex items-center justify-center mt-0.5">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <p class="text-sm text-gray-700 leading-relaxed">{{ benefit }}</p>
                  </div>
                }
              </div>
            </div>
          </section>
        }

        <!-- Features -->
        @if (profile()?.features?.length) {
          <section class="bg-white">
            <div class="max-w-5xl mx-auto px-4 py-8 md:py-12">
              <h2 class="text-center text-2xl font-[Oxanium] font-extrabold text-[#222] uppercase mb-8">
                Características Destacadas
              </h2>
              <div class="flex flex-wrap justify-center gap-6 md:gap-10">
                @for (feat of profile()!.features; track $index) {
                  <div class="flex flex-col items-center gap-3 w-28">
                    <div
                      class="w-16 h-16 border-2 border-[#D5150D] rounded-full flex items-center justify-center text-[#D5150D]"
                      [innerHTML]="featureSvg(feat.icon)"
                    ></div>
                    <span
                      class="text-xs font-bold text-center uppercase text-gray-600 leading-tight"
                      [innerHTML]="feat.label.replace('\\n', '<br/>')"
                    ></span>
                  </div>
                }
              </div>
            </div>
          </section>
        }

        <!-- Contact CTA -->
        <section class="bg-[#222222] text-white">
          <div class="max-w-5xl mx-auto px-4 py-10 md:py-14 text-center">
            <h2 class="text-2xl md:text-3xl font-[Oxanium] font-extrabold uppercase mb-3">
              Contáctanos
            </h2>
            <p class="text-gray-300 mb-6 max-w-md mx-auto">
              ¿Interesado en esta moto? Escríbenos por WhatsApp y un asesor te atenderá de inmediato.
            </p>
            <a
              [href]="whatsappProductUrl()"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe57] text-white text-lg font-bold px-8 py-4 rounded-full transition-colors shadow-lg"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Escribir por WhatsApp
            </a>
            <div class="mt-6 text-sm text-gray-400 space-y-1">
              <p>{{ siteConfig.config().address }}</p>
              <p>Tel: {{ siteConfig.config().phone }}</p>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="bg-[#D5150D] text-white">
          <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <img src="/Honda_Logo.svg.png" alt="Honda" class="h-6 invert" />
            <p class="text-xs opacity-80">The Power of Dreams</p>
          </div>
        </footer>
      </div>
    }
  `,
})
export class MotoInfo implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly siteConfig = inject(SiteConfigService);

  readonly slug = signal<string>('');
  readonly notFound = signal(false);

  readonly product = computed(() => {
    const s = this.slug();
    if (!s) return null;
    return this.productService.getBySlug(s)();
  });

  readonly profile = computed<ProductQuotationProfile | null>(() => {
    const s = this.slug();
    if (!s) return null;
    return getProductQuotationProfile(s);
  });

  readonly selectedColor = signal<string>('');
  readonly selectedImage = computed(() => {
    const p = this.product();
    const prof = this.profile();
    const color = this.selectedColor();

    if (prof && color) {
      const variant = prof.colorVariants.find((v) => v.color === color);
      if (variant?.image) return variant.image;
    }

    return p?.images?.[0] ?? '';
  });

  readonly specEntries = computed(() => {
    const prof = this.profile();
    if (!prof) return [];
    return Object.entries(prof.specifications);
  });

  readonly whatsappProductUrl = computed(() => {
    const p = this.product();
    const cfg = this.siteConfig.config();
    const msg = p
      ? `Hola, estoy interesado en la ${p.name}. ¿Me pueden dar más información?`
      : cfg.whatsappMessage;
    return `https://api.whatsapp.com/send?phone=${cfg.whatsapp}&text=${encodeURIComponent(msg)}`;
  });

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.slug.set(slug);

    const p = this.product();
    if (!p) {
      this.notFound.set(true);
    } else {
      const prof = this.profile();
      if (prof?.colorVariants?.length) {
        this.selectedColor.set(prof.colorVariants[0].color);
      }
    }
  }

  selectVariant(variant: { color: string; image: string }) {
    this.selectedColor.set(variant.color);
  }

  featureSvg(iconPath: string): SafeHtml {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32">${iconPath}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
