/**
 * Part II — Page Object Model tests
 * Test suite: Navigate Products via Filters
 *
 * Rules:
 *   - No raw selectors in test files — all locators live in page classes
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 */
import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { SearchPage } from '../../pages/SearchPage';

test.describe.configure({ mode: 'serial' });

test.describe('Navigate Products via Filters (POM)', () => {
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

  test('Navigate via categories and filters', async () => {
    await home.openKitarrCategory();
    await expect(page).toHaveURL(/kitarr/i);

    const initialCount = await search.getResultCount();
    expect(initialCount).toBeGreaterThan(1);

    const languageFilter = search.getFilter(/English|Inglise/i);
    await languageFilter.check();
    await expect(languageFilter).toBeChecked();

    const languageCount = await search.getResultCount();
    expect(languageCount).toBeLessThan(initialCount);

    const formatFilter = search.getFilter(/CD/i);
    await formatFilter.check();
    await expect(formatFilter).toBeChecked();

    const formatCount = await search.getResultCount();
    expect(formatCount).toBeLessThan(languageCount);

    await formatFilter.uncheck();
    await languageFilter.uncheck();

    const clearedCount = await search.getResultCount();
    expect(clearedCount).toBeGreaterThan(formatCount);
  });
});
