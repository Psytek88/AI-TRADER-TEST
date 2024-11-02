import React from 'react';
import { History, TrendingUp, TrendingDown } from 'lucide-react';
import { useRecentStocksStore } from '../hooks/useRecentStocks';

export function RecentlyDiscussed() {
  const stocks = useRecentStocksStore(state => state.stocks);

  if (stocks.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <History className="w-5 h-5 mr-2" />
          Recently Discussed
        </h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          No stocks have been discussed yet. Try analyzing a stock in the chat!
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <History className="w-5 h-5 mr-2" />
        Recently Discussed
      </h3>
      <div className="space-y-3">
        {stocks.map((stock) => {
          const isPositive = stock.change.startsWith('+');

          return (
            <div
              key={stock.symbol}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div>
                <div className="font-medium">{stock.symbol}</div>
                <div className="text-sm text-gray-500">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {stock.change}
                </div>
                <div className="text-xs text-gray-400">{stock.timestamp}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}