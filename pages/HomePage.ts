import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly logoLink: Locator;
  readonly cookieAcceptButton: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(private page: Page) {
    this.logoLink = page.getByRole('link', { name: /kriso/i });
    this.cookieAcceptButton = page.getByRole('button', { name: /nõustun|nõustu|accept|ok/i });
    this.searchInput = page.getByPlaceholder(/pealkiri, autor, isbn|search/i);
    this.searchButton = page.getByRole('button', { name: /search|otsi/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async acceptCookiesIfPresent() {
    if (await this.cookieAcceptButton.first().isVisible().catch(() => false)) {
      await this.cookieAcceptButton.first().click();
    }
  }

  async searchFor(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
  }

  async scrollToSection(sectionText: RegExp) {
    const section = this.page.getByText(sectionText);
    await section.scrollIntoViewIfNeeded();
    return section;
  }

  async navigateToCategory(categoryText: RegExp) {
    await this.page.getByRole('link', { name: categoryText }).first().click();
  }
}
