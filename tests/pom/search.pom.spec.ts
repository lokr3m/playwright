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

test.describe.configure({ mode: 'serial' });

test.describe('Search for Books by Keywords (POM)', () => {
  let context: BrowserContext;
  let page: Page;
  let home: HomePage;
  let search: SearchPage;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    home = new HomePage(page);
    search = new SearchPage(page);

    await home.goto();
    await home.acceptCookiesIfPresent();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('Home page shows Kriso logo', async () => {
    await expect(home.logo).toBeVisible();
  });

  test('Search for gibberish keyword shows no results', async () => {
    await home.goto();
    await home.search('xqzwmfkj');
    expect(await search.getResultCount()).toBe(0);
  });

  test('Search for tolkien shows multiple keyword matches', async () => {
    await home.goto();
    await home.search('tolkien');

    const totalResults = await search.getResultCount();
    expect(totalResults).toBeGreaterThan(1);

    const keywordCount = await search.getKeywordTitles('tolkien').count();
    expect(keywordCount).toBe(totalResults);
  });

  test('Search by ISBN shows Gone Girl', async () => {
    await home.goto();
    await home.search('9780307588371');
    await expect(search.getKeywordTitles('Gone Girl')).toBeVisible();
  });
});
