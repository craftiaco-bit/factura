import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: '',
    redirectTo: 'cotizacion',
    pathMatch: 'full',
  },
  {
    path: 'cotizacion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/quotation/quotation-form').then((m) => m.QuotationForm),
  },
  {
    path: 'cotizacion/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/quotation/quotation-view').then((m) => m.QuotationView),
  },
  {
    path: 'certificado',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/certificate/certificate-form').then((m) => m.CertificateForm),
  },
  {
    path: 'certificado/editar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/certificate/certificate-edit').then((m) => m.CertificateEdit),
  },
  {
    path: 'certificado/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/certificate/certificate-view').then((m) => m.CertificateView),
  },
  {
    path: 'factura',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/invoice/invoice-form').then((m) => m.InvoiceForm),
  },
  {
    path: 'factura/editar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/invoice/invoice-edit').then((m) => m.InvoiceEdit),
  },
  {
    path: 'factura/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/invoice/invoice-view').then((m) => m.InvoiceView),
  },
  { path: '**', redirectTo: 'cotizacion' },
];
