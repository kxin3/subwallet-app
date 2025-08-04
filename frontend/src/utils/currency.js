// frontend/src/utils/currency.js - Currency conversion utilities

// Exchange rates (typically you'd fetch these from an API)
// For demo purposes, using approximate rates as of 2024
const EXCHANGE_RATES = {
  USD: 1.0,        // Base currency
  EUR: 0.85,       // 1 USD = 0.85 EUR
  GBP: 0.73,       // 1 USD = 0.73 GBP
  AED: 3.67        // 1 USD = 3.67 AED
};

// Currency symbols and formatting
const CURRENCY_CONFIG = {
  USD: { symbol: '$', prefix: true, decimals: 2 },
  EUR: { symbol: '€', prefix: false, decimals: 2 },
  GBP: { symbol: '£', prefix: true, decimals: 2 },
  AED: { symbol: 'AED', prefix: true, decimals: 2 }
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} Converted amount
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (!amount || !fromCurrency || !toCurrency) return 0;
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first (base currency)
  const usdAmount = amount / EXCHANGE_RATES[fromCurrency];
  
  // Convert from USD to target currency
  const convertedAmount = usdAmount * EXCHANGE_RATES[toCurrency];
  
  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
};

/**
 * Format currency amount with proper symbol and positioning
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency) => {
  if (!amount && amount !== 0) return '';
  
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
  const formattedAmount = amount.toFixed(config.decimals);
  
  if (config.prefix) {
    return `${config.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount}${config.symbol}`;
  }
};

/**
 * Convert subscription amount to display currency
 * @param {object} subscription - Subscription object
 * @param {string} displayCurrency - Currency to display in
 * @returns {object} Subscription with converted amount and display currency
 */
export const convertSubscriptionCurrency = (subscription, displayCurrency) => {
  const convertedAmount = convertCurrency(
    subscription.amount,
    subscription.currency,
    displayCurrency
  );
  
  return {
    ...subscription,
    displayAmount: convertedAmount,
    displayCurrency: displayCurrency,
    originalAmount: subscription.amount,
    originalCurrency: subscription.currency
  };
};

/**
 * Convert array of subscriptions to display currency
 * @param {array} subscriptions - Array of subscription objects
 * @param {string} displayCurrency - Currency to display in
 * @returns {array} Array of subscriptions with converted amounts
 */
export const convertSubscriptionsCurrency = (subscriptions, displayCurrency) => {
  return subscriptions.map(subscription => 
    convertSubscriptionCurrency(subscription, displayCurrency)
  );
};

/**
 * Calculate total monthly cost in display currency
 * @param {array} subscriptions - Array of subscription objects
 * @param {string} displayCurrency - Currency to display in
 * @returns {number} Total monthly cost in display currency
 */
export const calculateTotalMonthlyCost = (subscriptions, displayCurrency) => {
  return subscriptions.reduce((total, subscription) => {
    const convertedAmount = convertCurrency(
      subscription.amount,
      subscription.currency,
      displayCurrency
    );
    return total + convertedAmount;
  }, 0);
};

/**
 * Get available currencies
 * @returns {array} Array of currency objects with code and name
 */
export const getAvailableCurrencies = () => [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' }
];

/**
 * Get currency symbol for a given currency code
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency) => {
  return CURRENCY_CONFIG[currency]?.symbol || currency;
};

/**
 * Update exchange rates (for future API integration)
 * @param {object} newRates - New exchange rates object
 */
export const updateExchangeRates = (newRates) => {
  Object.assign(EXCHANGE_RATES, newRates);
};

const currencyExport = {
  convertCurrency,
  formatCurrency,
  convertSubscriptionCurrency,
  convertSubscriptionsCurrency,
  calculateTotalMonthlyCost,
  getAvailableCurrencies,
  getCurrencySymbol,
  updateExchangeRates
};

export default currencyExport;