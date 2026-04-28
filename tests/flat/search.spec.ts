/**
 * Part I — Flat tests (no POM)
 * Test suite: Search for Books by Keywords
 *
 * Rules:
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 *   - No CSS class selectors, no XPath
 *
 * Tip: run `npx playwright codegen https://www.kriso.ee` to discover selectors.
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe('Search for Books by Keywords', () => {

  const baseUrl = 'https://www.kriso.ee/';
  const searchPlaceholder = /Pealkiri, autor, ISBN/i;
  const searchButtonName = /Search|Otsi/i;
  const addToCartName = /Lisa ostukorvi/i;

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    const consent = page.getByRole('button', { name: /Nõustun|Accept/i });
    if (await consent.isVisible()) {
      await consent.click();
    }
  });

  test('Open homepage and see Kriso logo', async ({ page }) => {
    await expect(page.getByRole('link', { name: /kriso/i })).toBeVisible();
  });

  test('Search for random keyword shows no products', async ({ page }) => {
    await page.getByPlaceholder(searchPlaceholder).fill('xqzwmfkj');
    await page.getByRole('button', { name: searchButtonName }).click();
    await expect(await getAddToCartItems(page)).toHaveCount(0);
  });

  test('Search for Tolkien shows multiple matching products', async ({ page }) => {
    await page.getByPlaceholder(searchPlaceholder).fill('tolkien');
    await page.getByRole('button', { name: searchButtonName }).click();

    const addButtons = await getAddToCartItems(page);
    const addButtonCount = await addButtons.count();
    expect(addButtonCount).toBeGreaterThan(1);

    const keywordLinks = page.getByRole('link', { name: /tolkien/i });
    expect(await keywordLinks.count()).toBe(addButtonCount);
  });

  test('Search by ISBN shows Gone Girl', async ({ page }) => {
    await page.getByPlaceholder(searchPlaceholder).fill('9780307588371');
    await page.getByRole('button', { name: searchButtonName }).click();
    await expect(page.getByRole('link', { name: /Gone Girl/i })).toBeVisible();
  });

  async function getAddToCartItems(page: Page) {
    const addButtons = page.getByRole('button', { name: addToCartName });
    if (await addButtons.count() > 0) {
      return addButtons;
    }
    return page.getByRole('link', { name: addToCartName });
  }

});
