/**
 * Part II — Page Object Model tests
 * Test suite: Navigate Products via Filters
 *
 * Rules:
 *   - No raw selectors in test files — all locators live in page classes
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 */
import { test } from '../fixtures';
import { expect } from '@playwright/test';

test.describe('Navigate Products via Filters (POM)', () => {

  test('navigate categories and apply filters', async ({ home, search }) => {
    await home.goto();
    await home.acceptCookiesIfPresent();
    await expect(home.logoLink).toBeVisible();

    const section = await home.scrollToSection(/muusikaraamatud ja noodid/i);
    await expect(section).toBeVisible();

    await home.navigateToCategory(/õppematerjalid/i);
    await expect(search.results.first()).toBeVisible();

    const initialCount = await search.getResultCount();
    expect(initialCount).toBeGreaterThan(1);

    await search.applyFilter(/bänd ja ansambel/i);
    await expect(search.results.first()).toBeVisible();
    const bandCount = await search.getResultCount();
    expect(bandCount).toBeLessThanOrEqual(initialCount);

    await search.applyFilter(/cd/i);
    await expect(search.results.first()).toBeVisible();
    const cdCount = await search.getResultCount();
    expect(cdCount).toBeLessThanOrEqual(bandCount);
  });

});
