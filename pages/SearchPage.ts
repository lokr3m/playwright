import { Page, Locator, expect } from '@playwright/test';

export class SearchPage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly addToCartLinks: Locator;
  readonly addToCartMessage: Locator;
  readonly cartLink: Locator;
  readonly cartButton: Locator;
  readonly noResultsMessage: Locator;

  constructor(private page: Page) {
    this.searchInput = page.getByPlaceholder(/Pealkiri|ISBN|märksõ/i);
    this.searchButton = page.getByRole('button', { name: /Search|Otsi/i });
    this.addToCartLinks = page.getByRole('link', { name: /Lisa ostukorvi|Add to cart/i });
    this.addToCartMessage = page.getByText(/Toode lisati ostukorvi|Added to cart/i);
    this.cartLink = page.getByRole('link', { name: /Ostukorv|Cart|Checkout/i });
    this.cartButton = page.getByRole('button', { name: /Ostukorv|Cart|Checkout/i });
    this.noResultsMessage = page.getByText(/ei leitud|no results|no products/i);
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  async getResultCount() {
    return await this.addToCartLinks.count();
  }

  getKeywordTitles(keyword: string) {
    return this.page.getByRole('link', { name: new RegExp(keyword, 'i') });
  }

  async addToCartByIndex(index: number) {
    await this.addToCartLinks.nth(index).click();
  }

  async expectCartCount(expected: number) {
    if (await this.cartLink.count()) {
      await expect(this.cartLink.getByText(String(expected))).toBeVisible();
      return;
    }

    if (await this.cartButton.count()) {
      await expect(this.cartButton.getByText(String(expected))).toBeVisible();
    }
  }

  async openCart() {
    if (await this.cartLink.count()) {
      await this.cartLink.first().click();
      return;
    }

    if (await this.cartButton.count()) {
      await this.cartButton.first().click();
    }
  }

  getLanguageFilter(label: RegExp) {
    return this.page.getByLabel(label);
  }

  getFormatFilter(label: RegExp) {
    return this.page.getByLabel(label);
  }
}
