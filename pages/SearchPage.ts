import { Page, Locator } from '@playwright/test';

export class SearchPage {
  readonly results: Locator;
  readonly sortSelect: Locator;
  readonly addToCartLinks: Locator;
  readonly addedToCartMessage: Locator;
  readonly continueShoppingButton: Locator;
  readonly continueShoppingLink: Locator;

  constructor(private page: Page) {
    this.results = page
      .getByRole('listitem')
      .filter({ has: page.getByRole('link', { name: /lisa ostukorvi/i }) });
    this.sortSelect = page.getByRole('combobox', { name: /sorteeri|sort/i });
    this.addToCartLinks = page.getByRole('link', { name: /lisa ostukorvi/i });
    this.addedToCartMessage = page.getByText(/toode lisati ostukorvi/i);
    this.continueShoppingButton = page.getByRole('button', { name: /jätka|continue|tagasi|back/i });
    this.continueShoppingLink = page.getByRole('link', { name: /jätka|continue|tagasi|back/i });
  }

  async waitForResults() {
    await this.results.first().waitFor();
  }

  async getResultCount() {
    return this.results.count();
  }

  async getResultTexts() {
    const texts: string[] = [];
    const count = await this.results.count();
    for (let i = 0; i < count; i += 1) {
      const text = await this.results.nth(i).innerText();
      texts.push(text.trim());
    }
    return texts;
  }

  async getResultTitles() {
    const titles: string[] = [];
    const count = await this.results.count();
    for (let i = 0; i < count; i += 1) {
      const card = this.results.nth(i);
      const links = card.getByRole('link');
      const linkCount = await links.count();
      let title = '';
      for (let j = 0; j < linkCount; j += 1) {
        const linkText = (await links.nth(j).innerText()).trim();
        if (!/lisa ostukorvi/i.test(linkText)) {
          title = linkText;
          break;
        }
      }
      titles.push(title);
    }
    return titles;
  }

  async getResultPrices(limit = 3) {
    const prices: number[] = [];
    const count = await this.results.count();
    const max = Math.min(limit, count);
    for (let i = 0; i < max; i += 1) {
      const priceText = await this.results
        .nth(i)
        .getByText(/€|\bEUR\b/)
        .first()
        .textContent();
      prices.push(this.parsePrice(priceText));
    }
    return prices;
  }

  async sortByPrice() {
    if (!(await this.sortSelect.first().isVisible().catch(() => false))) {
      return;
    }

    const options = this.sortSelect.getByRole('option');
    const count = await options.count();
    let selectedLabel: string | null = null;
    for (let i = 0; i < count; i += 1) {
      const label = (await options.nth(i).textContent())?.trim();
      if (label && /hind|price/i.test(label)) {
        selectedLabel = label;
        if (/(kasv|asc|low|tõus|väiksem)/i.test(label)) {
          break;
        }
      }
    }

    if (selectedLabel) {
      await this.sortSelect.selectOption({ label: selectedLabel });
    }
  }

  async applyFilter(label: RegExp) {
    const checkbox = this.page.getByRole('checkbox', { name: label });
    if (await checkbox.first().isVisible().catch(() => false)) {
      await checkbox.first().check();
      return;
    }

    const link = this.page.getByRole('link', { name: label });
    if (await link.first().isVisible().catch(() => false)) {
      await link.first().click();
      return;
    }

    const button = this.page.getByRole('button', { name: label });
    if (await button.first().isVisible().catch(() => false)) {
      await button.first().click();
    }
  }

  async addToCart(index: number) {
    const card = this.results.nth(index);
    const title = await this.getCardTitle(card);
    await card.getByRole('link', { name: /lisa ostukorvi/i }).click();
    await this.addedToCartMessage.first().waitFor();
    return title;
  }

  async continueShopping() {
    if (await this.continueShoppingButton.first().isVisible().catch(() => false)) {
      await this.continueShoppingButton.first().click();
      return;
    }
    if (await this.continueShoppingLink.first().isVisible().catch(() => false)) {
      await this.continueShoppingLink.first().click();
    }
  }

  private async getCardTitle(card: Locator) {
    const links = card.getByRole('link');
    const linkCount = await links.count();
    for (let i = 0; i < linkCount; i += 1) {
      const linkText = (await links.nth(i).innerText()).trim();
      if (!/lisa ostukorvi/i.test(linkText)) {
        return linkText;
      }
    }
    return '';
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
