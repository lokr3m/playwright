/**
 * Part II — Page Object Model tests
 * Test suite: Search for Books by Keywords
 *
 * Rules:
 *   - No raw selectors in test files — all locators live in page classes
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 */
import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { SearchPage } from '../../pages/SearchPage';
import { CartPage } from '../../pages/CartPage';

test.describe.configure({ mode: 'serial' });

test.describe('Add Books to Shopping Cart (POM)', () => {
  let context: BrowserContext;
  let page: Page;
  let home: HomePage;
  let search: SearchPage;
  let cart: CartPage;
  let cartTitles: string[] = [];
  let cartTotalForTwo = 0;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    home = new HomePage(page);
    search = new SearchPage(page);
    cart = new CartPage(page);

    await home.goto();
    await home.acceptCookiesIfPresent();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('Home page shows Kriso logo', async () => {
    await expect(home.logo).toBeVisible();
  });

  test('Search for keyword shows multiple results', async () => {
    await home.search('harry potter');
    const resultCount = await search.getResultCount();
    expect(resultCount).toBeGreaterThan(1);
  });

  test('Add one book to cart', async () => {
    await search.addToCartByIndex(0);
    await expect(search.addToCartMessage).toBeVisible();
    await search.expectCartCount(1);
  });

  test('Add second book to cart', async () => {
    await search.addToCartByIndex(1);
    await expect(search.addToCartMessage).toBeVisible();
    await search.expectCartCount(2);
  });

  test('Cart shows two items with accurate total', async () => {
    await search.openCart();
    await expect(cart.heading).toBeVisible();

    cartTitles = await cart.getItemTitles();
    expect(cartTitles.length).toBe(2);

    const lineSum = await cart.getLineItemTotal();
    cartTotalForTwo = await cart.getTotal();
    expect(cartTotalForTwo).toBeCloseTo(lineSum, 2);
  });

  test('Remove the first item updates total', async () => {
    await cart.removeItemByIndex(0);

    const remainingTitles = await cart.getItemTitles();
    expect(remainingTitles.length).toBe(1);
    expect(remainingTitles).not.toContain(cartTitles[0]);

    const newTotal = await cart.getTotal();
    expect(newTotal).toBeLessThan(cartTotalForTwo);
  });
});
