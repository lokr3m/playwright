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

test.describe.configure({ mode: 'serial' });

let page: Page;

test.describe('Search for Books by Keywords', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto('https://www.kriso.ee/');
    await acceptCookiesIfPresent();
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('Test logo is visible', async () => {
    await expect(page.getByRole('link', { name: /kriso/i })).toBeVisible();
  });

  test('Test search with no results', async () => {
    await searchFor('xqzwmfkj');
    await expect(page.getByRole('link', { name: /lisa ostukorvi/i })).toHaveCount(0);
  });

  test('Test search with keyword and results', async () => {
    await searchFor('tolkien');
    const addToCartLinks = page.getByRole('link', { name: /lisa ostukorvi/i });
    const resultCount = await addToCartLinks.count();
    expect(resultCount).toBeGreaterThan(1);

    const keywordLinks = page.getByRole('link', { name: /tolkien/i });
    const keywordCount = await keywordLinks.count();
    expect(keywordCount).toBeGreaterThanOrEqual(resultCount);
  });

  test('Test search by ISBN shows correct book', async () => {
    await searchFor('9780307588371');
    await expect(page.getByRole('link', { name: /gone girl/i })).toBeVisible();
  });

  async function acceptCookiesIfPresent() {
    const acceptButton = page.getByRole('button', { name: /nõustun/i });
    try {
      await acceptButton.click({ timeout: 5000 });
    } catch {
      // Cookie banner not shown.
    }
  }

  async function searchFor(keyword: string) {
    const searchBox = page.getByRole('textbox', { name: /pealkiri, autor, isbn/i });
    await searchBox.fill(keyword);
    await page.getByRole('button', { name: /search/i }).click();
  }
});
