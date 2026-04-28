export const cartItemLinkExclusionPattern =
  /Ostukorv|Kriso|Jätka|Checkout|Eemalda|Remove|Kustuta|Tagasi|Back|Search/i;

export function uniqueTitles(titles: string[]) {
  const cleaned = titles.map((title) => title.trim()).filter(Boolean);
  return Array.from(new Set(cleaned));
}

export function parsePrice(text: string | null) {
  const cleaned = (text || '').replace(/[^0-9.,]+/g, '');
  if (!cleaned) {
    return 0;
  }

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  const separator = lastComma > lastDot ? ',' : lastDot > lastComma ? '.' : '';

  if (!separator) {
    return Number(cleaned.replace(/[.,]/g, '')) || 0;
  }

  const parts = cleaned.split(separator);
  const decimal = parts.pop() || '';
  const integer = parts.join('').replace(/[.,]/g, '');
  return Number(`${integer}.${decimal}`) || 0;
}
