/**
 * Part I — Flat tests (no POM)
 * Test suite: Add Books to Shopping Cart
 *
 * Rules:
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 *   - No CSS class selectors, no XPath
 *
 * Tip: run `npx playwright codegen https://www.kriso.ee` to discover selectors.
 */
import { test, expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let page: Page;
let basketSumOfTwo = 0;
let firstItemTitle = '';
let secondItemTitle = '';

test.describe('Add Books to Shopping Cart', () => {

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto('/');

    await acceptCookiesIfPresent(page);
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('Test logo is visible', async () => {
    await expect(page.getByRole('link', { name: /kriso/i })).toBeVisible();
  }); 

  test('Test search by keyword', async () => {
    await searchFor(page, 'harry potter');

    const results = getProductCards(page);
    await expect(results.first()).toBeVisible();
    const total = await results.count();
    expect(total).toBeGreaterThan(1);
  }); 

  test('Test add book to cart', async () => {
    const results = getProductCards(page);
    firstItemTitle = await getProductTitle(results.first());
    await results.first().getByRole('link', { name: /lisa ostukorvi/i }).click();
    await expect(page.getByText(/toode lisati ostukorvi/i)).toBeVisible();
    await expect(getCartIndicator(page)).toContainText('1');
    await continueShopping(page);
  }); 

  test('Test add second book to cart', async () => {
    const results = getProductCards(page);
    secondItemTitle = await getProductTitle(results.nth(1));
    await results.nth(1).getByRole('link', { name: /lisa ostukorvi/i }).click();
    await expect(page.getByText(/toode lisati ostukorvi/i)).toBeVisible();
    await expect(getCartIndicator(page)).toContainText('2');
  }); 

  test('Test cart count and sum is correct', async () => {
    await openCart(page);
    await expect(page.getByText(firstItemTitle)).toBeVisible();
    await expect(page.getByText(secondItemTitle)).toBeVisible();

    basketSumOfTwo = await returnBasketSum(page);
    const basketSumTotal = await returnBasketSumTotal(page);

    expect(basketSumOfTwo).toBeGreaterThan(0);
    expect(basketSumTotal).toBeCloseTo(basketSumOfTwo, 2);
  }); 


  test('Test remove item from cart and counter sum is correct', async () => {
    await removeFirstItem(page);
    await expect(page.getByText(firstItemTitle)).toHaveCount(0);

    const basketSumOfOne = await returnBasketSum(page);
    const basketSumTotal = await returnBasketSumTotal(page);
    
    expect(basketSumTotal).toBeCloseTo(basketSumOfOne, 2);
    expect(basketSumOfOne).toBeLessThan(basketSumOfTwo);
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

const getProductTitle = async (card: Locator) => {
  const links = card.getByRole('link');
  const linkCount = await links.count();
  for (let i = 0; i < linkCount; i += 1) {
    const text = (await links.nth(i).innerText()).trim();
    if (!/lisa ostukorvi/i.test(text)) {
      return text;
    }
  }
  return '';
};

const getCartIndicator = (page: Page) => page.getByRole('link', { name: /ostukorv|cart/i });

const continueShopping = async (page: Page) => {
  const button = page.getByRole('button', { name: /jätka|continue|tagasi|back/i });
  if (await button.first().isVisible().catch(() => false)) {
    await button.first().click();
  }
};

const openCart = async (page: Page) => {
  const link = page.getByRole('link', { name: /ostukorv|cart/i });
  if (await link.first().isVisible().catch(() => false)) {
    await link.first().click();
    return;
  }
  const button = page.getByRole('button', { name: /ostukorv|cart/i });
  if (await button.first().isVisible().catch(() => false)) {
    await button.first().click();
  }
};

const removeFirstItem = async (page: Page) => {
  await page.getByRole('button', { name: /eemalda|remove|delete|kustuta/i }).first().click();
};

const returnBasketSum = async (page: Page) => {
  const rows = page.getByRole('row').filter({ hasText: /€|\bEUR\b/ });
  const count = await rows.count();
  let basketSum = 0;
  for (let i = 0; i < count; i += 1) {
    const rowText = await rows.nth(i).innerText();
    if (/kokku|total|summa/i.test(rowText)) {
      continue;
    }
    basketSum += parsePrice(rowText);
  }
  return basketSum;
};

const returnBasketSumTotal = async (page: Page) => {
  const totalRow = page.getByRole('row', { name: /kokku|total|summa/i });
  if (await totalRow.first().isVisible().catch(() => false)) {
    return parsePrice(await totalRow.first().textContent());
  }
  return parsePrice(await page.getByText(/kokku|total|summa/i).first().textContent());
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
