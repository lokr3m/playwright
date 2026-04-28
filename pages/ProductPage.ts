import { Page, Locator } from '@playwright/test';

export class ProductPage {
  readonly addToCartButton: Locator;
  readonly title: Locator;

  constructor(private page: Page) {
    this.addToCartButton = page.getByRole('button', { name: /Lisa ostukorvi|Add to cart/i });
    this.title = page.getByRole('heading');
  }

  async addToCart() {
    await this.addToCartButton.click();
  }
}
