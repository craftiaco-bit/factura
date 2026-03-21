import { Component, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { SiteConfigService } from '../../core/services/site-config.service';
import { QuotationService } from '../../core/services/quotation.service';
import { Quotation, QuotationPaymentType } from '../../core/models';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop.pipe';
import { getProductQuotationProfile } from '../../core/data/product-quotation-data';

interface QuotationFormData {
  productColor: string;
  productYear: number;
  clientName: string;
  date: string;
  validUntil: string;
  priceWithTax: number;
  soatValue: number;
  helmetValue: number;
  accessoriesValue: number;
  registrationValue: number;
  insuranceValue: number;
  quantity: number;
  total: number;
  advisorName: string;
  advisorPhone: string;
  advisorEmail: string;
  advisorAddress: string;
}

@Component({
  selector: 'app-quotation-form',
  imports: [FormsModule, CurrencyCopPipe],
  template: `
    <div class="min-h-screen bg-gray-100 py-8 px-4">
      <div class="max-w-3xl mx-auto">
        <!-- Header -->
        <div class="bg-[#D5150D] text-white p-6 rounded-t-lg">
          <div class="flex items-center justify-between">
            <h1 class="font-[Oxanium] text-2xl font-bold uppercase tracking-wide">
              Nueva Cotización
            </h1>
            <img src="/images/logo-honda-1.webp" alt="Honda" class="h-12" />
          </div>
        </div>

        <div class="bg-white rounded-b-lg shadow-lg p-6 space-y-6">
          <!-- Payment Type -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo de Factura</label>
            <div class="flex gap-4">
              <button
                class="flex-1 py-3 px-4 rounded-lg font-[Oxanium] font-bold text-lg uppercase tracking-wide border-2 transition-all cursor-pointer"
                [style.background]="paymentType() === 'contado' ? '#D5150D' : '#fff'"
                [style.color]="paymentType() === 'contado' ? '#fff' : '#555'"
                [style.border-color]="paymentType() === 'contado' ? '#D5150D' : '#d1d5db'"
                (click)="paymentType.set('contado')"
              >
                Contado
              </button>
              <button
                class="flex-1 py-3 px-4 rounded-lg font-[Oxanium] font-bold text-lg uppercase tracking-wide border-2 transition-all cursor-pointer"
                [style.background]="paymentType() === 'credito' ? '#006D77' : '#fff'"
                [style.color]="paymentType() === 'credito' ? '#fff' : '#555'"
                [style.border-color]="paymentType() === 'credito' ? '#006D77' : '#d1d5db'"
                (click)="paymentType.set('credito')"
              >
                Crédito / Financiación
              </button>
            </div>
          </div>

          <!-- Product Selection -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Seleccionar Moto</label>
            <select
              class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#D5150D] focus:border-transparent"
              [ngModel]="selectedSlug()"
              (ngModelChange)="onProductChange($event)"
            >
              <option value="">-- Selecciona una moto --</option>
              @for (product of products(); track product.slug) {
                <option [value]="product.slug">{{ product.name }}</option>
              }
            </select>
          </div>

          @if (selectedProduct()) {
            <!-- Product Preview -->
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <img
                [src]="selectedProduct()!.images[0]"
                [alt]="selectedProduct()!.name"
                class="w-32 h-24 object-contain"
              />
              <div>
                <h3 class="font-[Oxanium] font-bold text-lg">{{ selectedProduct()!.name }}</h3>
                <p class="text-sm text-gray-500">{{ specCount() }} especificaciones</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Color -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Color / Variante</label>
                <input
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  placeholder="Ej: BLANCO NEGRO ROJO"
                  [ngModel]="form.productColor"
                  (ngModelChange)="form.productColor = $event"
                />
              </div>
              <!-- Year -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Año</label>
                <input
                  type="number"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [ngModel]="form.productYear"
                  (ngModelChange)="form.productYear = $event"
                />
              </div>
            </div>

            <!-- Client -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre del Cliente</label>
              <input
                type="text"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                placeholder="Nombre completo del cliente"
                [ngModel]="form.clientName"
                (ngModelChange)="form.clientName = $event"
              />
            </div>

            <!-- Date / Valid Until -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [ngModel]="form.date"
                  (ngModelChange)="form.date = $event"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Válida hasta</label>
                <input
                  type="date"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [ngModel]="form.validUntil"
                  (ngModelChange)="form.validUntil = $event"
                />
              </div>
            </div>

            <!-- PRICING -->
            <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#D5150D] pb-2">
              Oferta Económica
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Precio con impuesto</label>
                <input
                  type="number"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [ngModel]="form.priceWithTax"
                  (ngModelChange)="form.priceWithTax = $event; recalculate()"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Valor SOAT</label>
                <input
                  type="number"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [ngModel]="form.soatValue"
                  (ngModelChange)="form.soatValue = $event; recalculate()"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Casco</label>
                <input
                  type="number"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [ngModel]="form.helmetValue"
                  (ngModelChange)="form.helmetValue = $event; recalculate()"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Accesorios</label>
                <input
                  type="number"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [ngModel]="form.accessoriesValue"
                  (ngModelChange)="form.accessoriesValue = $event; recalculate()"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Valor Matrícula</label>
                <input
                  type="number"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [ngModel]="form.registrationValue"
                  (ngModelChange)="form.registrationValue = $event; recalculate()"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Seguro todo riesgo</label>
                <input
                  type="number"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [ngModel]="form.insuranceValue"
                  (ngModelChange)="form.insuranceValue = $event; recalculate()"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [ngModel]="form.quantity"
                  (ngModelChange)="form.quantity = $event; recalculate()"
                />
              </div>
              <div class="flex items-end">
                <div class="w-full bg-gray-50 border-2 border-[#D5150D] rounded-lg px-4 py-2">
                  <span class="text-sm text-gray-500">Total a pagar:</span>
                  <span class="block font-[Oxanium] font-bold text-xl text-[#D5150D]">
                    {{ form.total | currencyCop }}
                  </span>
                </div>
              </div>
            </div>

            <!-- ADVISOR -->
            <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#D5150D] pb-2">
              Datos del Asesor
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre del Asesor</label>
                <input
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [ngModel]="form.advisorName"
                  (ngModelChange)="form.advisorName = $event"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [ngModel]="form.advisorPhone"
                  (ngModelChange)="form.advisorPhone = $event"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [ngModel]="form.advisorEmail"
                  (ngModelChange)="form.advisorEmail = $event"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [ngModel]="form.advisorAddress"
                  (ngModelChange)="form.advisorAddress = $event"
                />
              </div>
            </div>

            <!-- SUBMIT -->
            <div class="flex justify-end gap-4 pt-4">
              <button
                class="px-8 py-3 bg-[#D5150D] text-white font-[Oxanium] font-bold text-lg rounded-lg uppercase tracking-wide hover:bg-red-700 transition-colors cursor-pointer"
                (click)="createQuotation()"
              >
                Generar Cotización
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class QuotationForm {
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly siteConfig = inject(SiteConfigService);
  private readonly quotationService = inject(QuotationService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly products = this.productService.products;
  readonly paymentType = signal<QuotationPaymentType>('contado');
  readonly selectedSlug = signal('');

  readonly selectedProduct = computed(() => {
    const slug = this.selectedSlug();
    if (!slug) return null;
    return this.products().find((p) => p.slug === slug) ?? null;
  });

  readonly specCount = computed(() => {
    const p = this.selectedProduct();
    return p?.specifications ? Object.keys(p.specifications).length : 0;
  });

  form: QuotationFormData = this.getDefaultForm();

  private getDefaultForm(): QuotationFormData {
    const today = new Date();
    const validUntil = new Date(today);
    validUntil.setDate(validUntil.getDate() + 15);

    return {
      productColor: '',
      productYear: today.getFullYear(),
      clientName: '',
      date: this.formatDateISO(today),
      validUntil: this.formatDateISO(validUntil),
      priceWithTax: 0,
      soatValue: 343300,
      helmetValue: 0,
      accessoriesValue: 0,
      registrationValue: 440000,
      insuranceValue: 0,
      quantity: 1,
      total: 783300,
      advisorName: '',
      advisorPhone: this.siteConfig.config().phone,
      advisorEmail: '',
      advisorAddress: this.siteConfig.config().address,
    };
  }

  onProductChange(slug: string) {
    this.selectedSlug.set(slug);
  }

  recalculate() {
    this.form.total = this.quotationService.calculateTotal(this.form);
  }

  createQuotation() {
    const product = this.selectedProduct();
    if (!product) return;

    const profile = getProductQuotationProfile(product.slug);

    const quotation: Quotation = {
      id: this.quotationService.generateId(),
      number: this.quotationService.generateNumber(),
      paymentType: this.paymentType(),
      date: this.form.date,
      validUntil: this.form.validUntil,
      clientName: this.form.clientName,
      productSlug: product.slug,
      productName: product.name,
      productImage: product.images[0] ?? '',
      productColor: this.form.productColor,
      productYear: this.form.productYear,
      specifications: profile.specifications,
      benefits: profile.benefits,
      features: profile.features,
      accentColor: profile.accentColor,
      accentDark: profile.accentDark,
      category: profile.category,
      priceWithTax: Number(this.form.priceWithTax),
      soatValue: Number(this.form.soatValue),
      helmetValue: Number(this.form.helmetValue),
      accessoriesValue: Number(this.form.accessoriesValue),
      registrationValue: Number(this.form.registrationValue),
      insuranceValue: Number(this.form.insuranceValue),
      quantity: Number(this.form.quantity),
      total: Number(this.form.total),
      advisorName: this.form.advisorName,
      advisorPhone: this.form.advisorPhone,
      advisorEmail: this.form.advisorEmail,
      advisorAddress: this.form.advisorAddress,
      createdAt: new Date().toISOString(),
    };

    this.quotationService.save(quotation);
    this.router.navigate(['/cotizacion', quotation.id]);
  }

  private formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
