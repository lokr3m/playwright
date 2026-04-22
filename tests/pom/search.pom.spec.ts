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

test.describe('Search for Books by Keywords (POM)', () => {

  test('search, sort, and filter results', async ({ home, search }) => {
    await home.goto();
    await home.acceptCookiesIfPresent();
    await expect(home.logoLink).toBeVisible();

    await home.searchFor('harry potter');
    await search.waitForResults();

    const initialCount = await search.getResultCount();
    expect(initialCount).toBeGreaterThan(1);

    const resultTexts = await search.getResultTexts();
    resultTexts.forEach((text) => expect(text.toLowerCase()).toContain('harry potter'));

    await search.sortByPrice();
    const prices = await search.getResultPrices(3);
    const isAscending = prices.every((price, index) => index === 0 || price >= prices[index - 1]);
    const isDescending = prices.every((price, index) => index === 0 || price <= prices[index - 1]);
    expect(isAscending || isDescending).toBeTruthy();

    await search.applyFilter(/english|inglise/i);
    const languageTexts = await search.getResultTexts();
    languageTexts.forEach((text) => expect(text.toLowerCase()).toMatch(/english|inglise/));

    await search.applyFilter(/kõvakaaneline|hardback|hardcover/i);
    const formatTexts = await search.getResultTexts();
    formatTexts.forEach((text) => expect(text.toLowerCase()).toMatch(/kõvakaaneline|hardback|hardcover/));
  });

});
