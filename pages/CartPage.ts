import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly heading: Locator;
  readonly removeButtons: Locator;
  readonly priceTexts: Locator;
  readonly totalText: Locator;
  readonly itemLinks: Locator;

  constructor(private page: Page) {
    this.heading = page.getByRole('heading', { name: /Ostukorv|Cart/i });
    this.removeButtons = page.getByRole('button', { name: /Eemalda|Remove|Kustuta|×/i });
    this.priceTexts = page.getByText(/€|EUR/i);
    this.totalText = page.getByText(/Kokku|Total/i);
    this.itemLinks = page.getByRole('link').filter({
      hasNotText: /Ostukorv|Kriso|Jätka|Checkout|Eemalda|Remove|Kustuta|Tagasi|Back|Search/i,
    });
  }

  async getItemTitles() {
    const titles = (await this.itemLinks.allTextContents()).map((title) => title.trim()).filter(Boolean);
    return Array.from(new Set(titles));
  }

  async getItemCount() {
    const removeCount = await this.removeButtons.count();
    if (removeCount > 0) {
      return removeCount;
    }

    return (await this.getItemTitles()).length;
  }

  async getLineItemTotal() {
    const priceTexts = await this.priceTexts
      .filter({ hasNotText: /Kokku|Total/i })
      .allTextContents();

    return priceTexts
      .map((text) => this.parsePrice(text))
      .filter((price) => price > 0)
      .reduce((sum, price) => sum + price, 0);
  }

  async getTotal() {
    const totalText = await this.totalText.last().textContent();
    return this.parsePrice(totalText);
  }

  async removeItemByIndex(index: number) {
    await this.removeButtons.nth(index).click();
  }

  private parsePrice(text: string | null) {
    return Number((text || '').replace(/[^0-9.,]+/g, '').replace(',', '.')) || 0;
  }
}
