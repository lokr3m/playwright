import { Page, Locator } from '@playwright/test';

export class ProductPage {
  readonly addToCartLinks: Locator;
  readonly addedToCartMessage: Locator;

  constructor(private page: Page) {
    this.addToCartLinks = page.getByRole('link', { name: /lisa ostukorvi/i });
    this.addedToCartMessage = page.getByText(/toode lisati ostukorvi/i);
  }

  async addFirstToCart() {
    await this.addToCartLinks.first().click();
    await this.addedToCartMessage.first().waitFor();
  }
}
