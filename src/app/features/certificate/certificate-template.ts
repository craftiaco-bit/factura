import { Component, input, computed } from '@angular/core';
import { Certificate } from '../../core/models/certificate.model';

const SIGNATURE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100"><g opacity="0.85"><path d="M32 68 C30 58,28 42,38 30 C48 18,56 16,58 28 C60 40,46 52,42 56 C38 60,50 48,62 38 C74 28,78 24,82 32 C86 40,76 50,72 52" fill="none" stroke="#0d0d3b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M72 52 C80 42,92 30,100 34 C108 38,104 48,98 50 C92 52,96 38,108 32 C120 26,126 28,130 36 C134 44,128 50,124 48 C118 44,130 26,142 24 C150 22,156 30,154 38 C152 46,144 48,148 42" fill="none" stroke="#0d0d3b" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/><path d="M148 42 C156 32,168 26,178 30 C188 34,182 46,176 48 C170 50,180 34,194 28 C204 24,212 28,216 36 C220 44,210 50,206 46 C200 40,218 24,234 26 C246 28,252 36,248 42 C244 48,238 44,244 38 C250 32,260 30,268 34 C276 38,272 46,264 48" fill="none" stroke="#0d0d3b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M56 40 C72 36,96 34,110 36" fill="none" stroke="#0d0d3b" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/><path d="M60 62 C100 58,180 54,260 56 C270 56,274 58,270 60" fill="none" stroke="#0d0d3b" stroke-width="1.4" stroke-linecap="round" opacity="0.5"/><circle cx="270" cy="34" r="1.8" fill="#0d0d3b" opacity="0.6"/><path d="M82 32 C86 30,90 32,92 30" fill="none" stroke="#0d0d3b" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/></g></svg>`;

const SIGNATURE_DATA_URI = `data:image/svg+xml;base64,${typeof btoa !== 'undefined' ? btoa(SIGNATURE_SVG) : ''}`;

@Component({
  selector: 'app-certificate-template',
  template: `
    <div class="cert-page" id="certificate-render">
      <!-- WATERMARK centered -->
      <div class="watermark">
        <img src="/Honda_Logo.svg.png" alt="" />
      </div>

      <!-- HEADER -->
      <div class="header">
        <img src="/logohondaceti.png" alt="Honda - Come ride with us" class="header-banner-img" />
      </div>

      <!-- TITLE -->
      <div class="title-section">
        <h1 class="cert-title">CERTIFICADO DE CUENTA</h1>
        <div class="title-underline"></div>
      </div>

      <!-- BODY -->
      <div class="body">
        <p class="body-text">
          <strong>HONDA-SUPER MOTOS,</strong> se permite informar que
          <strong>{{ data().personName }}</strong>
          identificado(a) con CC. <strong>{{ data().documentNumber }}</strong>
          se encuentra encargada y autorizado(a) del área de cartera de la
          compañía y figura como titular de la cuenta.
        </p>

        <div class="account-block">
          <p class="account-line"><span class="account-label">CUENTA:</span> {{ data().accountBank }}</p>
          <p class="account-line"><span class="account-label">TIPO DE CUENTA:</span> {{ data().accountType }}</p>
          <p class="account-line"><span class="account-label">No:</span> {{ data().accountNumber }}</p>
        </div>
      </div>

      <!-- SIGNATURE -->
      <div class="signature">
        <img [src]="signatureImg" alt="" class="sig-img" />
        <div class="sig-line"></div>
        <p class="sig-name">{{ data().signerName }}</p>
        <p class="sig-role"><em>{{ data().signerRole }}</em></p>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <div class="footer-top">
          <img src="/images/image-removebg-preview.png" alt="GSM Grupo Supermotos" class="footer-gsm-logo" />
          <div class="footer-line"></div>
        </div>
        <div class="footer-bar">
          <p class="footer-text">
            *Importante: este certificado solo hace referencia a los productos mencionados anteriormente.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host .cert-page :is(h1,h2,h3,h4,h5,h6) {
      letter-spacing: 0; line-height: 1.3; text-transform: none; margin: 0;
    }
    :host p { margin: 0; }

    /* ===== PAGE ===== */
    .cert-page {
      width: 1056px;
      height: 816px;
      margin: 0 auto;
      background: #f5f3f0;
      font-family: 'Poppins', Arial, sans-serif;
      color: #222;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 24px rgba(0,0,0,0.14);
      position: relative;
      overflow: hidden;
    }

    /* ===== WATERMARK centered ===== */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 0;
      pointer-events: none;
    }
    .watermark img { width: 480px; height: auto; opacity: 0.05; }

    /* ===== HEADER ===== */
    .header { flex-shrink: 0; z-index: 1; padding: 16px 24px 0; }
    .header-banner-img {
      width: 320px;
      height: auto;
      display: block;
    }

    /* ===== TITLE ===== */
    .title-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 56px 0;
      z-index: 1;
      position: relative;
    }
    .title-underline {
      width: 460px;
      height: 3px;
      background: #D5150D;
      margin-top: 8px;
    }
    .cert-title {
      font-family: 'Oxanium', sans-serif;
      font-size: 38px;
      font-weight: 800;
      font-style: italic;
      color: #D5150D;
      text-align: center;
      white-space: nowrap;
      letter-spacing: 2px;
    }

    /* ===== BODY ===== */
    .body {
      flex: 1;
      padding: 36px 80px 0;
      z-index: 1;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .body-text {
      font-size: 21px;
      line-height: 2.1;
      text-align: justify;
      color: #222;
      margin: 0 0 36px;
    }

    .account-block {
      text-align: center;
    }
    .account-line {
      font-size: 22px;
      font-weight: 700;
      color: #D5150D;
      line-height: 1.8;
    }
    .account-label {
      color: #222;
      font-weight: 800;
    }

    /* ===== SIGNATURE ===== */
    .signature {
      text-align: center;
      padding: 24px 0 0;
      z-index: 1;
      position: relative;
    }
    .sig-img {
      width: 260px;
      height: 80px;
      display: block;
      margin: 0 auto -8px;
      object-fit: contain;
    }
    .sig-line {
      width: 300px;
      height: 1.5px;
      background: #222;
      margin: 0 auto 8px;
    }
    .sig-name {
      font-size: 16px;
      font-weight: 700;
      color: #222;
    }
    .sig-role {
      font-size: 14px;
      color: #555;
      margin-top: 2px;
    }

    /* ===== FOOTER ===== */
    .footer {
      flex-shrink: 0;
      z-index: 1;
      position: relative;
      margin-top: auto;
    }
    .footer-top {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 0 40px 12px;
    }
    .footer-gsm-logo {
      width: 80px;
      height: auto;
      flex-shrink: 0;
    }
    .footer-line {
      flex: 1;
      height: 2px;
      background: #D5150D;
    }
    .footer-bar {
      background: #D5150D;
      padding: 10px 40px;
    }
    .footer-text {
      font-size: 11px;
      font-style: italic;
      color: #fff;
      text-align: center;
      line-height: 1.5;
    }
  `,
})
export class CertificateTemplate {
  readonly data = input.required<Certificate>();
  readonly signatureImg = SIGNATURE_DATA_URI;
}
