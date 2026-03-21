import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'cotizacion',
    pathMatch: 'full',
  },
  {
    path: 'cotizacion',
    loadComponent: () =>
      import('./features/quotation/quotation-form').then((m) => m.QuotationForm),
  },
  {
    path: 'cotizacion/:id',
    loadComponent: () =>
      import('./features/quotation/quotation-view').then((m) => m.QuotationView),
  },
  {
    path: 'certificado',
    loadComponent: () =>
      import('./features/certificate/certificate-form').then((m) => m.CertificateForm),
  },
  {
    path: 'certificado/editar',
    loadComponent: () =>
      import('./features/certificate/certificate-edit').then((m) => m.CertificateEdit),
  },
  {
    path: 'certificado/:id',
    loadComponent: () =>
      import('./features/certificate/certificate-view').then((m) => m.CertificateView),
  },
  {
    path: 'factura',
    loadComponent: () =>
      import('./features/invoice/invoice-form').then((m) => m.InvoiceForm),
  },
  {
    path: 'factura/editar',
    loadComponent: () =>
      import('./features/invoice/invoice-edit').then((m) => m.InvoiceEdit),
  },
  {
    path: 'factura/:id',
    loadComponent: () =>
      import('./features/invoice/invoice-view').then((m) => m.InvoiceView),
  },
  { path: '**', redirectTo: 'cotizacion' },
];
