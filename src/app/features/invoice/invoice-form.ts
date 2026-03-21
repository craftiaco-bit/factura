import { Component, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { SiteConfigService } from '../../core/services/site-config.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { Invoice, InvoiceItem, InvoiceType } from '../../core/models/invoice.model';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop.pipe';

@Component({
  selector: 'app-invoice-form',
  imports: [FormsModule, CurrencyCopPipe],
  template: `
    <div class="min-h-screen bg-gray-100 py-8 px-4">
      <div class="max-w-3xl mx-auto">
        <!-- Header -->
        <div class="bg-[#D5150D] text-white p-6 rounded-t-lg">
          <div class="flex items-center justify-between">
            <h1 class="font-[Oxanium] text-2xl font-bold uppercase tracking-wide">
              Nueva Factura
            </h1>
            <img src="/images/logo-honda-1.webp" alt="Honda" class="h-12" />
          </div>
        </div>

        <div class="bg-white rounded-b-lg shadow-lg p-6 space-y-6">

          <!-- Invoice Type -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo de Factura</label>
            <div class="flex gap-4">
              <button
                class="flex-1 py-3 px-4 rounded-lg font-[Oxanium] font-bold text-lg uppercase tracking-wide border-2 transition-all cursor-pointer"
                [style.background]="invoiceType() === 'contado' ? '#D5150D' : '#fff'"
                [style.color]="invoiceType() === 'contado' ? '#fff' : '#555'"
                [style.border-color]="invoiceType() === 'contado' ? '#D5150D' : '#d1d5db'"
                (click)="invoiceType.set('contado')"
              >
                Contado
              </button>
              <button
                class="flex-1 py-3 px-4 rounded-lg font-[Oxanium] font-bold text-lg uppercase tracking-wide border-2 transition-all cursor-pointer"
                [style.background]="invoiceType() === 'credito' ? '#006D77' : '#fff'"
                [style.color]="invoiceType() === 'credito' ? '#fff' : '#555'"
                [style.border-color]="invoiceType() === 'credito' ? '#006D77' : '#d1d5db'"
                (click)="invoiceType.set('credito')"
              >
                Credito
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
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Color / Variante</label>
                <input
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  placeholder="Ej: BLANCO NEGRO ROJO"
                  [(ngModel)]="form.productColor"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Ano</label>
                <input
                  type="number"
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [(ngModel)]="form.productYear"
                />
              </div>
            </div>

            <!-- Client Info -->
            <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#D5150D] pb-2">
              Datos del Cliente
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  placeholder="Nombre del cliente" [(ngModel)]="form.clientName" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Documento (CC/NIT)</label>
                <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  placeholder="Cedula o NIT" [(ngModel)]="form.clientDocument" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Telefono</label>
                <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  placeholder="Telefono de contacto" [(ngModel)]="form.clientPhone" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input type="email" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  placeholder="correo@ejemplo.com" [(ngModel)]="form.clientEmail" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-1">Direccion</label>
                <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  placeholder="Direccion del cliente" [(ngModel)]="form.clientAddress" />
              </div>
            </div>

            <!-- Date -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Fecha de Factura</label>
                <input type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [(ngModel)]="form.date" />
              </div>
            </div>

            <!-- Line Items -->
            <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#D5150D] pb-2">
              Conceptos
            </h3>
            @for (item of items; track $index) {
              <div class="flex gap-3 items-end">
                <div class="flex-1">
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Descripcion</label>
                  <input type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="item.description" (ngModelChange)="recalculate()" />
                </div>
                <div class="w-20">
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Cant.</label>
                  <input type="number" min="1" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="item.quantity" (ngModelChange)="recalculate()" />
                </div>
                <div class="w-40">
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Precio Unit.</label>
                  <input type="number" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="item.unitPrice" (ngModelChange)="recalculate()" />
                </div>
                <div class="w-36 flex items-end gap-1">
                  <div class="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right font-semibold">
                    {{ item.total | currencyCop }}
                  </div>
                  @if (items.length > 1) {
                    <button class="text-red-500 hover:text-red-700 p-2 cursor-pointer" (click)="removeItem($index)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  }
                </div>
              </div>
            }
            <button
              class="text-sm text-[#D5150D] font-semibold hover:underline cursor-pointer"
              (click)="addItem()"
            >
              + Agregar concepto
            </button>

            <!-- Totals -->
            <div class="flex justify-end">
              <div class="w-72 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Subtotal:</span>
                  <span class="font-semibold">{{ form.subtotal | currencyCop }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">IVA (19%):</span>
                  <span class="font-semibold">{{ form.tax | currencyCop }}</span>
                </div>
                <div class="flex justify-between text-lg border-t-2 border-[#D5150D] pt-2">
                  <span class="font-[Oxanium] font-bold text-[#D5150D]">Total:</span>
                  <span class="font-[Oxanium] font-bold text-[#D5150D]">{{ form.total | currencyCop }}</span>
                </div>
              </div>
            </div>

            <!-- Credit Fields -->
            @if (invoiceType() === 'credito') {
              <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#006D77] pb-2 text-[#006D77]">
                Informacion de Financiacion
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Cuota Inicial</label>
                  <input type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#006D77]"
                    [(ngModel)]="form.initialPayment" (ngModelChange)="recalculateCredit()" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">No. de Cuotas</label>
                  <input type="number" min="1" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#006D77]"
                    [(ngModel)]="form.installments" (ngModelChange)="recalculateCredit()" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Entidad Financiera</label>
                  <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#006D77]"
                    placeholder="Banco, cooperativa, etc." [(ngModel)]="form.financingEntity" />
                </div>
                <div class="flex items-end">
                  <div class="w-full bg-[#f0fafb] border-2 border-[#006D77] rounded-lg px-4 py-2">
                    <span class="text-sm text-gray-500">Cuota mensual:</span>
                    <span class="block font-[Oxanium] font-bold text-xl text-[#006D77]">
                      {{ form.monthlyPayment | currencyCop }}
                    </span>
                  </div>
                </div>
              </div>
            }

            <!-- Advisor -->
            <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#D5150D] pb-2">
              Datos del Asesor
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre del Asesor</label>
                <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [(ngModel)]="form.advisorName" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Telefono</label>
                <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [(ngModel)]="form.advisorPhone" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input type="email" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                  [(ngModel)]="form.advisorEmail" />
              </div>
            </div>

            <!-- SUBMIT -->
            <div class="flex justify-end gap-4 pt-4">
              <button
                class="px-8 py-3 text-white font-[Oxanium] font-bold text-lg rounded-lg uppercase tracking-wide transition-colors cursor-pointer"
                [style.background]="invoiceType() === 'credito' ? '#006D77' : '#D5150D'"
                (click)="createInvoice()"
              >
                Generar Factura de {{ invoiceType() === 'contado' ? 'Contado' : 'Credito' }}
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class InvoiceForm {
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly siteConfig = inject(SiteConfigService);
  private readonly invoiceService = inject(InvoiceService);

  readonly products = this.productService.products;
  readonly selectedSlug = signal('');
  readonly invoiceType = signal<InvoiceType>('contado');

  readonly selectedProduct = computed(() => {
    const slug = this.selectedSlug();
    if (!slug) return null;
    return this.products().find((p) => p.slug === slug) ?? null;
  });

  items: InvoiceItem[] = [
    { description: '', quantity: 1, unitPrice: 0, total: 0 },
  ];

  form = {
    productColor: '',
    productYear: new Date().getFullYear(),
    clientName: '',
    clientDocument: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    date: this.formatDateISO(new Date()),
    subtotal: 0,
    tax: 0,
    total: 0,
    initialPayment: 0,
    financedAmount: 0,
    installments: 12,
    monthlyPayment: 0,
    financingEntity: '',
    advisorName: '',
    advisorPhone: this.siteConfig.config().phone,
    advisorEmail: '',
  };

  onProductChange(slug: string) {
    this.selectedSlug.set(slug);
    const product = this.products().find((p) => p.slug === slug);
    if (product) {
      this.items = [
        { description: product.name, quantity: 1, unitPrice: 0, total: 0 },
      ];
      this.recalculate();
    }
  }

  addItem() {
    this.items = [...this.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }];
  }

  removeItem(index: number) {
    this.items = this.items.filter((_, i) => i !== index);
    this.recalculate();
  }

  recalculate() {
    this.items.forEach((item) => {
      item.total = item.quantity * item.unitPrice;
    });
    this.form.subtotal = this.invoiceService.calculateSubtotal(this.items);
    this.form.tax = this.invoiceService.calculateTax(this.form.subtotal);
    this.form.total = this.invoiceService.calculateTotal(this.form.subtotal, this.form.tax);
    this.recalculateCredit();
  }

  recalculateCredit() {
    this.form.financedAmount = this.form.total - (this.form.initialPayment || 0);
    if (this.form.installments > 0 && this.form.financedAmount > 0) {
      this.form.monthlyPayment = Math.round(this.form.financedAmount / this.form.installments);
    } else {
      this.form.monthlyPayment = 0;
    }
  }

  createInvoice() {
    const product = this.selectedProduct();
    if (!product) return;

    const invoice: Invoice = {
      id: this.invoiceService.generateId(),
      number: this.invoiceService.generateNumber(),
      type: this.invoiceType(),
      date: this.form.date,
      clientName: this.form.clientName,
      clientDocument: this.form.clientDocument,
      clientPhone: this.form.clientPhone,
      clientEmail: this.form.clientEmail,
      clientAddress: this.form.clientAddress,
      productSlug: product.slug,
      productName: product.name,
      productImage: product.images[0] ?? '',
      productColor: this.form.productColor,
      productYear: this.form.productYear,
      items: this.items.map((i) => ({ ...i })),
      subtotal: this.form.subtotal,
      tax: this.form.tax,
      total: this.form.total,
      initialPayment: this.form.initialPayment,
      financedAmount: this.form.financedAmount,
      installments: this.form.installments,
      monthlyPayment: this.form.monthlyPayment,
      financingEntity: this.form.financingEntity,
      advisorName: this.form.advisorName,
      advisorPhone: this.form.advisorPhone,
      advisorEmail: this.form.advisorEmail,
      createdAt: new Date().toISOString(),
    };

    this.invoiceService.save(invoice);
    this.router.navigate(['/factura', invoice.id]);
  }

  private formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
