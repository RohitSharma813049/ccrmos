export const EXCHANGE_RATES: Record<string, number> = {
  "USD": 1.0,
  "EUR": 0.92,
  "GBP": 0.79,
  "INR": 83.5,
  "AUD": 1.52,
  "CAD": 1.36,
  "AED": 3.67,
  "JPY": 154.2
};

/**
 * Converts an amount from one currency to another.
 * Defaults to USD if a currency is not found.
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1.0;
  const toRate = EXCHANGE_RATES[toCurrency] || 1.0;

  // Convert to USD first (base), then to target
  const amountInUSD = amount / fromRate;
  const finalAmount = amountInUSD * toRate;

  return Math.round(finalAmount * 100) / 100;
}

/**
 * Formats an amount using Intl.NumberFormat based on the currency.
 */
export function formatCurrency(amount: number, currency: string = "USD", locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}
