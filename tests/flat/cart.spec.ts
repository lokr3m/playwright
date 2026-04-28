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
import type { Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let page: Page;
let cartTitles: string[] = [];
let cartTotalBeforeRemoval = 0;

const baseUrl = 'https://www.kriso.ee/';
const searchPlaceholder = /Pealkiri, autor, ISBN/i;
const searchButtonName = /Search|Otsi/i;
const addToCartName = /Lisa ostukorvi/i;

test.describe('Add Books to Shopping Cart', () => {

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto(baseUrl);

    const consent = page.getByRole('button', { name: /Nõustun|Accept/i });
    if (await consent.isVisible()) {
      await consent.click();
    }
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('Test logo is visible', async () => {
    await expect(page.getByRole('link', { name: /kriso/i })).toBeVisible();
  }); 

  test('Test search by keyword', async () => {
    await page.getByPlaceholder(searchPlaceholder).fill('harry potter');
    await page.getByRole('button', { name: searchButtonName }).click();

    const addButtons = await getAddToCartItems();
    const addButtonCount = await addButtons.count();
    expect(addButtonCount).toBeGreaterThan(1);
  }); 

  test('Test add book to cart', async () => {
    await (await getAddToCartItems()).first().click();
    await expect(page.getByText(/Toode lisati ostukorvi/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Ostukorv/i })).toContainText('1');

    const continueShopping = page.getByRole('button', { name: /Jätka ostlemist|Tagasi|Continue/i });
    if (await continueShopping.isVisible()) {
      await continueShopping.click();
    }
  }); 

  test('Test add second book to cart', async () => {
    await (await getAddToCartItems()).last().click();
    await expect(page.getByText(/Toode lisati ostukorvi/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Ostukorv/i })).toContainText('2');
  }); 

  test('Test cart count and sum is correct', async () => {
    await page.getByRole('link', { name: /Ostukorv/i }).click();
    await expect(page.getByRole('heading', { name: /Ostukorv/i })).toBeVisible();

    cartTitles = await getCartItemTitles();
    expect(cartTitles.length).toBe(2);

    const cartSum = await getCartItemsTotal();
    cartTotalBeforeRemoval = await getCartTotal();

    expect(cartTotalBeforeRemoval).toBeCloseTo(cartSum, 2);
  }); 


  test('Test remove item from cart and counter sum is correct', async () => {
    await page.getByRole('button', { name: /Eemalda|Remove|Kustuta|Delete/i }).first().click();
    await expect(page.getByRole('heading', { name: /Ostukorv/i })).toBeVisible();

    const remainingTitles = await getCartItemTitles();
    expect(remainingTitles.length).toBe(1);
    await expect(page.getByRole('link', { name: cartTitles[0] })).toHaveCount(0);

    const remainingSum = await getCartItemsTotal();
    const remainingTotal = await getCartTotal();

    expect(remainingTotal).toBeCloseTo(remainingSum, 2);
    expect(remainingTotal).toBeLessThan(cartTotalBeforeRemoval);
  });

  async function getCartItemTitles() {
    const rows = page.getByRole('row').filter({ has: page.getByText(/€/) });
    const titles: string[] = [];
    for (let i = 0; i < await rows.count(); i += 1) {
      const title = await rows.nth(i).getByRole('link').first().textContent();
      if (title) {
        titles.push(title.trim());
      }
    }
    return titles;
  }

  async function getCartItemsTotal() {
    const rows = page.getByRole('row').filter({ has: page.getByText(/€/) });
    let sum = 0;
    for (let i = 0; i < await rows.count(); i += 1) {
      const priceTexts = await rows.nth(i).getByText(/€|EUR/).allTextContents();
      const lastPrice = priceTexts[priceTexts.length - 1];
      sum += parsePrice(lastPrice);
    }
    return sum;
  }

  async function getCartTotal() {
    const totalRow = page.getByRole('row', { name: /Kokku|Total/i });
    if (await totalRow.count()) {
      const priceTexts = await totalRow.first().getByText(/€|EUR/).allTextContents();
      const lastPrice = priceTexts[priceTexts.length - 1];
      return parsePrice(lastPrice);
    }

    const totals = await page.getByText(/€|EUR/).allTextContents();
    return parsePrice(totals[totals.length - 1]);
  }

  async function getAddToCartItems() {
    const addButtons = page.getByRole('button', { name: addToCartName });
    if (await addButtons.count() > 0) {
      return addButtons;
    }
    return page.getByRole('link', { name: addToCartName });
  }

  function parsePrice(text?: string | null) {
    if (!text) {
      return 0;
    }
    const currencyMatch = text.match(/([\d,.]+)\s*(?:€|EUR)|(?:€|EUR)\s*([\d,.]+)/);
    if (!currencyMatch) {
      return 0;
    }
    const rawValue = currencyMatch[1] || currencyMatch[2];
    const normalized = normalizeNumber(rawValue);
    return Number(normalized);
  }

  function normalizeNumber(value: string) {
    if (value.includes(',') && value.includes('.')) {
      const lastComma = value.lastIndexOf(',');
      const lastDot = value.lastIndexOf('.');
      if (lastComma > lastDot) {
        return value.replace(/\./g, '').replace(',', '.');
      }
      return value.replace(/,/g, '');
    }
    return value.replace(',', '.');
  }

}); 
