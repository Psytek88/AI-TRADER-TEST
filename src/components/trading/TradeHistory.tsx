import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { usePaperTradingStore } from '../../hooks/usePaperTrading';

export function TradeHistory() {
  const trades = usePaperTradingStore((state) => state.trades);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Shares
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {trades.map((trade) => (
              <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(trade.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {trade.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`flex items-center ${
                      trade.type === 'buy'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {trade.type === 'buy' ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    {trade.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {trade.shares}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                  ${trade.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                  ${trade.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      trade.status === 'filled'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : trade.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {trade.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {trades.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>No trades yet</p>
            <p className="text-sm">Your trade history will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}