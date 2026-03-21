import { Component, input, computed, PLATFORM_ID, inject, signal, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Quotation } from '../../core/models';
import { CurrencyCopPipe } from '../../shared/pipes/currency-cop.pipe';

@Component({
  selector: 'app-quotation-template',
  imports: [CurrencyCopPipe],
  template: `
    <div
      class="quotation-page"
      id="quotation-render"
      [style.--accent]="accent()"
      [style.--accent-dark]="accentDark()"
    >
      <!-- WATERMARK -->
      <div class="watermark">
        <img src="/Honda_Logo.svg.png" alt="" />
      </div>

      <!-- HEADER ROW: title + stripes + logo -->
      <div class="header">
        <div class="header-accent">
          <span class="header-title">{{ data().paymentType === 'credito' ? 'COTIZACIÓN — CRÉDITO' : 'COTIZACIÓN — CONTADO' }}</span>
        </div>
        <div class="header-stripes">
          <span class="stripe"></span>
          <span class="stripe"></span>
          <span class="stripe"></span>
          <span class="stripe"></span>
          <span class="stripe"></span>
          <span class="stripe"></span>
          <span class="stripe"></span>
          <span class="stripe"></span>
          <span class="stripe"></span>
          <span class="stripe"></span>
          <span class="stripe"></span>
          <span class="stripe"></span>
        </div>
        <div class="header-logo">
          <img src="/Honda_Logo.svg.png" alt="Honda" class="honda-logo" />
        </div>
      </div>

      <!-- BODY: 2-column -->
      <div class="body-two-col">
        <div class="body-left">
          <div class="date-row">
            <span class="date-text">
              <strong>Fecha: {{ formatDate(data().date) }}</strong>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <strong># {{ data().number }}</strong>
            </span>
          </div>
          <div class="greeting-area">
            <h3 class="greeting-label">Estimado(a):</h3>
            <h2 class="client-name">{{ data().clientName }}</h2>
            <p class="greeting-text">
              Bienvenido(a) a Honda, la marca donde los sueños
              se hacen realidad, agradecemos tu confianza e
              interés por querer ser parte de nuestra gran familia.
            </p>
          </div>
        </div>
        <div class="body-right">
          <span class="category-badge">{{ data().category || 'Motocicleta Honda' }}</span>
          <img
            [src]="data().productImage"
            [alt]="data().productName"
            class="product-image"
          />
          <p class="image-ref">*Imagen de referencia</p>
          <!-- Dynamic feature icons -->
          <div class="feature-icons">
            @for (feat of dataFeatures(); track $index; let last = $last) {
              <div class="feature-icon-item">
                <div class="feature-icon-circle" [innerHTML]="featureSvg(feat.icon)"></div>
                <span class="feature-label" [innerHTML]="feat.label.replace('\\n', '<br/>')"></span>
              </div>
              @if (!last) {
                <div class="feature-divider"></div>
              }
            }
          </div>
        </div>
      </div>

      <!-- DREAM BANNER -->
      <div class="dream-banner">
        <span class="dream-text">HAZ TU SUEÑO REALIDAD</span>
        <div class="dream-stripes">
          <span class="ds"></span>
          <span class="ds"></span>
          <span class="ds"></span>
          <span class="ds"></span>
          <span class="ds"></span>
          <span class="ds"></span>
          <span class="ds"></span>
        </div>
      </div>

      <!-- PRODUCT NAME BAR -->
      <div class="product-name-bar">
        <h2>{{ data().productName }} {{ data().productYear }} {{ data().productColor }}</h2>
      </div>

      <!-- 3 COLUMNS: Benefits | Specs | Pricing -->
      <div class="three-columns">
        <!-- Dynamic Benefits -->
        <div class="col col-benefits">
          <h3 class="col-title">Beneficios</h3>
          @for (benefit of dataBenefits(); track $index) {
            <div class="benefit-item">
              <div class="benefit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" [attr.stroke]="accent()" stroke-width="2" width="20" height="20">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <p>{{ benefit }}</p>
            </div>
          }
        </div>

        <!-- Dynamic Specifications -->
        <div class="col col-specs">
          <h3 class="col-title">Especificaciones</h3>
          <table class="specs-table">
            @for (entry of specEntries(); track entry[0]) {
              <tr>
                <td class="spec-label">{{ entry[0] }}:</td>
                <td class="spec-value">{{ entry[1] }}</td>
              </tr>
            }
          </table>
        </div>

        <!-- Pricing -->
        <div class="col col-pricing">
          <h3 class="col-title">Información cotización</h3>
          <h4 class="pricing-subtitle">Oferta económica</h4>
          <table class="pricing-table">
            <tr>
              <td class="price-label">Precio con<br/>impuesto:</td>
              <td class="price-value">{{ data().priceWithTax | currencyCop }}</td>
            </tr>
            <tr>
              <td class="price-label">Valor SOAT:</td>
              <td class="price-value">{{ data().soatValue | currencyCop }}</td>
            </tr>
            <tr>
              <td class="price-label">Casco:</td>
              <td class="price-value">{{ data().helmetValue | currencyCop }}</td>
            </tr>
            <tr>
              <td class="price-label">Accesorios:</td>
              <td class="price-value">{{ data().accessoriesValue | currencyCop }}</td>
            </tr>
            <tr>
              <td class="price-label">Valor Matrícula:</td>
              <td class="price-value">{{ data().registrationValue | currencyCop }}</td>
            </tr>
            <tr>
              <td class="price-label">**Valor seguro<br/>todo riesgo:</td>
              <td class="price-value">{{ data().insuranceValue | currencyCop }}</td>
            </tr>
            <tr>
              <td class="price-label">Cantidad:</td>
              <td class="price-value">{{ data().quantity }}</td>
            </tr>
            <tr class="total-row">
              <td class="price-label">Total a pagar:</td>
              <td class="price-value total-value">{{ data().total | currencyCop }}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- DISCLAIMERS -->
      <div class="disclaimers">
        <p>
          *Las especificaciones técnicas pueden cambiar sin previo aviso. * Descuento aplicado al
          valor del producto antes de impuestos. ** El seguro de robo es opcional
        </p>
        <p class="disclaimer-highlight">
          * Consulta con tu asesor los planes de financiación que tenemos para ti a través de
          nuestros aliados.
        </p>
      </div>

      <!-- WARRANTY + REGISTRATION NOTE + QR -->
      <div class="warranty-section">
        <div class="warranty-badge">
          <div class="warranty-outer">
            <div class="warranty-inner">
              <img src="/images/logo-honda.webp" alt="Honda" class="warranty-honda-logo" />
              <span class="warranty-number">2</span>
              <span class="warranty-label">AÑOS</span>
              <span class="warranty-sub">GARANTÍA</span>
              <div class="warranty-km-box">
                <span class="warranty-km">o 30.000 KM.</span>
              </div>
            </div>
          </div>
        </div>
        <div class="registration-note">
          <p>
            El valor de matrícula de la motocicleta es solo un valor de referencia, este puede variar
            de acuerdo a la secretaría de tránsito ante la cuál se realice el trámite y al cilindraje
            de la motocicleta, según dicha entidad lo disponga.
          </p>
        </div>
        <div class="qr-area">
          @if (qrSvg()) {
            <div class="qr-image" [innerHTML]="qrSvg()"></div>
            <span class="qr-label">Escanea para<br/>ver tu cotización</span>
          }
        </div>
      </div>

      <!-- DELIVERY INFO -->
      <div class="delivery-info">
        <p>
          <strong>Las motocicleta se entrega con:</strong> &bull; Certificado ambiental por 2 años &bull; Kit
          básico de herramientas para Motocicleta &bull; Manual de garantía y mantenimiento &bull; Manual del
          propietario
        </p>
      </div>

      <!-- HONDA MESSAGE -->
      <div class="honda-message">
        <p>
          En Honda hacemos realidad tu sueño ofreciendo siempre un servicio de atención especializado
          en todo el territorio nacional a través de nuestras salas de venta, talleres autorizados y
          distribuidores de repuestos.
        </p>
      </div>

      <!-- CONTACT FOOTER -->
      <div class="contact-footer">
        <div class="contact-header">
          <h3 class="contact-title">CONTÁCTANOS</h3>
          <div class="contact-title-stripes">
            <span class="cts"></span>
            <span class="cts"></span>
            <span class="cts"></span>
            <span class="cts"></span>
            <span class="cts"></span>
            <span class="cts"></span>
            <span class="cts"></span>
            <span class="cts"></span>
          </div>
        </div>
        <div class="contact-content">
          <div class="contact-left">
            <table class="contact-table">
              <tr>
                <td class="contact-label">Nuestro Asesor:</td>
                <td class="contact-value">{{ data().advisorName }}, estará atento a resolver sus inquietudes.</td>
              </tr>
              <tr>
                <td class="contact-label">Teléfono:</td>
                <td class="contact-value">{{ data().advisorPhone }}</td>
              </tr>
              <tr>
                <td class="contact-label">Dirección:</td>
                <td class="contact-value">{{ data().advisorAddress }}</td>
              </tr>
              <tr>
                <td class="contact-label">Email:</td>
                <td class="contact-value">{{ data().advisorEmail }}</td>
              </tr>
            </table>
          </div>
          <div class="contact-right">
            <p class="valid-label">Cotización válida hasta</p>
            <p class="valid-date">{{ data().validUntil }}</p>
            <p class="conditions">Aplican condiciones y restricciones.</p>
            <p class="price-change-note">*El precio de los productos puede<br/>cambiar sin previo aviso</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    /* ========== RESET ========== */
    :host .quotation-page :is(h1, h2, h3, h4, h5, h6) {
      letter-spacing: 0;
      line-height: 1.3;
      text-transform: none;
      margin: 0;
    }
    :host p { margin-block-end: 0; }

    /* ========== PAGE ========== */
    .quotation-page {
      --accent: #D5150D;
      --accent-dark: #8B0000;
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
    .watermark img { width: 420px; height: auto; opacity: 0.06; }
    .header, .body-two-col, .dream-banner, .product-name-bar,
    .three-columns, .disclaimers, .warranty-section, .delivery-info,
    .honda-message, .contact-footer {
      position: relative;
      z-index: 1;
    }

    /* ========== HEADER ========== */
    .header { display: flex; align-items: stretch; height: 84px; }
    .header-accent {
      background: var(--accent);
      display: flex;
      align-items: center;
      padding: 0 24px;
      flex-shrink: 0;
    }
    .header-title {
      font-family: 'Oxanium', sans-serif;
      font-size: 34px;
      font-weight: 800;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    .header-stripes {
      background: var(--accent);
      display: flex;
      gap: 6px;
      flex: 1;
      align-items: center;
      justify-content: center;
      padding: 0 10px;
    }
    .stripe {
      width: 7px;
      height: 38px;
      background: rgba(255,255,255,0.3);
      transform: skewX(-18deg);
      border-radius: 1px;
    }
    .header-logo {
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 20px;
      flex-shrink: 0;
    }
    .honda-logo { height: 68px; width: auto; }

    /* ========== BODY 2-COLUMN ========== */
    .body-two-col { display: flex; border-bottom: 2.5px solid var(--accent); }
    .body-left {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .body-right {
      width: 370px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px 14px 8px;
      border-left: 1px solid #eee;
    }

    .category-badge {
      background: var(--accent);
      color: #fff;
      font-family: 'Oxanium', sans-serif;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 3px 14px;
      border-radius: 10px;
      margin-bottom: 6px;
    }

    .date-row { padding: 10px 24px; border-bottom: 2.5px solid var(--accent); }
    .date-text { font-family: 'Poppins', sans-serif; font-size: 14px; color: #222; }

    .greeting-area {
      padding: 20px 24px 14px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .greeting-label {
      font-family: 'Oxanium', sans-serif;
      font-size: 26px;
      font-weight: 800;
      margin: 0 0 4px;
      font-style: italic;
      color: var(--accent);
    }
    .client-name {
      font-family: 'Oxanium', sans-serif;
      font-size: 38px;
      font-weight: 800;
      color: #222;
      margin: 0 0 16px;
      text-transform: uppercase;
      line-height: 1.1;
    }
    .greeting-text { font-size: 15px; line-height: 1.7; color: #333; margin: 0; }

    .product-image { max-width: 340px; max-height: 210px; width: 100%; object-fit: contain; }
    .image-ref { font-size: 9px; color: #999; margin: 3px 0 8px; font-style: italic; }

    /* Feature Icons */
    .feature-icons {
      display: flex;
      align-items: flex-start;
      gap: 0;
      width: 100%;
      justify-content: center;
    }
    .feature-icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      flex: 1;
      padding: 0 6px;
    }
    .feature-icon-circle {
      width: 36px;
      height: 36px;
      border: 1.5px solid var(--accent);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent);
    }
    .feature-icon-circle ::ng-deep svg {
      width: 22px;
      height: 22px;
    }
    .feature-label {
      font-size: 6.5px;
      text-align: center;
      text-transform: uppercase;
      font-weight: 700;
      line-height: 1.25;
      color: #333;
      letter-spacing: 0.2px;
    }
    .feature-divider {
      width: 1px;
      background: #ccc;
      align-self: stretch;
      margin: 4px 0;
    }

    /* ========== DREAM BANNER ========== */
    .dream-banner {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      background: var(--accent);
      padding: 7px 20px;
      gap: 14px;
    }
    .dream-text {
      font-family: 'Oxanium', sans-serif;
      font-size: 24px;
      font-weight: 800;
      color: #fff;
      letter-spacing: 2px;
      font-style: italic;
    }
    .dream-stripes { display: flex; gap: 5px; }
    .ds {
      width: 7px;
      height: 30px;
      background: rgba(255,255,255,0.4);
      transform: skewX(-18deg);
      border-radius: 1px;
    }

    /* ========== PRODUCT NAME BAR ========== */
    .product-name-bar {
      background: #f7f7f7;
      padding: 10px 24px;
      border-bottom: 3px solid var(--accent);
    }
    .product-name-bar h2 {
      font-family: 'Oxanium', sans-serif;
      font-size: 28px;
      font-weight: 800;
      color: var(--accent-dark);
      margin: 0;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* ========== THREE COLUMNS ========== */
    .three-columns { display: flex; padding: 14px 24px; gap: 0; flex: 1; }
    .col { flex: 1; padding: 0 14px; }
    .col-benefits { border-right: 1.5px solid #ddd; padding-left: 0; }
    .col-specs { border-right: 1.5px solid #ddd; }
    .col-pricing { padding-right: 0; }
    .col-title {
      font-family: 'Oxanium', sans-serif;
      font-size: 15px;
      font-weight: 800;
      text-decoration: underline;
      text-decoration-color: var(--accent);
      text-underline-offset: 3px;
      margin: 0 0 12px;
      text-align: center;
      color: var(--accent-dark);
    }

    /* Benefits */
    .benefit-item { display: flex; gap: 8px; margin-bottom: 8px; align-items: flex-start; }
    .benefit-icon { flex-shrink: 0; margin-top: 1px; }
    .benefit-item p { margin: 0; font-size: 11px; line-height: 1.4; }

    /* Specs table */
    .specs-table { width: 100%; border-collapse: collapse; }
    .specs-table tr { border-bottom: 1px solid #eee; }
    .spec-label {
      font-weight: 700;
      padding: 3px 6px 3px 0;
      font-size: 10.5px;
      white-space: nowrap;
      vertical-align: top;
      color: var(--accent-dark);
    }
    .spec-value { padding: 3px 0; font-size: 10.5px; vertical-align: top; }

    /* Pricing */
    .pricing-subtitle {
      font-family: 'Oxanium', sans-serif;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
      margin: 0 0 10px;
      font-style: italic;
    }
    .pricing-table { width: 100%; border-collapse: collapse; }
    .price-label {
      font-weight: 700;
      padding: 5px 6px 5px 0;
      font-size: 11.5px;
      vertical-align: top;
      color: var(--accent);
    }
    .price-value {
      text-align: right;
      padding: 5px 0;
      font-size: 12px;
      white-space: nowrap;
      vertical-align: top;
      font-weight: 500;
    }
    .total-row { border-top: 2.5px solid var(--accent); }
    .total-row .price-label {
      font-size: 13px;
      font-weight: 800;
      padding-top: 8px;
      padding-bottom: 8px;
    }
    .total-value {
      font-weight: 800 !important;
      font-size: 14px !important;
      color: var(--accent);
      padding-top: 8px !important;
      padding-bottom: 8px !important;
    }

    /* ========== DISCLAIMERS ========== */
    .disclaimers { padding: 8px 24px; text-align: center; font-size: 9px; color: #666; line-height: 1.5; }
    .disclaimers p { margin: 1px 0; }
    .disclaimer-highlight { color: var(--accent); font-weight: 600; }

    /* ========== WARRANTY SECTION ========== */
    .warranty-section { display: flex; padding: 10px 24px; gap: 20px; align-items: center; }
    .warranty-badge { flex-shrink: 0; }
    .warranty-outer {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: linear-gradient(160deg, #888 0%, #444 30%, #222 60%, #555 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 12px rgba(0,0,0,0.3);
    }
    .warranty-inner {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(160deg, #777 0%, #3a3a3a 40%, #222 70%, #4a4a4a 100%);
      border: 3px solid var(--accent);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      position: relative;
    }
    .warranty-honda-logo { height: 14px; width: auto; margin-bottom: 1px; filter: brightness(0) invert(1); }
    .warranty-number {
      font-family: 'Oxanium', sans-serif;
      font-size: 38px;
      font-weight: 800;
      line-height: 0.85;
      color: var(--accent);
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }
    .warranty-label { font-family: 'Oxanium', sans-serif; font-size: 18px; font-weight: 800; line-height: 1; letter-spacing: 2px; }
    .warranty-sub { font-family: 'Oxanium', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 1px; }
    .warranty-km-box { background: var(--accent); border-radius: 8px; padding: 1px 10px; margin-top: 2px; }
    .warranty-km { font-family: 'Oxanium', sans-serif; font-size: 9px; font-weight: 700; color: #fff; letter-spacing: 0.5px; }

    .registration-note { flex: 1; border: 2.5px solid var(--accent); border-radius: 4px; padding: 12px 16px; }
    .registration-note p { margin: 0; font-size: 12px; line-height: 1.6; color: #333; }

    /* QR Code */
    .qr-area { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
    .qr-image { width: 110px; height: 110px; }
    .qr-image ::ng-deep svg { width: 100%; height: 100%; }
    .qr-label { font-size: 8px; text-align: center; color: #666; font-weight: 600; text-transform: uppercase; line-height: 1.3; }

    /* ========== DELIVERY INFO ========== */
    .delivery-info { padding: 8px 24px; }
    .delivery-info p { margin: 0; font-size: 11px; line-height: 1.6; }

    /* ========== HONDA MESSAGE ========== */
    .honda-message { background: var(--accent); padding: 10px 24px; margin-top: auto; }
    .honda-message p { margin: 0; font-size: 11px; color: #fff; text-align: center; line-height: 1.5; font-weight: 500; }

    /* ========== CONTACT FOOTER ========== */
    .contact-footer { border-top: 3px solid #222; }
    .contact-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 24px;
      border-bottom: 3px solid var(--accent);
    }
    .contact-title {
      font-family: 'Oxanium', sans-serif;
      font-size: 24px;
      font-weight: 800;
      margin: 0;
      white-space: nowrap;
      letter-spacing: 1px;
      color: var(--accent-dark);
    }
    .contact-title-stripes { display: flex; gap: 5px; align-items: center; }
    .cts { width: 6px; height: 30px; background: #ddd; transform: skewX(-18deg); border-radius: 1px; }
    .contact-content { display: flex; padding: 10px 24px 14px; gap: 20px; }
    .contact-left { flex: 1.4; }
    .contact-table { width: 100%; border-collapse: collapse; }
    .contact-table td { padding: 3px 6px 3px 0; font-size: 12px; vertical-align: top; }
    .contact-label { font-weight: 800; white-space: nowrap; }
    .contact-value { color: #333; }
    .contact-right { flex: 0.6; text-align: right; font-size: 11px; display: flex; flex-direction: column; justify-content: center; }
    .contact-right p { margin: 1px 0; }
    .valid-label { font-size: 12px; }
    .valid-date { font-weight: 800; font-size: 14px; color: var(--accent-dark); }
    .conditions { font-size: 10px; color: #555; margin-top: 4px !important; }
    .price-change-note { font-size: 10px; color: #555; }
  `,
})
export class QuotationTemplate {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sanitizer = inject(DomSanitizer);
  readonly data = input.required<Quotation>();
  readonly qrSvg = signal<SafeHtml | null>(null);

  readonly accent = computed(() => this.data().accentColor || '#D5150D');
  readonly accentDark = computed(() => this.data().accentDark || '#8B0000');

  readonly dataBenefits = computed(() => this.data().benefits ?? []);
  readonly dataFeatures = computed(() => this.data().features ?? []);

  constructor() {
    effect(() => {
      const q = this.data();
      if (q && isPlatformBrowser(this.platformId)) {
        this.generateQR(q.id);
      }
    });
  }

  featureSvg(iconPath: string): SafeHtml {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">${iconPath}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  private async generateQR(id: string) {
    try {
      const mod = await import('qrcode');
      const toString = mod.toString ?? mod.default?.toString;
      if (!toString) return;
      const url = `${window.location.origin}/factu/${id}`;
      const svg: string = await toString(url, {
        type: 'svg',
        width: 220,
        margin: 1,
        color: { dark: '#222222', light: '#ffffff' },
      });
      this.qrSvg.set(this.sanitizer.bypassSecurityTrustHtml(svg));
    } catch (e) {
      console.error('QR generation failed:', e);
    }
  }

  specEntries() {
    return Object.entries(this.data().specifications || {});
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]} / ${parts[1]} / ${parts[0]}`;
    }
    return dateStr;
  }
}
