import { type Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.page.getByLabel('Usuario').fill(username);
    await this.page.getByLabel('Contraseña').fill(password);
    await this.page.getByRole('button', { name: /iniciar sesión/i }).click();
  }

  async expectErrorMessage() {
    await expect(
      this.page.getByText('Credenciales incorrectas. Intentá de nuevo.')
    ).toBeVisible();
  }
}
