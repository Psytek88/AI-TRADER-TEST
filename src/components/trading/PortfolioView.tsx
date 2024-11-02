import React from 'react';
import { TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { usePaperTradingStore } from '../../hooks/usePaperTrading';

export function PortfolioView() {
  const { positions, balance } = usePaperTradingStore();

  const totalValue = positions.reduce(
    (sum, pos) => sum + pos.shares * pos.avgPrice,
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm text-gray-500 mb-1">Total Value</h4>
          <div className="text-2xl font-mono">
            ${(balance + totalValue).toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm text-gray-500 mb-1">Cash Balance</h4>
          <div className="text-2xl font-mono">
            ${balance.toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm text-gray-500 mb-1">Today's P/L</h4>
          <div className="text-2xl font-mono text-green-500">
            +$1,234.56
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium">Positions</h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {positions.map((position) => {
            const currentPrice = position.avgPrice * 1.1; // Mock current price
            const totalValue = position.shares * currentPrice;
            const profit = totalValue - position.totalCost;
            const profitPercent = (profit / position.totalCost) * 100;
            const isPositive = profit > 0;

            return (
              <div
                key={position.symbol}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{position.symbol}</div>
                    <div className="text-sm text-gray-500">
                      {position.shares} shares @ ${position.avgPrice}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono">${totalValue.toFixed(2)}</div>
                    <div
                      className={`flex items-center ${
                        isPositive ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {profitPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {positions.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              <PieChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No positions yet</p>
              <p className="text-sm">Start trading to build your portfolio</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}