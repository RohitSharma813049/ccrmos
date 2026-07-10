/**
 * Formats a number as a localized currency string.
 * @param amount The number to format
 * @param currency The 3-letter currency code (e.g. USD, EUR, INR)
 * @param locale The locale to format the currency in (defaults to standard locale based on currency)
 */
export function formatCurrency(amount: number, currency: string = 'USD', locale?: string): string {
  try {
    // Attempt to guess locale if not provided
    const defaultLocale = locale || getDefaultLocaleForCurrency(currency) || 'en-US';
    return new Intl.NumberFormat(defaultLocale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch (error) {
    console.error("Currency formatting error:", error);
    return `${currency.toUpperCase()} ${amount}`;
  }
}

function getDefaultLocaleForCurrency(currency: string): string | undefined {
  const map: Record<string, string> = {
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'INR': 'en-IN',
    'JPY': 'ja-JP',
    'CNY': 'zh-CN',
    'AUD': 'en-AU',
    'CAD': 'en-CA',
    'CHF': 'de-CH',
  };
  return map[currency.toUpperCase()];
}
