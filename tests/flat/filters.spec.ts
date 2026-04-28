/**
 * Part I — Flat tests (no POM)
 * Test suite: Navigate Products via Filters
 *
 * Rules:
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 *   - No CSS class selectors, no XPath
 *
 * Tip: run `npx playwright codegen https://www.kriso.ee` to discover selectors.
 */
import { test, expect, type Page } from '@playwright/test';

test.describe('Navigate Products via Filters', () => {
  test('Navigate via categories and filters', async ({ page }) => {
    await openHome(page);

    const section = page.getByText(/Muusikaraamatud ja noodid/i);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    await page.getByRole('link', { name: /Kitarr/i }).click();
    await expect(page).toHaveURL(/kitarr/i);

    const initialCount = await getProductCount(page);
    expect(initialCount).toBeGreaterThan(1);

    const languageFilter = page.getByLabel(/English|Inglise/i);
    await languageFilter.check();
    await expect(languageFilter).toBeChecked();

    const languageCount = await getProductCount(page);
    expect(languageCount).toBeLessThan(initialCount);

    const formatFilter = page.getByLabel(/CD/i);
    await formatFilter.check();
    await expect(formatFilter).toBeChecked();

    const formatCount = await getProductCount(page);
    expect(formatCount).toBeLessThan(languageCount);

    await formatFilter.uncheck();
    await languageFilter.uncheck();

    const clearedCount = await getProductCount(page);
    expect(clearedCount).toBeGreaterThan(formatCount);
  });
});

async function openHome(page: Page) {
  await page.goto('/');
  await acceptCookiesIfPresent(page);
  await expect(page).toHaveTitle(/kriso/i);
}

async function acceptCookiesIfPresent(page: Page) {
  const acceptButton = page.getByRole('button', { name: /Nõustun|Accept/i });
  if (await acceptButton.first().isVisible().catch(() => false)) {
    await acceptButton.first().click();
  }
}

async function getProductCount(page: Page) {
  const addToCartButtons = page.getByRole('link', { name: /Lisa ostukorvi|Add to cart/i });
  return await addToCartButtons.count();
}
