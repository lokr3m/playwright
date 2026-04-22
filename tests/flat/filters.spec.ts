/**
 * Part I — Flat tests (no POM)
 * Test suite: Navigate Products via Filters
 *
 * Rules:
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 *   - No CSS class selectors, no XPath
 *
 * Tip: run `npx playwright codegen https://www.kriso.ee` to discover selectors.
 */
import { test, expect, type Page } from '@playwright/test';

test.describe('Navigate Products via Filters', () => {

  test('navigate categories and apply filters', async ({ page }) => {
    await page.goto('/');
    await acceptCookiesIfPresent(page);
    await expect(page).toHaveTitle(/kriso/i);

    const section = page.getByText(/muusikaraamatud ja noodid/i);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    await page.getByRole('link', { name: /õppematerjalid/i }).first().click();
    await expect(page.getByText(/õppematerjalid/i)).toBeVisible();

    const results = getProductCards(page);
    await expect(results.first()).toBeVisible();
    const initialCount = await results.count();
    expect(initialCount).toBeGreaterThan(1);

    await applyFilter(page, /bänd ja ansambel/i);
    await expect(page.getByText(/bänd ja ansambel/i)).toBeVisible();

    const bandCount = await results.count();
    expect(bandCount).toBeLessThanOrEqual(initialCount);

    await applyFilter(page, /cd/i);
    await expect(page.getByText(/cd/i)).toBeVisible();

    const cdCount = await results.count();
    expect(cdCount).toBeLessThanOrEqual(bandCount);
  });

});

const acceptCookiesIfPresent = async (page: Page) => {
  const consent = page.getByRole('button', { name: /nõustun|nõustu|accept|ok/i });
  if (await consent.first().isVisible().catch(() => false)) {
    await consent.first().click();
  }
};

const getProductCards = (page: Page) =>
  page.getByRole('listitem').filter({ has: page.getByRole('link', { name: /lisa ostukorvi/i }) });

const applyFilter = async (page: Page, label: RegExp) => {
  const checkbox = page.getByRole('checkbox', { name: label });
  if (await checkbox.first().isVisible().catch(() => false)) {
    await checkbox.first().check();
    return;
  }
  const link = page.getByRole('link', { name: label });
  if (await link.first().isVisible().catch(() => false)) {
    await link.first().click();
    return;
  }
  const button = page.getByRole('button', { name: label });
  if (await button.first().isVisible().catch(() => false)) {
    await button.first().click();
  }
};
