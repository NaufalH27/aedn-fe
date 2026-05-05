export const currencyList = ['IDR', 'MYR', 'SGD', 'USD', 'CNY'] as const;

export type CurrencyCode = typeof currencyList[number];

const currencyLocaleMap: Record<CurrencyCode, string> = {
  IDR: 'id-ID',
  MYR: 'ms-MY',
  SGD: 'en-SG',
  USD: 'en-US',
  CNY: 'zh-CN',
};

const currencyMeta: Record<
  CurrencyCode,
  { currency: string; minimumFractionDigits?: number }
> = {
  IDR: { currency: 'IDR', minimumFractionDigits: 0 },
  MYR: { currency: 'MYR', minimumFractionDigits: 2 },
  SGD: { currency: 'SGD', minimumFractionDigits: 2 },
  USD: { currency: 'USD', minimumFractionDigits: 2 },
  CNY: { currency: 'CNY', minimumFractionDigits: 2 },
};

export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode,
  options?: Intl.NumberFormatOptions
): string {
  const locale = currencyLocaleMap[currencyCode];
  const meta = currencyMeta[currencyCode];

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: meta.currency,
    minimumFractionDigits: meta.minimumFractionDigits,
    maximumFractionDigits: meta.minimumFractionDigits,
    ...options,
  }).format(amount);
}
