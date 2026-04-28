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
import { test, expect, type Page, type BrowserContext, type Locator } from '@playwright/test';
import { cartLinkExclusionPattern, parsePrice } from '../../utils/cartSelectors';

test.describe.configure({ mode: 'serial' });

let context: BrowserContext;
let page: Page;
let cartTitles: string[] = [];
let cartTotalForTwo = 0;

test.describe('Add Books to Shopping Cart', () => {
  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto('/');
    await acceptCookiesIfPresent(page);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('Home page shows Kriso logo', async () => {
    await expect(page.getByRole('link', { name: /kriso/i })).toBeVisible();
  });

  test('Search for keyword shows multiple results', async () => {
    await searchFor(page, 'harry potter');
    const resultCount = await getProductCount(page);
    expect(resultCount).toBeGreaterThan(1);
  });

  test('Add one book to cart', async () => {
    await addToCartByIndex(page, 0);
    await expect(page.getByText(/Toode lisati ostukorvi|Added to cart/i)).toBeVisible();
    await expectCartCount(page, 1);
  });

  test('Add second book to cart', async () => {
    await addToCartByIndex(page, 1);
    await expect(page.getByText(/Toode lisati ostukorvi|Added to cart/i)).toBeVisible();
    await expectCartCount(page, 2);
  });

  test('Cart shows two items with accurate total', async () => {
    await openCart(page);
    await expect(page).toHaveURL(/cart|ostukorv/i);

    cartTitles = await getCartItemTitles(page);
    expect(cartTitles.length).toBe(2);

    const lineSum = await getCartLineTotal(page);
    cartTotalForTwo = await getCartTotal(page);
    expect(cartTotalForTwo).toBeCloseTo(lineSum, 2);
  });

  test('Remove the first item updates total', async () => {
    await removeCartItem(page, 0);

    const remainingTitles = await getCartItemTitles(page);
    expect(remainingTitles.length).toBe(1);
    expect(remainingTitles).not.toContain(cartTitles[0]);

    const newTotal = await getCartTotal(page);
    expect(newTotal).toBeLessThan(cartTotalForTwo);
  });
});

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

async function getProductCount(page: Page) {
  return await page.getByRole('link', { name: /Lisa ostukorvi|Add to cart/i }).count();
}

async function addToCartByIndex(page: Page, index: number) {
  await page.getByRole('link', { name: /Lisa ostukorvi|Add to cart/i }).nth(index).click();
}

async function expectCartCount(page: Page, expected: number) {
  const cartLink = page.getByRole('link', { name: /Ostukorv|Cart|Checkout/i });
  if (await cartLink.count()) {
    await expect(cartLink.getByText(String(expected))).toBeVisible();
    return;
  }

  const cartButton = page.getByRole('button', { name: /Ostukorv|Cart|Checkout/i });
  if (await cartButton.count()) {
    await expect(cartButton.getByText(String(expected))).toBeVisible();
  }
}

async function openCart(page: Page) {
  const cartLink = page.getByRole('link', { name: /Ostukorv|Cart|Checkout/i });
  if (await cartLink.count()) {
    await cartLink.first().click();
    return;
  }

  const cartButton = page.getByRole('button', { name: /Ostukorv|Cart|Checkout/i });
  if (await cartButton.count()) {
    await cartButton.first().click();
  }
}

async function getCartItemTitles(page: Page) {
  const listItems = page.getByRole('listitem');
  const listTitles = await getTitlesFromContainers(listItems);
  if (listTitles.length) {
    return listTitles;
  }

  const rowItems = page.getByRole('row');
  const rowTitles = await getTitlesFromContainers(rowItems);
  if (rowTitles.length) {
    return rowTitles;
  }

  const itemLinks = page.getByRole('link').filter({
    hasNotText: cartLinkExclusionPattern,
  });
  return uniqueTitles(await itemLinks.allTextContents());
}

async function getTitlesFromContainers(containers: Locator) {
  if ((await containers.count()) === 0) {
    return [];
  }

  return uniqueTitles(await containers.getByRole('link').allTextContents());
}

function uniqueTitles(titles: string[]) {
  const cleaned = titles.map((title) => title.trim()).filter(Boolean);
  return Array.from(new Set(cleaned));
}

async function getCartLineTotal(page: Page) {
  const priceTexts = await page
    .getByText(/€|EUR/i)
    .filter({ hasNotText: /Kokku|Total/i })
    .allTextContents();

  return priceTexts
    .map((text) => parsePrice(text))
    .filter((price) => price > 0)
    .reduce((sum, price) => sum + price, 0);
}

async function getCartTotal(page: Page) {
  const totalText = await page.getByText(/Kokku|Total/i).last().textContent();
  return parsePrice(totalText);
}

async function removeCartItem(page: Page, index: number) {
  await page.getByRole('button', { name: /Eemalda|Remove|Kustuta|×/i }).nth(index).click();
}
