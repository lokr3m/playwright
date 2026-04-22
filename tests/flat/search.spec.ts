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
    await expect(await getAddToCartControls()).toHaveCount(0);
  });

  test('Test search with keyword and results', async () => {
    await searchFor('tolkien');
    const addToCartControls = await getAddToCartControls();
    const resultCount = await addToCartControls.count();
    expect(resultCount).toBeGreaterThan(1);

    const keywordMatches = page.getByText(/tolkien/i);
    const keywordCount = await keywordMatches.count();
    expect(keywordCount).toBeGreaterThanOrEqual(resultCount);
  });

  test('Test search by ISBN shows correct book', async () => {
    await searchFor('9780307588371');
    await expect(page.getByText(/gone girl/i)).toBeVisible();
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
    const searchBox = await getSearchBox();
    await searchBox.fill(keyword);
    const searchButton = page.getByRole('button', { name: /search|otsi/i });
    if (await searchButton.count()) {
      await searchButton.first().click();
    } else {
      await searchBox.press('Enter');
    }
    await page.waitForLoadState('networkidle');
  }

  async function getSearchBox() {
    const byPlaceholder = page.getByPlaceholder(/pealkiri, autor, isbn/i);
    if (await byPlaceholder.count()) {
      return byPlaceholder.first();
    }
    return page.getByRole('textbox', { name: /pealkiri, autor, isbn/i }).first();
  }

  async function getAddToCartControls() {
    const buttons = page.getByRole('button', { name: /lisa ostukorvi/i });
    if (await buttons.count()) {
      return buttons;
    }
    return page.getByRole('link', { name: /lisa ostukorvi/i });
  }
});
