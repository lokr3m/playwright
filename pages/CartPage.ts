import { Page, Locator } from '@playwright/test';
import { cartLinkExclusionPattern, parsePrice } from '../utils/cartSelectors';

export class CartPage {
  readonly heading: Locator;
  readonly removeButtons: Locator;
  readonly priceTexts: Locator;
  readonly totalText: Locator;

  constructor(private page: Page) {
    this.heading = page.getByRole('heading', { name: /Ostukorv|Cart/i });
    this.removeButtons = page.getByRole('button', { name: /Eemalda|Remove|Kustuta|×/i });
    this.priceTexts = page.getByText(/€|EUR/i);
    this.totalText = page.getByText(/Kokku|Total/i);
  }

  async getItemTitles() {
    const listItems = this.page.getByRole('listitem');
    const listTitles = await this.getTitlesFromContainers(listItems);
    if (listTitles.length) {
      return listTitles;
    }

    const rowItems = this.page.getByRole('row');
    const rowTitles = await this.getTitlesFromContainers(rowItems);
    if (rowTitles.length) {
      return rowTitles;
    }

    const fallbackLinks = this.page.getByRole('link').filter({
      hasNotText: cartLinkExclusionPattern,
    });

    return this.uniqueTitles(await fallbackLinks.allTextContents());
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
      .map((text) => parsePrice(text))
      .filter((price) => price > 0)
      .reduce((sum, price) => sum + price, 0);
  }

  async getTotal() {
    const totalText = await this.totalText.last().textContent();
    return parsePrice(totalText);
  }

  async removeItemByIndex(index: number) {
    await this.removeButtons.nth(index).click();
  }

  private async getTitlesFromContainers(containers: Locator) {
    if ((await containers.count()) === 0) {
      return [];
    }

    const titles = await containers.getByRole('link').allTextContents();
    return this.uniqueTitles(titles);
  }

  private uniqueTitles(titles: string[]) {
    const cleaned = titles.map((title) => title.trim()).filter(Boolean);
    return Array.from(new Set(cleaned));
  }

}
