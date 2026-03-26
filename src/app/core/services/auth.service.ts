import { Injectable, signal, computed } from '@angular/core';

const AUTH_KEY = 'honda_auth';
const VALID_USERNAME = 'grupohonda';
const VALID_PASSWORD = 'Grupohonda12';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _isAuthenticated = signal(this.checkStoredAuth());

  readonly isAuthenticated = computed(() => this._isAuthenticated());

  login(username: string, password: string): boolean {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'true');
      this._isAuthenticated.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(AUTH_KEY);
    this._isAuthenticated.set(false);
  }

  private checkStoredAuth(): boolean {
    return localStorage.getItem(AUTH_KEY) === 'true';
  }
}
