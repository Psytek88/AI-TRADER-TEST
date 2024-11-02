import React from 'react';
import { TrendingUp, Cpu, Leaf, Briefcase, ShoppingCart, Pill } from 'lucide-react';

const categories = [
  { name: 'Technology', icon: Cpu, trend: '+2.5%', stocks: ['AAPL', 'MSFT', 'GOOGL'] },
  { name: 'Green Energy', icon: Leaf, trend: '+1.8%', stocks: ['TSLA', 'ENPH', 'SEDG'] },
  { name: 'Finance', icon: Briefcase, trend: '-0.5%', stocks: ['JPM', 'BAC', 'GS'] },
  { name: 'Retail', icon: ShoppingCart, trend: '+0.7%', stocks: ['AMZN', 'WMT', 'TGT'] },
  { name: 'Healthcare', icon: Pill, trend: '+1.2%', stocks: ['JNJ', 'PFE', 'UNH'] },
];

export function TrendingCategories() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        Trending Categories
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const isPositive = category.trend.startsWith('+');

          return (
            <div
              key={category.name}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Icon className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="font-medium">{category.name}</span>
                </div>
                <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                  {category.trend}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.stocks.map((stock) => (
                  <span
                    key={stock}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 rounded"
                  >
                    {stock}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}