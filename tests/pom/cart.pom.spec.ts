/**
 * Part II — Page Object Model tests
 * Test suite: Search for Books by Keywords
 *
 * Rules:
 *   - No raw selectors in test files — all locators live in page classes
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 */
import { test } from '../fixtures';
import { expect } from '@playwright/test';

test.describe('Add Books to Shopping Cart (POM)', () => {

  test('add and remove items from cart', async ({ home, search, cart }) => {
    await home.goto();
    await home.acceptCookiesIfPresent();
    await expect(home.logoLink).toBeVisible();

    await home.searchFor('harry potter');
    await search.waitForResults();

    const firstTitle = await search.addToCart(0);
    await search.continueShopping();
    const secondTitle = await search.addToCart(1);

    await cart.open();

    const titles = await cart.getItemTitles();
    expect(titles).toEqual(expect.arrayContaining([firstTitle, secondTitle]));

    const itemPrices = await cart.getItemPrices();
    expect(itemPrices.length).toBeGreaterThanOrEqual(2);
    const total = await cart.getTotal();
    const sum = itemPrices.reduce((acc, price) => acc + price, 0);
    expect(total).toBeCloseTo(sum, 2);

    await cart.removeItem(0);
    const remainingCount = await cart.getItemCount();
    expect(remainingCount).toBe(1);

    const newTotal = await cart.getTotal();
    expect(newTotal).toBeLessThan(total);
  });

});
