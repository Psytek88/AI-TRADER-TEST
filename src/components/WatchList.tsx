import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Star, Trash2, Loader2 } from 'lucide-react';
import { useWatchlistStore } from '../hooks/useWatchlist';
import { getPreviousClose } from '../services/polygon/stocksService';
import { MarketStateIndicator } from './MarketStateIndicator';
import { SparklineChart } from './SparklineChart';
import type { PreviousClose } from '../services/polygon/types';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export function WatchList() {
  const { stocks, removeStock } = useWatchlistStore();
  const [stockData, setStockData] = useState<Record<string, StockData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (stocks.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const results = await Promise.all(
          stocks.map(async (stock) => {
            const data = await getPreviousClose(stock.symbol);
            if (!data) return null;

            const change = data.c - data.o;
            const changePercent = (change / data.o) * 100;

            return {
              symbol: stock.symbol,
              price: data.c,
              change,
              changePercent,
              volume: data.v
            };
          })
        );

        const dataMap = results.reduce((acc, data) => {
          if (data) {
            acc[data.symbol] = data;
          }
          return acc;
        }, {} as Record<string, StockData>);

        setStockData(dataMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [stocks]);

  if (stocks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Watchlist</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            0 stocks
          </span>
        </div>
        
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Your watchlist is empty</p>
          <p className="text-sm">Add stocks from the search or chat to track them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Watchlist</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {stocks.length} stocks
        </span>
      </div>

      {error ? (
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          {stocks.map((stock) => {
            const data = stockData[stock.symbol];
            const isLoading = !data && loading;

            if (isLoading) {
              return (
                <div key={stock.symbol} className="animate-pulse">
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              );
            }

            if (!data) return null;

            const isPositive = data.change >= 0;

            return (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {stock.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-24 h-8">
                    <SparklineChart
                      data={[data.price - data.change, data.price]}
                      color={isPositive ? '#10B981' : '#EF4444'}
                    />
                  </div>
                  <div className="text-right">
                    <div className="font-mono">${data.price.toFixed(2)}</div>
                    <div className={`flex items-center ${
                      isPositive ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {data.changePercent.toFixed(2)}%
                    </div>
                  </div>
                  <MarketStateIndicator className="flex-shrink-0" />
                  <button
                    onClick={() => removeStock(stock.symbol)}
                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove ${stock.symbol} from watchlist`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}