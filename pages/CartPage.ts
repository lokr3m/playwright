import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly cartLink: Locator;
  readonly cartButton: Locator;
  readonly removeButtons: Locator;

  constructor(private page: Page) {
    this.cartLink = page.getByRole('link', { name: /ostukorv|cart/i });
    this.cartButton = page.getByRole('button', { name: /ostukorv|cart/i });
    this.removeButtons = page.getByRole('button', { name: /eemalda|remove|delete|kustuta/i });
  }

  async open() {
    if (await this.cartLink.first().isVisible().catch(() => false)) {
      await this.cartLink.first().click();
      return;
    }
    if (await this.cartButton.first().isVisible().catch(() => false)) {
      await this.cartButton.first().click();
    }
  }

  async getItemTitles() {
    const titles: string[] = [];
    const rows = await this.getItemRows();
    const count = await rows.count();
    for (let i = 0; i < count; i += 1) {
      const row = rows.nth(i);
      const links = row.getByRole('link');
      if (await links.count()) {
        const title = (await links.first().innerText()).trim();
        if (title) {
          titles.push(title);
          continue;
        }
      }
      const rowText = (await row.innerText()).trim();
      if (rowText) {
        titles.push(rowText);
      }
    }
    return titles;
  }

  async getItemPrices() {
    const rows = await this.getItemRows();
    const count = await rows.count();
    const prices: number[] = [];
    for (let i = 0; i < count; i += 1) {
      const rowText = await rows.nth(i).innerText();
      if (/kokku|total|summa/i.test(rowText)) {
        continue;
      }
      const price = this.parsePrice(rowText);
      if (price) {
        prices.push(price);
      }
    }
    return prices;
  }

  async getTotal() {
    const totalRow = this.page.getByRole('row', { name: /kokku|total|summa/i });
    if (await totalRow.first().isVisible().catch(() => false)) {
      const totalText = await totalRow.first().textContent();
      return this.parsePrice(totalText);
    }
    const totalText = await this.page.getByText(/kokku|total|summa/i).first().textContent();
    return this.parsePrice(totalText);
  }

  async getItemCount() {
    const rows = await this.getItemRows();
    const count = await rows.count();
    let itemCount = 0;
    for (let i = 0; i < count; i += 1) {
      const rowText = await rows.nth(i).innerText();
      if (/kokku|total|summa/i.test(rowText)) {
        continue;
      }
      itemCount += 1;
    }
    return itemCount;
  }

  async removeItem(index: number) {
    await this.removeButtons.nth(index).click();
  }

  private async getItemRows() {
    return this.page.getByRole('row').filter({ hasText: /€|\bEUR\b/ });
  }

  private parsePrice(text: string | null) {
    if (!text) {
      return 0;
    }
    const match = text.match(/(\d+[.,]\d{2})/);
    if (match) {
      return Number(match[1].replace(',', '.'));
    }
    const cleaned = text.replace(/[^0-9,.\-]/g, '').replace(',', '.');
    return Number(cleaned) || 0;
  }
}
