import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50">
      @if (authService.isAuthenticated()) {
        <!-- Top Bar -->
        <header class="bg-[#222222] text-white shadow-lg">
          <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img src="/Honda_Logo.svg.png" alt="Honda" class="h-8 invert" />
              <div>
                <h1 class="text-lg font-bold font-[Oxanium] tracking-tight uppercase"
                    style="font-size:18px; letter-spacing:0">
                  Honda Documentos
                </h1>
                <p class="text-xs text-gray-400" style="margin:0">Sistema de Facturación y Certificados</p>
              </div>
            </div>
            <button
              (click)="onLogout()"
              class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Salir
            </button>
          </div>
        </header>

        <!-- Navigation -->
        <nav class="bg-white border-b border-gray-200 shadow-sm">
          <div class="max-w-7xl mx-auto px-4">
            <div class="flex gap-1 overflow-x-auto">
              <a routerLink="/cotizaciones" routerLinkActive="nav-active"
                 [routerLinkActiveOptions]="{exact: true}"
                 class="nav-link">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Cotizaciones
              </a>
              <a routerLink="/cotizacion" routerLinkActive="nav-active"
                 [routerLinkActiveOptions]="{exact: true}"
                 class="nav-link">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Nueva Cotización
              </a>
              <a routerLink="/factura" routerLinkActive="nav-active"
                 [routerLinkActiveOptions]="{exact: true}"
                 class="nav-link">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Nueva Factura
              </a>
              <a routerLink="/factura/editar" routerLinkActive="nav-active"
                 class="nav-link">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar Factura
              </a>
              <a routerLink="/certificado" routerLinkActive="nav-active"
                 [routerLinkActiveOptions]="{exact: true}"
                 class="nav-link">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Nuevo Certificado
              </a>
              <a routerLink="/certificado/editar" routerLinkActive="nav-active"
                 class="nav-link">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar Certificado
              </a>
            </div>
          </div>
        </nav>
      }

      <!-- Content -->
      <main>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      font-family: 'Oxanium', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      color: #4F4F4F;
      border-bottom: 3px solid transparent;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .nav-link:hover {
      color: #D5150D;
      background-color: #fef2f2;
    }
    .nav-active {
      color: #D5150D !important;
      border-bottom-color: #D5150D !important;
    }
  `],
})
export class App {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  title = 'Honda Documentos';

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
