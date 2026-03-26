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
              <input
                id="password"
                type="password"
                [(ngModel)]="password"
                name="password"
                autocomplete="current-password"
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D5150D] focus:border-transparent transition"
                placeholder="Ingresá tu contraseña"
              />
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

  onSubmit(): void {
    this.error.set(false);

    if (this.authService.login(this.username, this.password)) {
      this.router.navigate(['/cotizacion']);
    } else {
      this.error.set(true);
    }
  }
}
