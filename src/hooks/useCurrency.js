import { useState } from 'react';

const STORAGE_KEY = 'nendoroid-currency';

export const CURRENCIES = [
  { code: 'THB', symbol: '฿' },
  { code: 'JPY', symbol: '¥' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
];

export function useCurrency() {
  const [currency, setCurrencyState] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? 'THB'
  );

  const setCurrency = (code) => {
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  };

  const symbol = CURRENCIES.find(c => c.code === currency)?.symbol ?? '฿';

  return { currency, symbol, setCurrency };
}
