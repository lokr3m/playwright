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
import { test, expect, type Page } from '@playwright/test';

test.describe('Search for Books by Keywords', () => {
  test('Home page shows Kriso logo', async ({ page }) => {
    await openHome(page);
    await expect(page.getByRole('link', { name: /kriso/i })).toBeVisible();
  });

  test('Search for gibberish keyword shows no results', async ({ page }) => {
    await openHome(page);
    await searchFor(page, 'xqzwmfkj');

    const addToCartButtons = page.getByRole('link', { name: /Lisa ostukorvi|Add to cart/i });
    expect(await addToCartButtons.count()).toBe(0);
  });

  test('Search for tolkien shows multiple keyword matches', async ({ page }) => {
    await openHome(page);
    await searchFor(page, 'tolkien');

    const addToCartButtons = page.getByRole('link', { name: /Lisa ostukorvi|Add to cart/i });
    const totalResults = await addToCartButtons.count();
    expect(totalResults).toBeGreaterThan(1);

    const keywordTitles = page.getByRole('link', { name: /tolkien/i });
    expect(await keywordTitles.count()).toBe(totalResults);
  });

  test('Search by ISBN shows Gone Girl', async ({ page }) => {
    await openHome(page);
    await searchFor(page, '9780307588371');
    await expect(page.getByRole('link', { name: /Gone Girl/i })).toBeVisible();
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

async function searchFor(page: Page, query: string) {
  const searchInput = page.getByPlaceholder(/Pealkiri|ISBN|märksõ/i);
  await searchInput.fill(query);
  await page.getByRole('button', { name: /Search|Otsi/i }).click();
}
