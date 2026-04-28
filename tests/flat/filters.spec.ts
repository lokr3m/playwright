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
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe('Navigate Products via Filters', () => {

  const baseUrl = 'https://www.kriso.ee/';
  const addToCartName = /Lisa ostukorvi/i;

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    const consent = page.getByRole('button', { name: /Nõustun|Accept/i });
    if (await consent.isVisible()) {
      await consent.click();
    }
  });

  test('Navigate and filter products', async ({ page }) => {
    await expect(page.getByRole('link', { name: /kriso/i })).toBeVisible();

    const section = page.getByText('Muusikaraamatud ja noodid');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    await page.getByText('Kitarr', { exact: true }).click();
    await expect(page).toHaveURL(/kitarr/i);

    const initialCount = await (await getAddToCartItems(page)).count();
    expect(initialCount).toBeGreaterThan(1);

    const languageFilter = page.getByLabel(/English|Inglise/i);
    await languageFilter.click();
    const afterLanguageCount = await (await getAddToCartItems(page)).count();
    expect(afterLanguageCount).toBeLessThan(initialCount);

    await page.getByText('CD', { exact: true }).click();
    await expect(page.getByText('CD', { exact: true })).toBeVisible();
    const afterFormatCount = await (await getAddToCartItems(page)).count();
    expect(afterFormatCount).toBeLessThan(afterLanguageCount);

    const clearFiltersButton = page.getByRole('button', { name: /Tühjenda|Eemalda|Clear/i });
    if (await clearFiltersButton.count() > 0) {
      await clearFiltersButton.first().click();
    }

    const clearedCount = await (await getAddToCartItems(page)).count();
    expect(clearedCount).toBeGreaterThan(afterFormatCount);
  });

  async function getAddToCartItems(page: Page) {
    const addButtons = page.getByRole('button', { name: addToCartName });
    if (await addButtons.count() > 0) {
      return addButtons;
    }
    return page.getByRole('link', { name: addToCartName });
  }

});
