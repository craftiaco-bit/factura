import { Component, input, computed } from '@angular/core';
import { Invoice } from '../../core/models/invoice.model';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop.pipe';

@Component({
  selector: 'app-invoice-template',
  imports: [CurrencyCopPipe],
  template: `
    <div class="invoice-page" [class.invoice-credit]="data().type === 'credito'" id="invoice-render">
      <!-- WATERMARK -->
      <div class="watermark">
        <img src="/Honda_Logo.svg.png" alt="" />
      </div>

      <!-- TYPE BANNER -->
      <div class="type-banner" [class.type-banner-credit]="data().type === 'credito'">
        <span class="type-banner-text">
          {{ data().type === 'contado' ? 'FACTURA DE VENTA — CONTADO' : 'FACTURA DE VENTA — CREDITO' }}
        </span>
      </div>

      <!-- HEADER -->
      <div class="header">
        <div class="header-left">
          <img src="/Honda_Logo.svg.png" alt="Honda" class="honda-logo" />
          <div class="company-info">
            <h2 class="company-name">HONDA BOGOTA</h2>
            <p>NIT: 900.123.456-7</p>
            <p>Av. 1 de Mayo #29-62, Antonio Narino</p>
            <p>Bogota, Colombia</p>
            <p>Tel: 315 992 3447</p>
          </div>
        </div>
        <div class="header-right">
          <div class="invoice-type-badge" [class.credit]="data().type === 'credito'">
            {{ data().type === 'contado' ? 'CONTADO' : 'CREDITO' }}
          </div>
          <div class="invoice-meta">
            <div class="meta-row">
              <span class="meta-label">No.</span>
              <span class="meta-value">{{ data().number }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Fecha:</span>
              <span class="meta-value">{{ formatDate(data().date) }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Tipo:</span>
              <span class="meta-value">{{ data().type === 'contado' ? 'Pago de contado' : 'Financiacion a credito' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- DIVIDER -->
      <div class="divider" [class.divider-credit]="data().type === 'credito'"></div>

      <!-- CLIENT INFO -->
      <div class="client-section">
        <h3 class="section-title">DATOS DEL CLIENTE</h3>
        <div class="client-grid">
          <div class="client-field">
            <span class="field-label">Nombre:</span>
            <span class="field-value">{{ data().clientName }}</span>
          </div>
          <div class="client-field">
            <span class="field-label">Documento:</span>
            <span class="field-value">{{ data().clientDocument }}</span>
          </div>
          <div class="client-field">
            <span class="field-label">Telefono:</span>
            <span class="field-value">{{ data().clientPhone }}</span>
          </div>
          <div class="client-field">
            <span class="field-label">Email:</span>
            <span class="field-value">{{ data().clientEmail }}</span>
          </div>
          <div class="client-field full-width">
            <span class="field-label">Direccion:</span>
            <span class="field-value">{{ data().clientAddress }}</span>
          </div>
        </div>
      </div>

      <!-- PRODUCT SECTION -->
      <div class="product-section">
        <div class="product-image-area">
          <img [src]="data().productImage" [alt]="data().productName" class="product-img" />
        </div>
        <div class="product-details">
          <h3 class="product-name">{{ data().productName }}</h3>
          <p class="product-variant">{{ data().productYear }} &bull; {{ data().productColor }}</p>
        </div>
      </div>

      <!-- ITEMS TABLE -->
      <div class="items-section">
        <table class="items-table">
          <thead>
            <tr>
              <th class="th-desc">Descripcion</th>
              <th class="th-qty">Cant.</th>
              <th class="th-price">Precio Unit.</th>
              <th class="th-total">Total</th>
            </tr>
          </thead>
          <tbody>
            @for (item of data().items; track $index) {
              <tr>
                <td class="td-desc">{{ item.description }}</td>
                <td class="td-qty">{{ item.quantity }}</td>
                <td class="td-price">{{ item.unitPrice | currencyCop }}</td>
                <td class="td-total">{{ item.total | currencyCop }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- TOTALS -->
      <div class="totals-section">
        <div class="totals-box">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>{{ data().subtotal | currencyCop }}</span>
          </div>
          <div class="total-row">
            <span>IVA (19%):</span>
            <span>{{ data().tax | currencyCop }}</span>
          </div>
          <div class="total-row grand-total" [class.grand-total-credit]="data().type === 'credito'">
            <span>TOTAL:</span>
            <span>{{ data().total | currencyCop }}</span>
          </div>
        </div>
      </div>

      <!-- CREDIT DETAILS (only for credito) -->
      @if (data().type === 'credito') {
        <div class="credit-section">
          <h3 class="section-title">INFORMACION DE FINANCIACION</h3>
          <div class="credit-grid">
            <div class="credit-field">
              <span class="field-label">Cuota inicial:</span>
              <span class="field-value highlight">{{ data().initialPayment | currencyCop }}</span>
            </div>
            <div class="credit-field">
              <span class="field-label">Monto financiado:</span>
              <span class="field-value">{{ data().financedAmount | currencyCop }}</span>
            </div>
            <div class="credit-field">
              <span class="field-label">No. de cuotas:</span>
              <span class="field-value">{{ data().installments }}</span>
            </div>
            <div class="credit-field">
              <span class="field-label">Cuota mensual:</span>
              <span class="field-value highlight">{{ data().monthlyPayment | currencyCop }}</span>
            </div>
            <div class="credit-field full-width">
              <span class="field-label">Entidad financiera:</span>
              <span class="field-value">{{ data().financingEntity }}</span>
            </div>
          </div>
        </div>
      }

      <!-- PAYMENT TYPE STAMP -->
      <div class="stamp-area">
        <div class="stamp" [class.stamp-credit]="data().type === 'credito'">
          {{ data().type === 'contado' ? 'CONTADO' : 'CREDITO' }}
        </div>
      </div>

      <!-- ADVISOR / FOOTER -->
      <div class="footer-section">
        <div class="advisor-info">
          <h4>Asesor Comercial</h4>
          <p class="advisor-name">{{ data().advisorName }}</p>
          <p>{{ data().advisorPhone }}</p>
          <p>{{ data().advisorEmail }}</p>
        </div>
        <div class="legal-info">
          <p>Esta factura se asimila en todos sus efectos a una letra de cambio (Art. 774 del Codigo de Comercio).</p>
          <p>Los precios incluyen IVA. Garantia Honda de 2 anos o 30.000 km.</p>
        </div>
      </div>

      <!-- BOTTOM STRIPE -->
      <div class="bottom-stripe" [class.bottom-stripe-credit]="data().type === 'credito'">
        <div class="stripe-inner">
          <span class="stripe-bar"></span>
          <span class="stripe-bar"></span>
          <span class="stripe-bar"></span>
          <span class="stripe-bar"></span>
          <span class="stripe-bar"></span>
          <span class="stripe-bar"></span>
          <span class="stripe-bar"></span>
          <span class="stripe-bar"></span>
          <span class="stripe-bar"></span>
          <span class="stripe-bar"></span>
        </div>
      </div>
    </div>
  `,
  styles: `
    /* ========== RESET ========== */
    :host .invoice-page :is(h1, h2, h3, h4, h5, h6) {
      letter-spacing: 0;
      line-height: 1.3;
      text-transform: none;
      margin: 0;
    }
    :host p { margin: 0; }

    /* ========== PAGE ========== */
    .invoice-page {
      width: 816px;
      min-height: 1056px;
      margin: 0 auto;
      background: #fff;
      font-family: 'Poppins', Arial, sans-serif;
      color: #222;
      font-size: 13px;
      line-height: 1.4;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 20px rgba(0,0,0,0.12);
      position: relative;
      overflow: hidden;
      padding: 0;
    }

    /* ========== WATERMARK ========== */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 0;
      pointer-events: none;
    }
    .watermark img { width: 380px; height: auto; opacity: 0.04; }

    .header, .client-section, .product-section, .items-section,
    .totals-section, .credit-section, .stamp-area, .footer-section,
    .bottom-stripe, .divider, .type-banner {
      position: relative;
      z-index: 1;
    }

    /* ========== TYPE BANNER ========== */
    .type-banner {
      background: #D5150D;
      padding: 10px 32px;
      text-align: center;
    }
    .type-banner-credit {
      background: #006D77;
    }
    .type-banner-text {
      font-family: 'Oxanium', sans-serif;
      font-size: 18px;
      font-weight: 800;
      color: #fff;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    /* ========== HEADER ========== */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 28px 32px 20px;
    }
    .header-left {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }
    .honda-logo { height: 60px; width: auto; }
    .company-info { font-size: 11px; color: #555; line-height: 1.6; }
    .company-name {
      font-family: 'Oxanium', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: #222;
      letter-spacing: 1px;
      margin-bottom: 2px;
    }
    .header-right {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
    }
    .invoice-type-badge {
      font-family: 'Oxanium', sans-serif;
      font-size: 16px;
      font-weight: 800;
      color: #fff;
      background: #D5150D;
      padding: 6px 20px;
      border-radius: 6px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .invoice-type-badge.credit {
      background: #006D77;
    }
    .invoice-meta { font-size: 13px; }
    .meta-row { display: flex; gap: 8px; justify-content: flex-end; }
    .meta-label { font-weight: 700; color: #555; }
    .meta-value { font-weight: 600; color: #222; }

    /* ========== DIVIDER ========== */
    .divider {
      height: 4px;
      background: linear-gradient(90deg, #D5150D 0%, #D5150D 60%, #222 60%, #222 100%);
      margin: 0 32px;
    }
    .divider-credit {
      background: linear-gradient(90deg, #006D77 0%, #006D77 60%, #222 60%, #222 100%);
    }

    /* ========== CLIENT ========== */
    .client-section {
      padding: 18px 32px 14px;
    }
    .section-title {
      font-family: 'Oxanium', sans-serif;
      font-size: 14px;
      font-weight: 800;
      color: #D5150D;
      letter-spacing: 1px;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .client-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 24px;
    }
    .client-field {
      display: flex;
      gap: 6px;
      padding: 4px 0;
      border-bottom: 1px solid #eee;
    }
    .client-field.full-width { grid-column: 1 / -1; }
    .field-label { font-weight: 700; font-size: 12px; color: #555; white-space: nowrap; }
    .field-value { font-size: 12px; color: #222; }

    /* ========== PRODUCT ========== */
    .product-section {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 14px 32px;
      background: #f9f9f9;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }
    .product-image-area { flex-shrink: 0; }
    .product-img { width: 160px; height: 100px; object-fit: contain; }
    .product-name {
      font-family: 'Oxanium', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #222;
      text-transform: uppercase;
    }
    .product-variant { font-size: 13px; color: #666; margin-top: 2px; }

    /* ========== ITEMS TABLE ========== */
    .items-section { padding: 16px 32px; }
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    .items-table th {
      font-family: 'Oxanium', sans-serif;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 8px;
      background: #222;
      color: #fff;
      text-align: left;
    }
    .th-qty, .th-price, .th-total { text-align: right; }
    .items-table td {
      padding: 10px 8px;
      font-size: 12px;
      border-bottom: 1px solid #eee;
    }
    .td-qty, .td-price, .td-total { text-align: right; white-space: nowrap; }
    .td-desc { max-width: 340px; }

    /* ========== TOTALS ========== */
    .totals-section {
      display: flex;
      justify-content: flex-end;
      padding: 0 32px 16px;
    }
    .totals-box {
      width: 280px;
      border: 2px solid #eee;
      border-radius: 6px;
      overflow: hidden;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      border-bottom: 1px solid #eee;
    }
    .total-row:last-child { border-bottom: none; }
    .grand-total {
      background: #D5150D;
      color: #fff;
      font-family: 'Oxanium', sans-serif;
      font-weight: 800;
      font-size: 15px;
      padding: 10px 16px;
    }
    .grand-total-credit {
      background: #006D77;
    }

    /* ========== CREDIT SECTION ========== */
    .credit-section {
      padding: 14px 32px;
      margin: 0 32px;
      background: #f0fafb;
      border: 2px solid #006D77;
      border-radius: 8px;
    }
    .credit-section .section-title { color: #006D77; }
    .credit-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 24px;
    }
    .credit-field {
      display: flex;
      gap: 6px;
      padding: 4px 0;
    }
    .credit-field.full-width { grid-column: 1 / -1; }
    .credit-field .field-value.highlight {
      font-weight: 800;
      color: #006D77;
      font-size: 14px;
    }

    /* ========== STAMP ========== */
    .stamp-area {
      display: flex;
      justify-content: center;
      padding: 20px 32px;
    }
    .stamp {
      font-family: 'Oxanium', sans-serif;
      font-size: 36px;
      font-weight: 800;
      color: #D5150D;
      border: 4px solid #D5150D;
      padding: 6px 32px;
      border-radius: 10px;
      transform: rotate(-5deg);
      opacity: 0.25;
      letter-spacing: 6px;
      text-transform: uppercase;
    }
    .stamp-credit {
      color: #006D77;
      border-color: #006D77;
    }

    /* ========== FOOTER ========== */
    .footer-section {
      display: flex;
      gap: 32px;
      padding: 14px 32px;
      margin-top: auto;
      border-top: 2px solid #eee;
    }
    .advisor-info { flex-shrink: 0; }
    .advisor-info h4 {
      font-family: 'Oxanium', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: #D5150D;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .invoice-credit .section-title { color: #006D77; }
    .invoice-credit .advisor-info h4 { color: #006D77; }
    .advisor-name { font-weight: 700; font-size: 14px; }
    .advisor-info p { font-size: 11px; color: #555; line-height: 1.6; }
    .legal-info {
      flex: 1;
      font-size: 9.5px;
      color: #888;
      line-height: 1.6;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    /* ========== BOTTOM STRIPE ========== */
    .bottom-stripe {
      background: #D5150D;
      padding: 8px 0;
    }
    .bottom-stripe-credit {
      background: #006D77;
    }
    .stripe-inner {
      display: flex;
      gap: 6px;
      justify-content: center;
      align-items: center;
    }
    .stripe-bar {
      width: 7px;
      height: 28px;
      background: rgba(255,255,255,0.35);
      transform: skewX(-18deg);
      border-radius: 1px;
    }
  `,
})
export class InvoiceTemplate {
  readonly data = input.required<Invoice>();

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]} / ${parts[1]} / ${parts[0]}`;
    }
    return dateStr;
  }
}
