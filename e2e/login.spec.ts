import { test, expect } from './fixtures/auth.fixture';
import { LoginPage } from './pages/login.page';

test.describe('Login', () => {
  test('successful login redirects to /cotizacion', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('grupohonda', 'Grupohonda12');
    await page.waitForURL('/cotizacion');
    await expect(page).toHaveURL(/\/cotizacion/);
  });

  test('failed login with wrong password shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('grupohonda', 'wrongpassword');
    await loginPage.expectErrorMessage();
    await expect(page).toHaveURL(/\/login/);
  });

  test('failed login with wrong username shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('wronguser', 'Grupohonda12');
    await loginPage.expectErrorMessage();
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated user is redirected to /login', async ({ page }) => {
    await page.goto('/cotizacion');
    await expect(page).toHaveURL(/\/login/);
  });

  test('after login, header and nav are visible', async ({ authenticatedPage }) => {
    await expect(authenticatedPage.getByRole('banner')).toBeVisible();
    await expect(authenticatedPage.getByRole('navigation')).toBeVisible();
    await expect(authenticatedPage.getByText('Honda Documentos')).toBeVisible();
  });

  test('logout redirects to /login', async ({ authenticatedPage }) => {
    await authenticatedPage.getByRole('button', { name: /salir/i }).click();
    await authenticatedPage.waitForURL('/login');
    await expect(authenticatedPage).toHaveURL(/\/login/);
  });
});
