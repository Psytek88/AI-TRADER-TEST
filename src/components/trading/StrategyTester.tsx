import React, { useState } from 'react';
import { Play, Save, RefreshCw } from 'lucide-react';
import { PriceChart } from '../stock/PriceChart';

const strategies = [
  { id: 'ma-crossover', name: 'Moving Average Crossover' },
  { id: 'rsi', name: 'RSI Strategy' },
  { id: 'custom', name: 'Custom Strategy' },
];

export function StrategyTester() {
  const [selectedStrategy, setSelectedStrategy] = useState(strategies[0].id);
  const [dateRange, setDateRange] = useState('1m');
  const [isRunning, setIsRunning] = useState(false);

  const handleTest = () => {
    setIsRunning(true);
    // Implement strategy testing logic
    setTimeout(() => setIsRunning(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <PriceChart
            symbol="AAPL"
            timeRange={dateRange}
            showSMA={true}
            height={400}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Strategy</label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              {strategies.map((strategy) => (
                <option key={strategy.id} value={strategy.id}>
                  {strategy.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="1m">1 Month</option>
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleTest}
              disabled={isRunning}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Test
                </>
              )}
            </button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium mb-2">Performance</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Return</span>
              <span className="font-medium text-green-500">+15.4%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Sharpe Ratio</span>
              <span className="font-medium">1.8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Max Drawdown</span>
              <span className="font-medium text-red-500">-8.2%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium mb-2">Trade Statistics</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Trades</span>
              <span className="font-medium">24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Win Rate</span>
              <span className="font-medium">68%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Avg. Trade</span>
              <span className="font-medium text-green-500">+2.1%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium mb-2">Risk Metrics</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Beta</span>
              <span className="font-medium">1.2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Volatility</span>
              <span className="font-medium">15.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Sortino Ratio</span>
              <span className="font-medium">2.1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}