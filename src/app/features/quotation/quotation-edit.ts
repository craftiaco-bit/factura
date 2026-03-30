import { Component, inject, signal, computed, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
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
  clientDocument: string;
  clientEmail: string;
  clientAddress: string;
  date: string;
  validUntil: string;
  priceWithTax: number;
  soatValue: number;
  helmetIncluded: boolean;
  accessoriesIncluded: boolean;
  registrationValue: number;
  insuranceValue: number;
  quantity: number;
  total: number;
  initialPayment: number;
  advisorName: string;
  advisorDocument: string;
  advisorPhone: string;
  advisorEmail: string;
  advisorAddress: string;
}

@Component({
  selector: 'app-quotation-edit',
  imports: [FormsModule, CurrencyCopPipe],
  template: `
    @if (notFound()) {
      <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="text-center">
          <h2 class="font-[Oxanium] text-2xl font-bold text-gray-400 mb-4">
            Cotización no encontrada
          </h2>
          <a
            routerLink="/cotizaciones"
            class="text-[#D5150D] font-semibold hover:underline"
          >
            Volver a cotizaciones
          </a>
        </div>
      </div>
    } @else if (loaded()) {
      <div class="min-h-screen bg-gray-100 py-8 px-4">
        <div class="max-w-3xl mx-auto">
          <!-- Header -->
          <div class="bg-[#D5150D] text-white p-6 rounded-t-lg">
            <div class="flex items-center justify-between">
              <h1 class="font-[Oxanium] text-2xl font-bold uppercase tracking-wide">
                Editar Cotización
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
                  [style.background]="paymentType() === 'credito' ? '#D5150D' : '#fff'"
                  [style.color]="paymentType() === 'credito' ? '#fff' : '#555'"
                  [style.border-color]="paymentType() === 'credito' ? '#D5150D' : '#d1d5db'"
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
                  [src]="selectedVariantImage() || selectedProduct()!.images[0]"
                  [alt]="selectedProduct()!.name"
                  class="w-32 h-24 object-contain"
                />
                <div>
                  <h3 class="font-[Oxanium] font-bold text-lg">{{ selectedProduct()!.name }}</h3>
                  <p class="text-sm text-gray-500">{{ specCount() }} especificaciones</p>
                  @if (form.productColor) {
                    <p class="text-sm text-[#D5150D] font-semibold">{{ form.productColor }}</p>
                  }
                </div>
              </div>

              <!-- Color Variant Picker -->
              @if (colorVariants().length > 0) {
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Color / Variante</label>
                  <div class="flex gap-3 overflow-x-auto pb-2">
                    @for (variant of colorVariants(); track variant.color) {
                      <button
                        type="button"
                        class="flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md"
                        [class.border-[#D5150D]]="form.productColor === variant.color"
                        [class.border-gray-200]="form.productColor !== variant.color"
                        [class.ring-2]="form.productColor === variant.color"
                        [class.ring-[#D5150D]/30]="form.productColor === variant.color"
                        [class.bg-white]="form.productColor !== variant.color"
                        [class.bg-red-50]="form.productColor === variant.color"
                        (click)="selectVariant(variant)"
                      >
                        <img
                          [src]="variant.image"
                          [alt]="variant.color"
                          class="w-20 h-16 object-contain"
                        />
                        <span
                          class="text-xs font-medium text-center max-w-[5rem] leading-tight"
                          [class.text-[#D5150D]]="form.productColor === variant.color"
                          [class.text-gray-600]="form.productColor !== variant.color"
                        >
                          {{ variant.color }}
                        </span>
                      </button>
                    }
                  </div>
                </div>
              }

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#D5150D] pb-2">
                Datos del Cliente
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Cédula</label>
                  <input
                    type="text"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    placeholder="Número de cédula"
                    [ngModel]="form.clientDocument"
                    (ngModelChange)="form.clientDocument = $event"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Correo</label>
                  <input
                    type="email"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    placeholder="correo@ejemplo.com"
                    [ngModel]="form.clientEmail"
                    (ngModelChange)="form.clientEmail = $event"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    placeholder="Dirección del cliente"
                    [ngModel]="form.clientAddress"
                    (ngModelChange)="form.clientAddress = $event"
                  />
                </div>
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
                <div class="flex items-center gap-3 py-2">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      class="sr-only peer"
                      [ngModel]="form.helmetIncluded"
                      (ngModelChange)="form.helmetIncluded = $event"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#D5150D]/30 rounded-full peer peer-checked:bg-[#D5150D] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                  <span class="text-sm font-semibold text-gray-700">Casco incluido</span>
                </div>
                <div class="flex items-center gap-3 py-2">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      class="sr-only peer"
                      [ngModel]="form.accessoriesIncluded"
                      (ngModelChange)="form.accessoriesIncluded = $event"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#D5150D]/30 rounded-full peer peer-checked:bg-[#D5150D] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                  <span class="text-sm font-semibold text-gray-700">Accesorios incluidos</span>
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
                @if (paymentType() === 'credito') {
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Cuota Inicial</label>
                    <input
                      type="number"
                      class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                      [ngModel]="form.initialPayment"
                      (ngModelChange)="form.initialPayment = $event; recalculate()"
                    />
                  </div>
                }
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
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Cédula del Asesor</label>
                  <input
                    type="text"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    placeholder="Número de cédula"
                    [ngModel]="form.advisorDocument"
                    (ngModelChange)="form.advisorDocument = $event"
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
                <a
                  routerLink="/cotizaciones"
                  class="px-8 py-3 border border-gray-300 text-gray-700 font-[Oxanium] font-bold text-lg rounded-lg uppercase tracking-wide hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </a>
                <button
                  class="px-8 py-3 bg-[#D5150D] text-white font-[Oxanium] font-bold text-lg rounded-lg uppercase tracking-wide hover:bg-red-700 transition-colors cursor-pointer"
                  (click)="saveQuotation()"
                >
                  Guardar Cambios
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class QuotationEdit implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly siteConfig = inject(SiteConfigService);
  private readonly quotationService = inject(QuotationService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly products = this.productService.products;
  readonly paymentType = signal<QuotationPaymentType>('contado');
  readonly selectedSlug = signal('');
  readonly loaded = signal(false);
  readonly notFound = signal(false);

  private originalQuotation: Quotation | null = null;

  private readonly routeId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? ''))
  );

  readonly selectedProduct = computed(() => {
    const slug = this.selectedSlug();
    if (!slug) return null;
    return this.products().find((p) => p.slug === slug) ?? null;
  });

  readonly specCount = computed(() => {
    const p = this.selectedProduct();
    return p?.specifications ? Object.keys(p.specifications).length : 0;
  });

  readonly selectedProfile = computed(() => {
    const slug = this.selectedSlug();
    if (!slug) return null;
    return getProductQuotationProfile(slug);
  });

  readonly colorVariants = computed(() => {
    return this.selectedProfile()?.colorVariants ?? [];
  });

  readonly selectedVariantImage = signal('');

  form: QuotationFormData = {
    productColor: '',
    productYear: new Date().getFullYear(),
    clientName: '',
    clientDocument: '',
    clientEmail: '',
    clientAddress: '',
    date: '',
    validUntil: '',
    priceWithTax: 0,
    soatValue: 0,
    helmetIncluded: false,
    accessoriesIncluded: false,
    registrationValue: 0,
    insuranceValue: 0,
    quantity: 1,
    total: 0,
    initialPayment: 0,
    advisorName: '',
    advisorDocument: '',
    advisorPhone: '',
    advisorEmail: '',
    advisorAddress: '',
  };

  ngOnInit(): void {
    // Wait a tick for the quotations signal to be populated
    setTimeout(() => this.loadQuotation(), 0);
  }

  private loadQuotation(): void {
    const id = this.routeId();
    if (!id) {
      this.notFound.set(true);
      return;
    }

    const quotation = this.quotationService.getById(id)();
    if (!quotation) {
      this.notFound.set(true);
      return;
    }

    this.originalQuotation = quotation;

    // Pre-fill form
    this.paymentType.set(quotation.paymentType || 'contado');
    this.selectedSlug.set(quotation.productSlug);

    // Set variant image
    this.selectedVariantImage.set(quotation.productImage || '');

    this.form = {
      productColor: quotation.productColor,
      productYear: quotation.productYear,
      clientName: quotation.clientName,
      clientDocument: quotation.clientDocument,
      clientEmail: quotation.clientEmail,
      clientAddress: quotation.clientAddress,
      date: quotation.date,
      validUntil: quotation.validUntil,
      priceWithTax: quotation.priceWithTax,
      soatValue: quotation.soatValue,
      helmetIncluded: quotation.helmetIncluded,
      accessoriesIncluded: quotation.accessoriesIncluded,
      registrationValue: quotation.registrationValue,
      insuranceValue: quotation.insuranceValue,
      quantity: quotation.quantity,
      total: quotation.total,
      initialPayment: quotation.initialPayment,
      advisorName: quotation.advisorName,
      advisorDocument: quotation.advisorDocument,
      advisorPhone: quotation.advisorPhone,
      advisorEmail: quotation.advisorEmail,
      advisorAddress: quotation.advisorAddress,
    };

    this.loaded.set(true);
  }

  onProductChange(slug: string) {
    this.selectedSlug.set(slug);
    if (slug) {
      const profile = getProductQuotationProfile(slug);
      if (profile.colorVariants.length > 0) {
        this.selectVariant(profile.colorVariants[0]);
      }
    } else {
      this.form.productColor = '';
      this.selectedVariantImage.set('');
    }
  }

  selectVariant(variant: { color: string; image: string }) {
    this.form.productColor = variant.color;
    this.selectedVariantImage.set(variant.image);
  }

  recalculate() {
    this.form.total = this.quotationService.calculateTotal(this.form);
  }

  saveQuotation() {
    const product = this.selectedProduct();
    if (!product || !this.originalQuotation) return;

    const profile = getProductQuotationProfile(product.slug);

    const updated: Quotation = {
      ...this.originalQuotation,
      paymentType: this.paymentType(),
      date: this.form.date,
      validUntil: this.form.validUntil,
      clientName: this.form.clientName,
      clientDocument: this.form.clientDocument,
      clientEmail: this.form.clientEmail,
      clientAddress: this.form.clientAddress,
      productSlug: product.slug,
      productName: product.name,
      productImage: this.selectedVariantImage() || product.images[0] || '',
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
      helmetIncluded: this.form.helmetIncluded,
      accessoriesIncluded: this.form.accessoriesIncluded,
      registrationValue: Number(this.form.registrationValue),
      insuranceValue: Number(this.form.insuranceValue),
      quantity: Number(this.form.quantity),
      total: Number(this.form.total),
      initialPayment: Number(this.form.initialPayment),
      advisorName: this.form.advisorName,
      advisorDocument: this.form.advisorDocument,
      advisorPhone: this.form.advisorPhone,
      advisorEmail: this.form.advisorEmail,
      advisorAddress: this.form.advisorAddress,
    };

    this.quotationService.save(updated);
    this.router.navigate(['/cotizacion', updated.id]);
  }
}
