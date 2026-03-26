import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

type AuthFixtures = {
  authenticatedPage: ReturnType<typeof base['extend']> extends infer T ? T : never;
};

export const test = base.extend<{ authenticatedPage: import('@playwright/test').Page }>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('grupohonda', 'Grupohonda12');
    await page.waitForURL('/cotizacion');
    await use(page);
  },
});

export { expect };
