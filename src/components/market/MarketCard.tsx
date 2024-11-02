import React from 'react';
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { StockPrice } from '../../services/polygon/types';

interface MarketCardProps {
  symbol: string;
  data: StockPrice;
}

const getDisplayName = (symbol: string) => {
  switch (symbol) {
    case 'SPY':
      return 'S&P 500';
    case 'QQQ':
      return 'NASDAQ';
    case 'DIA':
      return 'DOW';
    default:
      return symbol;
  }
};

const formatNumber = (num: number) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
};

export function MarketCard({ symbol, data }: MarketCardProps) {
  const isPositive = data.changePercent >= 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{getDisplayName(symbol)}</h3>
      </div>
      
      <div className="text-2xl font-mono mb-2">
        ${data.price.toFixed(2)}
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center ${
          isPositive ? 'text-green-500' : 'text-red-500'
        }`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          <span>{data.changePercent.toFixed(2)}%</span>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm">
          <BarChart2 className="w-4 h-4 mr-1" />
          <span>Vol: {formatNumber(data.volume)}</span>
        </div>
      </div>

      <div className="text-sm text-gray-500 flex justify-between">
        <span>H: ${data.high.toFixed(2)}</span>
        <span>L: ${data.low.toFixed(2)}</span>
      </div>
    </div>
  );
}