import React from 'react';
import { PieChart, DollarSign } from 'lucide-react';

const holdings = [
  { symbol: 'AAPL', percentage: 45, value: 150000 },
  { symbol: 'MSFT', percentage: 25, value: 83333.33 },
  { symbol: 'GOOGL', percentage: 20, value: 66666.67 },
  { symbol: 'AMZN', percentage: 10, value: 33333.33 },
];

export function PortfolioSummary() {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Portfolio Summary</h2>
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          <span className="text-xl font-bold">
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {holdings.map((holding) => (
          <div
            key={holding.symbol}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-3">
              <PieChart className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-semibold">{holding.symbol}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {holding.percentage}% of portfolio
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono">
                ${holding.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}