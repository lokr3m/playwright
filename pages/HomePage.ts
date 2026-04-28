import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly logo: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly acceptCookiesButton: Locator;
  readonly musicSection: Locator;
  readonly kitarrCategory: Locator;

  constructor(private page: Page) {
    this.logo = page.getByRole('link', { name: /kriso/i });
    this.searchInput = page.getByPlaceholder(/Pealkiri|ISBN|märksõ/i);
    this.searchButton = page.getByRole('button', { name: /Search|Otsi/i });
    this.acceptCookiesButton = page.getByRole('button', { name: /Nõustun|Accept/i });
    this.musicSection = page.getByText(/Muusikaraamatud ja noodid/i);
    this.kitarrCategory = page.getByRole('link', { name: /Kitarr/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async acceptCookiesIfPresent() {
    if (await this.acceptCookiesButton.first().isVisible().catch(() => false)) {
      await this.acceptCookiesButton.first().click();
    }
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  async openKitarrCategory() {
    await this.musicSection.scrollIntoViewIfNeeded();
    await this.kitarrCategory.click();
  }
}
