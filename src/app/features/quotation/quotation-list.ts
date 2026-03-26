import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuotationService } from '../../core/services/quotation.service';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop.pipe';
import { Quotation } from '../../core/models';

@Component({
  selector: 'app-quotation-list',
  imports: [RouterLink, CurrencyCopPipe],
  template: `
    <div class="min-h-screen bg-gray-100 py-8 px-4">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="bg-[#D5150D] text-white p-6 rounded-t-lg">
          <div class="flex items-center justify-between">
            <h1 class="font-[Oxanium] text-2xl font-bold uppercase tracking-wide">
              Cotizaciones
            </h1>
            <div class="flex items-center gap-3">
              <a
                routerLink="/cotizacion"
                class="px-4 py-2 bg-white text-[#D5150D] font-[Oxanium] font-bold text-sm rounded-lg hover:bg-gray-100 transition-colors"
              >
                + Nueva Cotización
              </a>
              <img src="/images/logo-honda-1.webp" alt="Honda" class="h-12" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-b-lg shadow-lg p-6">
          <!-- Search Bar -->
          <div class="mb-6">
            <input
              type="text"
              placeholder="Buscar por nombre de cliente o número de cotización..."
              class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#D5150D] focus:border-transparent"
              [value]="searchTerm()"
              (input)="searchTerm.set($any($event.target).value)"
            />
          </div>

          @if (filteredQuotations().length === 0) {
            <!-- Empty State -->
            <div class="text-center py-16">
              <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 class="font-[Oxanium] text-xl font-bold text-gray-400 mb-2">No hay cotizaciones</h3>
              <p class="text-sm text-gray-400 mb-4">
                @if (searchTerm()) {
                  No se encontraron resultados para "{{ searchTerm() }}"
                } @else {
                  Crea tu primera cotización para verla aquí
                }
              </p>
              @if (!searchTerm()) {
                <a
                  routerLink="/cotizacion"
                  class="inline-block px-6 py-3 bg-[#D5150D] text-white font-[Oxanium] font-bold text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  Crear Cotización
                </a>
              }
            </div>
          } @else {
            <!-- Desktop Table -->
            <div class="hidden md:block overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b-2 border-gray-200 text-left">
                    <th class="py-3 px-3 font-[Oxanium] font-bold text-gray-600 uppercase text-xs">#</th>
                    <th class="py-3 px-3 font-[Oxanium] font-bold text-gray-600 uppercase text-xs">Cliente</th>
                    <th class="py-3 px-3 font-[Oxanium] font-bold text-gray-600 uppercase text-xs">Producto</th>
                    <th class="py-3 px-3 font-[Oxanium] font-bold text-gray-600 uppercase text-xs">Fecha</th>
                    <th class="py-3 px-3 font-[Oxanium] font-bold text-gray-600 uppercase text-xs text-right">Total</th>
                    <th class="py-3 px-3 font-[Oxanium] font-bold text-gray-600 uppercase text-xs text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (q of filteredQuotations(); track q.id) {
                    <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td class="py-3 px-3 font-mono text-xs text-gray-500">{{ q.number }}</td>
                      <td class="py-3 px-3 font-semibold text-gray-800">{{ q.clientName || 'Sin nombre' }}</td>
                      <td class="py-3 px-3">
                        <div>
                          <span class="text-gray-800">{{ q.productName }}</span>
                          @if (q.productColor) {
                            <span class="block text-xs text-[#D5150D]">{{ q.productColor }}</span>
                          }
                        </div>
                      </td>
                      <td class="py-3 px-3 text-gray-600">{{ formatDate(q.date) }}</td>
                      <td class="py-3 px-3 text-right font-[Oxanium] font-bold text-[#D5150D]">{{ q.total | currencyCop }}</td>
                      <td class="py-3 px-3">
                        <div class="flex items-center justify-center gap-2">
                          <a
                            [routerLink]="['/cotizacion', q.id]"
                            class="px-3 py-1.5 text-xs font-semibold text-white bg-[#D5150D] rounded hover:bg-red-700 transition-colors"
                          >
                            Ver
                          </a>
                          <a
                            [routerLink]="['/cotizacion/editar', q.id]"
                            class="px-3 py-1.5 text-xs font-semibold text-[#D5150D] border border-[#D5150D] rounded hover:bg-red-50 transition-colors"
                          >
                            Editar
                          </a>
                          <button
                            class="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors cursor-pointer"
                            (click)="confirmDelete(q)"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Mobile Cards -->
            <div class="md:hidden space-y-4">
              @for (q of filteredQuotations(); track q.id) {
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <p class="font-semibold text-gray-800">{{ q.clientName || 'Sin nombre' }}</p>
                      <p class="text-xs text-gray-500 font-mono">#{{ q.number }}</p>
                    </div>
                    <span class="font-[Oxanium] font-bold text-[#D5150D]">{{ q.total | currencyCop }}</span>
                  </div>
                  <div class="mb-3">
                    <p class="text-sm text-gray-700">{{ q.productName }}</p>
                    @if (q.productColor) {
                      <p class="text-xs text-[#D5150D]">{{ q.productColor }}</p>
                    }
                    <p class="text-xs text-gray-500 mt-1">{{ formatDate(q.date) }}</p>
                  </div>
                  <div class="flex gap-2 pt-3 border-t border-gray-100">
                    <a
                      [routerLink]="['/cotizacion', q.id]"
                      class="flex-1 text-center px-3 py-2 text-xs font-semibold text-white bg-[#D5150D] rounded hover:bg-red-700 transition-colors"
                    >
                      Ver
                    </a>
                    <a
                      [routerLink]="['/cotizacion/editar', q.id]"
                      class="flex-1 text-center px-3 py-2 text-xs font-semibold text-[#D5150D] border border-[#D5150D] rounded hover:bg-red-50 transition-colors"
                    >
                      Editar
                    </a>
                    <button
                      class="flex-1 px-3 py-2 text-xs font-semibold text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      (click)="confirmDelete(q)"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    @if (quotationToDelete()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="font-[Oxanium] font-bold text-lg mb-2">Eliminar Cotización</h3>
          <p class="text-sm text-gray-600 mb-6">
            ¿Estás seguro de eliminar la cotización
            <strong>#{{ quotationToDelete()!.number }}</strong>
            de <strong>{{ quotationToDelete()!.clientName || 'Sin nombre' }}</strong>?
            Esta acción no se puede deshacer.
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              (click)="quotationToDelete.set(null)"
            >
              Cancelar
            </button>
            <button
              class="px-4 py-2 text-sm font-semibold text-white bg-[#D5150D] rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              (click)="deleteConfirmed()"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class QuotationList {
  private readonly quotationService = inject(QuotationService);

  readonly searchTerm = signal('');
  readonly quotationToDelete = signal<Quotation | null>(null);

  readonly filteredQuotations = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const all = this.quotationService
      .quotations()
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (!term) return all;

    return all.filter(
      (q) =>
        q.clientName?.toLowerCase().includes(term) ||
        q.number?.toLowerCase().includes(term)
    );
  });

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  }

  confirmDelete(quotation: Quotation): void {
    this.quotationToDelete.set(quotation);
  }

  deleteConfirmed(): void {
    const q = this.quotationToDelete();
    if (!q) return;
    this.quotationService.delete(q.id);
    this.quotationToDelete.set(null);
  }
}
