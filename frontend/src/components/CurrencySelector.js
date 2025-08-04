// frontend/src/components/CurrencySelector.js - Currency selection component
import React from 'react';
import { DollarSign } from 'lucide-react';
import { getAvailableCurrencies } from '../utils/currency';

const CurrencySelector = ({ selectedCurrency, onCurrencyChange, className = '' }) => {
  const currencies = getAvailableCurrencies();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <DollarSign className="h-4 w-4 text-gray-500" />
      <span className="text-sm text-gray-600 whitespace-nowrap">Display in:</span>
      <select
        value={selectedCurrency}
        onChange={(e) => onCurrencyChange(e.target.value)}
        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-0"
      >
        {currencies.map(currency => (
          <option key={currency.code} value={currency.code}>
            {currency.code} ({currency.symbol})
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;