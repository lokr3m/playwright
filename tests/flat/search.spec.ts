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

  test('search, sort, and filter results', async ({ page }) => {
    await page.goto('/');
    await acceptCookiesIfPresent(page);
    await expect(page).toHaveTitle(/kriso/i);

    await searchFor(page, 'harry potter');
    const results = getProductCards(page);
    await expect(results.first()).toBeVisible();

    const initialCount = await results.count();
    expect(initialCount).toBeGreaterThan(1);

    for (let i = 0; i < initialCount; i += 1) {
      await expect(results.nth(i)).toContainText(/harry potter/i);
    }

    await sortByPrice(page);
    const prices = await getProductPrices(results, 3);
    const isAscending = prices.every((price, index) => index === 0 || price >= prices[index - 1]);
    const isDescending = prices.every((price, index) => index === 0 || price <= prices[index - 1]);
    expect(isAscending || isDescending).toBeTruthy();

    await applyFilter(page, /english|inglise/i);
    const languageCount = await results.count();
    expect(languageCount).toBeLessThanOrEqual(initialCount);

    for (let i = 0; i < languageCount; i += 1) {
      await expect(results.nth(i)).toContainText(/english|inglise/i);
    }

    await applyFilter(page, /kõvakaaneline|hardback|hardcover/i);
    const formatCount = await results.count();
    expect(formatCount).toBeLessThanOrEqual(languageCount);

    for (let i = 0; i < formatCount; i += 1) {
      await expect(results.nth(i)).toContainText(/kõvakaaneline|hardback|hardcover/i);
    }
  });

});

const acceptCookiesIfPresent = async (page: Page) => {
  const consent = page.getByRole('button', { name: /nõustun|nõustu|accept|ok/i });
  if (await consent.first().isVisible().catch(() => false)) {
    await consent.first().click();
  }
};

const searchFor = async (page: Page, keyword: string) => {
  await page.getByPlaceholder(/pealkiri, autor, isbn|search/i).fill(keyword);
  await page.getByRole('button', { name: /search|otsi/i }).click();
};

const getProductCards = (page: Page) =>
  page.getByRole('listitem').filter({ has: page.getByRole('link', { name: /lisa ostukorvi/i }) });

const sortByPrice = async (page: Page) => {
  const sortSelect = page.getByRole('combobox', { name: /sorteeri|sort/i });
  await expect(sortSelect).toBeVisible();
  const options = sortSelect.getByRole('option');
  const count = await options.count();
  let selectedLabel: string | null = null;
  for (let i = 0; i < count; i += 1) {
    const label = (await options.nth(i).textContent())?.trim();
    if (label && /hind|price/i.test(label)) {
      selectedLabel = label;
      if (/(kasv|asc|low|tõus|väiksem)/i.test(label)) {
        break;
      }
    }
  }
  if (selectedLabel) {
    await sortSelect.selectOption({ label: selectedLabel });
  }
};

const applyFilter = async (page: Page, label: RegExp) => {
  const checkbox = page.getByRole('checkbox', { name: label });
  if (await checkbox.first().isVisible().catch(() => false)) {
    await checkbox.first().check();
    return;
  }
  const link = page.getByRole('link', { name: label });
  if (await link.first().isVisible().catch(() => false)) {
    await link.first().click();
    return;
  }
  const button = page.getByRole('button', { name: label });
  if (await button.first().isVisible().catch(() => false)) {
    await button.first().click();
  }
};

const getProductPrices = async (results: ReturnType<typeof getProductCards>, limit: number) => {
  const prices: number[] = [];
  const count = await results.count();
  const max = Math.min(limit, count);
  for (let i = 0; i < max; i += 1) {
    const text = await results.nth(i).getByText(/€|\bEUR\b/).first().textContent();
    prices.push(parsePrice(text));
  }
  return prices;
};

const parsePrice = (text: string | null) => {
  if (!text) {
    return 0;
  }
  const match = text.match(/(\d+[.,]\d{2})/);
  if (match) {
    return Number(match[1].replace(',', '.'));
  }
  const cleaned = text.replace(/[^0-9,.\-]/g, '').replace(',', '.');
  return Number(cleaned) || 0;
};
