import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketTicker {
  ticker: string;
  todaysChange: number;
  todaysChangePerc: number;
  day?: {
    c: number;
    v: number;
  };
}

interface MarketTickerCardProps {
  ticker: MarketTicker;
  onClick?: () => void;
}

export function MarketTickerCard({ ticker, onClick }: MarketTickerCardProps) {
  const isPositive = ticker.todaysChangePerc >= 0;
  const formattedPrice = ticker.day?.c.toFixed(2) || '0.00';
  const formattedChange = ticker.todaysChange.toFixed(2);
  const formattedPercent = ticker.todaysChangePerc.toFixed(2);
  const formattedVolume = (ticker.day?.v || 0).toLocaleString();

  return (
    <button
      onClick={onClick}
      className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{ticker.ticker}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Vol: {formattedVolume}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono">${formattedPrice}</div>
          <div className={`flex items-center ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>
              {formattedChange} ({formattedPercent}%)
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}