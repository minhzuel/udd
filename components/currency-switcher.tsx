'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/app/contexts/CurrencyContext';

// Color map for currency backgrounds
const currencyColors: Record<string, string> = {
  USD: 'bg-green-500 hover:bg-green-600',
  EUR: 'bg-blue-500 hover:bg-blue-600',
  GBP: 'bg-purple-500 hover:bg-purple-600',
  BDT: 'bg-red-500 hover:bg-red-600',
  JPY: 'bg-yellow-500 hover:bg-yellow-600',
  // Add more currencies as needed
};

// Default color for currencies not in the map
const defaultColor = 'bg-gray-500 hover:bg-gray-600';

export function CurrencySwitcher() {
  const { currency, currencies, setCurrency, loading } = useCurrency();

  // If currencies are still loading or there's only one currency, don't show the switcher
  if (loading || currencies.length <= 1) {
    return null;
  }

  return (
    <div className="flex rounded-full overflow-hidden shadow-md p-0.5 bg-background">
      {currencies.map((curr) => {
        const isActive = currency.code === curr.code;
        const colorClass = currencyColors[curr.code] || defaultColor;
        
        return (
          <Button
            key={curr.code}
            variant="ghost"
            size="sm"
            className={`
              px-2 py-0 h-6 min-w-[2rem] rounded-full transition-all
              ${isActive ? `${colorClass} text-white` : 'text-muted-foreground hover:text-foreground'}
              ${isActive ? 'scale-110' : 'scale-100'}
            `}
            onClick={() => setCurrency(curr)}
            title={curr.name}
          >
            <span className="font-semibold">{curr.symbol}</span>
          </Button>
        );
      })}
    </div>
  );
} 