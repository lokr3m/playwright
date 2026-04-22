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
import { test, expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let page: Page;

test.describe('Navigate Products via Filters', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await page.goto('https://www.kriso.ee/');
    await acceptCookiesIfPresent();
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('Test filters navigation', async () => {
    await expect(page.getByRole('link', { name: /kriso/i })).toBeVisible();

    const musicSection = await getMusicSection();
    await musicSection.scrollIntoViewIfNeeded();
    await expect(musicSection).toBeVisible();

    await page.getByRole('link', { name: /kitarr/i }).first().click();
    await expect(page).toHaveURL(/kitarr/i);

    const addToCartControls = await getAddToCartControls();
    const initialCount = await addToCartControls.count();
    expect(initialCount).toBeGreaterThan(1);

    const languageFilter = await findFilterOption(/english|inglise/i);
    await clickFilterOption(languageFilter);
    await expect.poll(async () => (await getAddToCartControls()).count()).toBeLessThan(initialCount);
    await expect(page.getByText(/english|inglise/i)).toBeVisible();

    const formatFilter = await findFilterOption(/cd/i);
    const countAfterLanguage = await (await getAddToCartControls()).count();
    await clickFilterOption(formatFilter);
    await expect.poll(async () => (await getAddToCartControls()).count()).toBeLessThan(countAfterLanguage);
    await expect(page.getByText(/cd/i)).toBeVisible();

    await clickFilterOption(formatFilter);
    await clickFilterOption(languageFilter);
    await expect.poll(async () => (await getAddToCartControls()).count()).toBeGreaterThan(initialCount - 1);
  });

  async function acceptCookiesIfPresent() {
    const acceptButton = page.getByRole('button', { name: /nõustun/i });
    try {
      await acceptButton.click({ timeout: 5000 });
    } catch {
      // Cookie banner not shown.
    }
  }

  async function findFilterOption(name: RegExp) {
    const byLabel = page.getByLabel(name);
    if (await byLabel.count()) {
      return byLabel.first();
    }

    const byCheckbox = page.getByRole('checkbox', { name });
    if (await byCheckbox.count()) {
      return byCheckbox.first();
    }

    return page.getByText(name).first();
  }

  async function clickFilterOption(option: Locator) {
    if (await option.isChecked().catch(() => false)) {
      await option.uncheck().catch(async () => option.click());
      await page.waitForLoadState('networkidle');
      return;
    }

    await option.check().catch(async () => option.click());
    await page.waitForLoadState('networkidle');
  }

  async function getMusicSection() {
    const candidates = [
      /Muusikaraamatud/i,
      /Muusika.*noodid/i,
      /Muusika/i
    ];
    for (const candidate of candidates) {
      const section = page.getByText(candidate);
      if (await section.count()) {
        return section.first();
      }
    }
    return page.getByText(/Muusika/i).first();
  }

  async function getAddToCartControls() {
    const buttons = page.getByRole('button', { name: /lisa ostukorvi/i });
    if (await buttons.count()) {
      return buttons;
    }
    return page.getByRole('link', { name: /lisa ostukorvi/i });
  }
});
