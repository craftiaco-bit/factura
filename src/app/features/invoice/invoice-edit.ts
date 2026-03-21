import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { Invoice, InvoiceItem, InvoiceType } from '../../core/models/invoice.model';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop.pipe';

@Component({
  selector: 'app-invoice-edit',
  imports: [FormsModule, CurrencyCopPipe, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 py-8 px-4">
      <div class="max-w-3xl mx-auto">

        <!-- Header -->
        <div class="bg-[#222] text-white p-6 rounded-t-lg">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="font-[Oxanium] text-2xl font-bold uppercase tracking-wide">
                Buscar / Editar Factura
              </h1>
              <p class="text-sm text-gray-400 mt-1">Busca por numero de factura para editarla</p>
            </div>
            <img src="/images/logo-honda-1.webp" alt="Honda" class="h-12" />
          </div>
        </div>

        <div class="bg-white rounded-b-lg shadow-lg p-6 space-y-6">

          <!-- Search -->
          <div class="flex gap-3">
            <div class="flex-1 relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#D5150D] focus:border-transparent"
                placeholder="Buscar por numero (ej: FAC-12345)"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearch($event)"
              />
            </div>
          </div>

          <!-- Search Results -->
          @if (searchQuery && !editingInvoice()) {
            @if (searchResults().length > 0) {
              <div class="space-y-2">
                <p class="text-sm text-gray-500">{{ searchResults().length }} resultado(s)</p>
                @for (inv of searchResults(); track inv.id) {
                  <div
                    class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#D5150D] hover:bg-red-50 transition-all cursor-pointer"
                    (click)="loadInvoice(inv)"
                  >
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        [class.bg-[#D5150D]]="inv.type === 'contado'"
                        [class.bg-[#006D77]]="inv.type === 'credito'">
                        {{ inv.type === 'contado' ? 'C' : 'CR' }}
                      </div>
                      <div>
                        <p class="font-[Oxanium] font-bold text-sm">{{ inv.number }}</p>
                        <p class="text-xs text-gray-500">{{ inv.clientName }} &bull; {{ inv.productName }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="font-[Oxanium] font-bold text-[#D5150D]">{{ inv.total | currencyCop }}</p>
                      <p class="text-xs text-gray-500">{{ inv.date }}</p>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto text-gray-300 mb-3">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <p class="text-gray-400 font-semibold">No se encontraron facturas</p>
                <p class="text-sm text-gray-400 mt-1">Intenta con otro numero</p>
              </div>
            }
          }

          <!-- All invoices list (when no search) -->
          @if (!searchQuery && !editingInvoice()) {
            @if (allInvoices().length > 0) {
              <p class="text-sm text-gray-500 font-semibold">Todas las facturas ({{ allInvoices().length }})</p>
              <div class="space-y-2">
                @for (inv of allInvoices(); track inv.id) {
                  <div
                    class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#D5150D] hover:bg-red-50 transition-all cursor-pointer"
                    (click)="loadInvoice(inv)"
                  >
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        [class.bg-[#D5150D]]="inv.type === 'contado'"
                        [class.bg-[#006D77]]="inv.type === 'credito'">
                        {{ inv.type === 'contado' ? 'C' : 'CR' }}
                      </div>
                      <div>
                        <p class="font-[Oxanium] font-bold text-sm">{{ inv.number }}</p>
                        <p class="text-xs text-gray-500">{{ inv.clientName }} &bull; {{ inv.productName }}</p>
                      </div>
                    </div>
                    <div class="text-right flex items-center gap-4">
                      <div>
                        <p class="font-[Oxanium] font-bold text-[#D5150D]">{{ inv.total | currencyCop }}</p>
                        <p class="text-xs text-gray-500">{{ inv.date }}</p>
                      </div>
                      <button
                        class="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                        (click)="deleteInvoice(inv.id, $event)"
                        title="Eliminar factura"
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
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <p class="text-gray-400 font-semibold">No hay facturas creadas</p>
                <a routerLink="/factura" class="text-sm text-[#D5150D] font-semibold hover:underline mt-2 inline-block">
                  Crear nueva factura
                </a>
              </div>
            }
          }

          <!-- EDIT FORM -->
          @if (editingInvoice()) {
            <div class="border-t-2 border-[#D5150D] pt-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="font-[Oxanium] text-xl font-bold">
                    Editando: {{ editingInvoice()!.number }}
                  </h2>
                  <span class="text-xs px-2 py-1 rounded font-bold text-white"
                    [class.bg-[#D5150D]]="editForm.type === 'contado'"
                    [class.bg-[#006D77]]="editForm.type === 'credito'">
                    {{ editForm.type === 'contado' ? 'CONTADO' : 'CREDITO' }}
                  </span>
                </div>
                <button
                  class="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                  (click)="cancelEdit()"
                >
                  Cancelar
                </button>
              </div>

              <!-- Invoice Type -->
              <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo de Factura</label>
                <div class="flex gap-4">
                  <button
                    class="flex-1 py-2 px-4 rounded-lg font-[Oxanium] font-bold text-sm uppercase border-2 transition-all cursor-pointer"
                    [class]="editForm.type === 'contado'
                      ? 'bg-[#D5150D] text-white border-[#D5150D]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-[#D5150D]'"
                    (click)="editForm.type = 'contado'"
                  >
                    Contado
                  </button>
                  <button
                    class="flex-1 py-2 px-4 rounded-lg font-[Oxanium] font-bold text-sm uppercase border-2 transition-all cursor-pointer"
                    [class]="editForm.type === 'credito'
                      ? 'bg-[#006D77] text-white border-[#006D77]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-[#006D77]'"
                    (click)="editForm.type = 'credito'"
                  >
                    Credito
                  </button>
                </div>
              </div>

              <!-- Product Selection -->
              <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Moto</label>
                <select
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#D5150D] focus:border-transparent"
                  [(ngModel)]="editForm.productSlug"
                  (ngModelChange)="onEditProductChange($event)"
                >
                  <option value="">-- Selecciona una moto --</option>
                  @for (product of products(); track product.slug) {
                    <option [value]="product.slug">{{ product.name }}</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Color / Variante</label>
                  <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.productColor" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Ano</label>
                  <input type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.productYear" />
                </div>
              </div>

              <!-- Client -->
              <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#D5150D] pb-2 mb-4">
                Datos del Cliente
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                  <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.clientName" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Documento (CC/NIT)</label>
                  <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.clientDocument" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Telefono</label>
                  <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.clientPhone" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.clientEmail" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Direccion</label>
                  <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.clientAddress" />
                </div>
              </div>

              <!-- Date -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
                  <input type="date" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.date" />
                </div>
              </div>

              <!-- Line Items -->
              <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#D5150D] pb-2 mb-4">
                Conceptos
              </h3>
              @for (item of editItems; track $index) {
                <div class="flex gap-3 items-end mb-3">
                  <div class="flex-1">
                    <label class="block text-xs font-semibold text-gray-500 mb-1">Descripcion</label>
                    <input type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                      [(ngModel)]="item.description" (ngModelChange)="recalculateEdit()" />
                  </div>
                  <div class="w-20">
                    <label class="block text-xs font-semibold text-gray-500 mb-1">Cant.</label>
                    <input type="number" min="1" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                      [(ngModel)]="item.quantity" (ngModelChange)="recalculateEdit()" />
                  </div>
                  <div class="w-40">
                    <label class="block text-xs font-semibold text-gray-500 mb-1">Precio Unit.</label>
                    <input type="number" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                      [(ngModel)]="item.unitPrice" (ngModelChange)="recalculateEdit()" />
                  </div>
                  <div class="w-36 flex items-end gap-1">
                    <div class="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right font-semibold">
                      {{ item.total | currencyCop }}
                    </div>
                    @if (editItems.length > 1) {
                      <button class="text-red-500 hover:text-red-700 p-2 cursor-pointer" (click)="removeEditItem($index)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                      </button>
                    }
                  </div>
                </div>
              }
              <button class="text-sm text-[#D5150D] font-semibold hover:underline cursor-pointer mb-4" (click)="addEditItem()">
                + Agregar concepto
              </button>

              <!-- Totals -->
              <div class="flex justify-end mb-4">
                <div class="w-72 space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal:</span>
                    <span class="font-semibold">{{ editForm.subtotal | currencyCop }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">IVA (19%):</span>
                    <span class="font-semibold">{{ editForm.tax | currencyCop }}</span>
                  </div>
                  <div class="flex justify-between text-lg border-t-2 border-[#D5150D] pt-2">
                    <span class="font-[Oxanium] font-bold text-[#D5150D]">Total:</span>
                    <span class="font-[Oxanium] font-bold text-[#D5150D]">{{ editForm.total | currencyCop }}</span>
                  </div>
                </div>
              </div>

              <!-- Credit Fields -->
              @if (editForm.type === 'credito') {
                <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#006D77] pb-2 text-[#006D77] mb-4">
                  Informacion de Financiacion
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Cuota Inicial</label>
                    <input type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#006D77]"
                      [(ngModel)]="editForm.initialPayment" (ngModelChange)="recalculateEditCredit()" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">No. de Cuotas</label>
                    <input type="number" min="1" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#006D77]"
                      [(ngModel)]="editForm.installments" (ngModelChange)="recalculateEditCredit()" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Entidad Financiera</label>
                    <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#006D77]"
                      [(ngModel)]="editForm.financingEntity" />
                  </div>
                  <div class="flex items-end">
                    <div class="w-full bg-[#f0fafb] border-2 border-[#006D77] rounded-lg px-4 py-2">
                      <span class="text-sm text-gray-500">Cuota mensual:</span>
                      <span class="block font-[Oxanium] font-bold text-xl text-[#006D77]">
                        {{ editForm.monthlyPayment | currencyCop }}
                      </span>
                    </div>
                  </div>
                </div>
              }

              <!-- Advisor -->
              <h3 class="font-[Oxanium] font-bold text-lg border-b-2 border-[#D5150D] pb-2 mb-4">
                Datos del Asesor
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                  <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.advisorName" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Telefono</label>
                  <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.advisorPhone" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#D5150D]"
                    [(ngModel)]="editForm.advisorEmail" />
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-between items-center pt-4 border-t">
                <button
                  class="px-4 py-2 text-red-500 border border-red-300 rounded-lg hover:bg-red-50 text-sm font-semibold cursor-pointer"
                  (click)="deleteAndClose()"
                >
                  Eliminar Factura
                </button>
                <div class="flex gap-3">
                  <button
                    class="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-semibold cursor-pointer"
                    (click)="cancelEdit()"
                  >
                    Cancelar
                  </button>
                  <a
                    [routerLink]="['/factura', editingInvoice()!.id]"
                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold"
                  >
                    Ver Factura
                  </a>
                  <button
                    class="px-8 py-2 text-white font-[Oxanium] font-bold rounded-lg uppercase tracking-wide transition-colors cursor-pointer"
                    [class]="editForm.type === 'credito' ? 'bg-[#006D77] hover:bg-teal-800' : 'bg-[#D5150D] hover:bg-red-700'"
                    (click)="saveInvoice()"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>

            <!-- Success message -->
            @if (showSaved()) {
              <div class="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm font-semibold text-center">
                Factura guardada correctamente
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class InvoiceEdit {
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly invoiceService = inject(InvoiceService);

  readonly products = this.productService.products;
  readonly allInvoices = this.invoiceService.invoices;

  searchQuery = '';
  readonly searchResults = signal<Invoice[]>([]);
  readonly editingInvoice = signal<Invoice | null>(null);
  readonly showSaved = signal(false);

  editItems: InvoiceItem[] = [];
  editForm = {
    type: 'contado' as InvoiceType,
    productSlug: '',
    productColor: '',
    productYear: new Date().getFullYear(),
    clientName: '',
    clientDocument: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    date: '',
    subtotal: 0,
    tax: 0,
    total: 0,
    initialPayment: 0,
    financedAmount: 0,
    installments: 12,
    monthlyPayment: 0,
    financingEntity: '',
    advisorName: '',
    advisorPhone: '',
    advisorEmail: '',
  };

  onSearch(query: string) {
    if (!query.trim()) {
      this.searchResults.set([]);
      return;
    }
    const q = query.trim().toUpperCase();
    const results = this.allInvoices().filter((i) =>
      i.number.toUpperCase().includes(q) ||
      i.clientName.toUpperCase().includes(q) ||
      i.clientDocument.includes(q)
    );
    this.searchResults.set(results);
  }

  loadInvoice(inv: Invoice) {
    this.editingInvoice.set(inv);
    this.editItems = inv.items.map((i) => ({ ...i }));
    this.editForm = {
      type: inv.type,
      productSlug: inv.productSlug,
      productColor: inv.productColor,
      productYear: inv.productYear,
      clientName: inv.clientName,
      clientDocument: inv.clientDocument,
      clientPhone: inv.clientPhone,
      clientEmail: inv.clientEmail,
      clientAddress: inv.clientAddress,
      date: inv.date,
      subtotal: inv.subtotal,
      tax: inv.tax,
      total: inv.total,
      initialPayment: inv.initialPayment,
      financedAmount: inv.financedAmount,
      installments: inv.installments,
      monthlyPayment: inv.monthlyPayment,
      financingEntity: inv.financingEntity,
      advisorName: inv.advisorName,
      advisorPhone: inv.advisorPhone,
      advisorEmail: inv.advisorEmail,
    };
    this.showSaved.set(false);
  }

  cancelEdit() {
    this.editingInvoice.set(null);
    this.showSaved.set(false);
  }

  onEditProductChange(slug: string) {
    const product = this.products().find((p) => p.slug === slug);
    if (product) {
      this.editForm.productSlug = product.slug;
    }
  }

  addEditItem() {
    this.editItems = [...this.editItems, { description: '', quantity: 1, unitPrice: 0, total: 0 }];
  }

  removeEditItem(index: number) {
    this.editItems = this.editItems.filter((_, i) => i !== index);
    this.recalculateEdit();
  }

  recalculateEdit() {
    this.editItems.forEach((item) => {
      item.total = item.quantity * item.unitPrice;
    });
    this.editForm.subtotal = this.invoiceService.calculateSubtotal(this.editItems);
    this.editForm.tax = this.invoiceService.calculateTax(this.editForm.subtotal);
    this.editForm.total = this.invoiceService.calculateTotal(this.editForm.subtotal, this.editForm.tax);
    this.recalculateEditCredit();
  }

  recalculateEditCredit() {
    this.editForm.financedAmount = this.editForm.total - (this.editForm.initialPayment || 0);
    if (this.editForm.installments > 0 && this.editForm.financedAmount > 0) {
      this.editForm.monthlyPayment = Math.round(this.editForm.financedAmount / this.editForm.installments);
    } else {
      this.editForm.monthlyPayment = 0;
    }
  }

  saveInvoice() {
    const original = this.editingInvoice();
    if (!original) return;

    const product = this.products().find((p) => p.slug === this.editForm.productSlug);

    const updated: Invoice = {
      ...original,
      type: this.editForm.type,
      date: this.editForm.date,
      clientName: this.editForm.clientName,
      clientDocument: this.editForm.clientDocument,
      clientPhone: this.editForm.clientPhone,
      clientEmail: this.editForm.clientEmail,
      clientAddress: this.editForm.clientAddress,
      productSlug: this.editForm.productSlug,
      productName: product?.name ?? original.productName,
      productImage: product?.images[0] ?? original.productImage,
      productColor: this.editForm.productColor,
      productYear: this.editForm.productYear,
      items: this.editItems.map((i) => ({ ...i })),
      subtotal: this.editForm.subtotal,
      tax: this.editForm.tax,
      total: this.editForm.total,
      initialPayment: this.editForm.initialPayment,
      financedAmount: this.editForm.financedAmount,
      installments: this.editForm.installments,
      monthlyPayment: this.editForm.monthlyPayment,
      financingEntity: this.editForm.financingEntity,
      advisorName: this.editForm.advisorName,
      advisorPhone: this.editForm.advisorPhone,
      advisorEmail: this.editForm.advisorEmail,
    };

    this.invoiceService.save(updated);
    this.editingInvoice.set(updated);
    this.showSaved.set(true);
    setTimeout(() => this.showSaved.set(false), 3000);

    // Update search results if active
    if (this.searchQuery) {
      this.onSearch(this.searchQuery);
    }
  }

  deleteInvoice(id: string, event: Event) {
    event.stopPropagation();
    this.invoiceService.delete(id);
    if (this.searchQuery) {
      this.onSearch(this.searchQuery);
    }
  }

  deleteAndClose() {
    const inv = this.editingInvoice();
    if (!inv) return;
    this.invoiceService.delete(inv.id);
    this.cancelEdit();
  }
}
