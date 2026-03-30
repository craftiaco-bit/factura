import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const AUTH_KEY = 'honda_auth';
const VALID_USERNAME = 'grupohonda';
const VALID_PASSWORD = 'Grupohonda12';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _isAuthenticated = signal(this.checkStoredAuth());

  readonly isAuthenticated = computed(() => this._isAuthenticated());

  login(username: string, password: string): boolean {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(AUTH_KEY, 'true');
      }
      this._isAuthenticated.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(AUTH_KEY);
    }
    this._isAuthenticated.set(false);
  }

  private checkStoredAuth(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return localStorage.getItem(AUTH_KEY) === 'true';
  }
}
