import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <!-- Header -->
          <div class="bg-[#222222] px-8 py-8 text-center">
            <img src="/Honda_Logo.svg.png" alt="Honda" class="h-12 mx-auto invert mb-4" />
            <h1 class="text-xl font-bold font-[Oxanium] text-white tracking-tight uppercase">
              Honda Documentos
            </h1>
            <p class="text-sm text-gray-400 mt-1">Sistema de Facturación y Certificados</p>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" class="px-8 py-8 space-y-5">
            @if (error()) {
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                Credenciales incorrectas. Intentá de nuevo.
              </div>
            }

            <div>
              <label for="username" class="block text-sm font-semibold text-gray-700 mb-1.5">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                [(ngModel)]="username"
                name="username"
                autocomplete="username"
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D5150D] focus:border-transparent transition"
                placeholder="Ingresá tu usuario"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-semibold text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  autocomplete="current-password"
                  required
                  class="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D5150D] focus:border-transparent transition"
                  placeholder="Ingresá tu contraseña"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-0 top-0 h-full px-3 flex items-center text-gray-500 hover:text-[#D5150D] transition-colors"
                  [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  @if (showPassword()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.72 11.72 0 013.168-4.477M6.343 6.343A9.97 9.97 0 0112 5c5 0 9.27 3.11 11 7.5a11.72 11.72 0 01-4.168 4.477M6.343 6.343L3 3m3.343 3.343l2.829 2.829m4.484 4.484l2.829 2.829M6.343 6.343l11.314 11.314M14.121 14.121A3 3 0 009.879 9.879" />
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="w-full bg-[#D5150D] hover:bg-[#B01009] text-white font-bold py-2.5 px-4 rounded-lg transition-colors font-[Oxanium] uppercase tracking-wide text-sm"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  error = signal(false);
  showPassword = signal(false);

  onSubmit(): void {
    this.error.set(false);

    if (this.authService.login(this.username, this.password)) {
      this.router.navigate(['/cotizacion']);
    } else {
      this.error.set(true);
    }
  }
}
