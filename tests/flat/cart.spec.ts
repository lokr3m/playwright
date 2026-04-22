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
let firstItemTitle = '';
let secondItemTitle = '';
let basketSumOfTwo = 0;

test.describe('Add Books to Shopping Cart', () => {

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

  test('Test search by keyword', async () => {
    await searchFor('harry potter');
    const addToCartLinks = page.getByRole('link', { name: /lisa ostukorvi/i });
    const total = await addToCartLinks.count();
    expect(total).toBeGreaterThan(1);
  }); 

  test('Test add book to cart', async () => {
    [firstItemTitle, secondItemTitle] = await getFirstTwoTitles();
    expect(firstItemTitle).not.toEqual('');
    expect(secondItemTitle).not.toEqual('');
    await page.getByRole('link', { name: /lisa ostukorvi/i }).first().click();
    await expect(page.getByText(/toode lisati ostukorvi/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /ostukorv/i })).toContainText('1');
    await closeMiniCartIfPresent();
  }); 

  test('Test add second book to cart', async () => {
    await page.getByRole('link', { name: /lisa ostukorvi/i }).nth(1).click();
    await expect(page.getByText(/toode lisati ostukorvi/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /ostukorv/i })).toContainText('2');
  }); 

  test('Test cart count and sum is correct', async () => {
    await page.getByRole('link', { name: /ostukorv/i }).click();
    await expect(page.getByText(firstItemTitle)).toBeVisible();
    await expect(page.getByText(secondItemTitle)).toBeVisible();

    basketSumOfTwo = await returnBasketSum([firstItemTitle, secondItemTitle]);
    let basketSumTotal = await returnBasketSumTotal();
    expect(basketSumTotal).toBeCloseTo(basketSumOfTwo, 2);
  }); 


  test('Test remove item from cart and counter sum is correct', async () => {
    await removeItemFromCart(firstItemTitle);
    await expect(page.getByText(firstItemTitle)).toHaveCount(0);
    await expect(page.getByText(secondItemTitle)).toBeVisible();

    let basketSumOfOne = await returnBasketSum([secondItemTitle]);
    let basketSumTotal = await returnBasketSumTotal();

    expect(basketSumTotal).toBeCloseTo(basketSumOfOne, 2);
    expect(basketSumOfOne).toBeLessThan(basketSumOfTwo);
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

  async function closeMiniCartIfPresent() {
    const continueButton = page.getByRole('button', { name: /tagasi|jätka|continue/i });
    if (await continueButton.count()) {
      await continueButton.first().click();
      return;
    }

    const continueLink = page.getByRole('link', { name: /tagasi|jätka|continue/i });
    if (await continueLink.count()) {
      await continueLink.first().click();
    }
  }

  async function getFirstTwoTitles() {
    const resultsRegion = page.getByRole('main');
    const headings = resultsRegion.getByRole('heading');
    if (await headings.count() >= 2) {
      const first = (await headings.nth(0).textContent())?.trim() || '';
      const second = (await headings.nth(1).textContent())?.trim() || '';
      return [first, second];
    }

    const links = resultsRegion.getByRole('link').filter({ hasNotText: /lisa ostukorvi|search/i });
    const first = (await links.nth(0).textContent())?.trim() || '';
    const second = (await links.nth(1).textContent())?.trim() || '';
    return [first, second];
  }

  async function returnBasketSum(itemTitles: string[]) {
    let basketSum = 0;
    for (const title of itemTitles) {
      const rowText = await page.getByRole('row', { name: new RegExp(escapeRegExp(title), 'i') }).first().textContent();
      basketSum += extractPrice(rowText);
    }
    return basketSum;
  }

  async function returnBasketSumTotal() {
    const totalRow = page.getByRole('row', { name: /kokku|total/i }).first();
    const basketSumTotalText = await totalRow.textContent();
    return extractPrice(basketSumTotalText);
  }

  async function removeItemFromCart(title: string) {
    const row = page.getByRole('row', { name: new RegExp(escapeRegExp(title), 'i') }).first();
    const removeButton = row.getByRole('button', { name: /eemalda|remove/i });
    if (await removeButton.count()) {
      await removeButton.first().click();
      return;
    }

    const removeLink = row.getByRole('link', { name: /eemalda|remove/i });
    if (await removeLink.count()) {
      await removeLink.first().click();
    }
  }

  function extractPrice(text: string | null) {
    if (!text) {
      return 0;
    }
    const matches = text.match(/(\d+[.,]\d{2})/g);
    if (!matches || matches.length === 0) {
      return 0;
    }
    return Number(matches[matches.length - 1].replace(',', '.'));
  }

  function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

}); 
