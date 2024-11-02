import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { getPreviousClose } from '../../services/polygon/stocksService';
import type { PreviousClose } from '../../services/polygon/types';

const INDICES = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'QQQ', name: 'NASDAQ' },
  { symbol: 'DIA', name: 'Dow Jones' }
];

interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface MarketIndicesProps {
  lastUpdated: Date;
}

export function MarketIndices({ lastUpdated }: MarketIndicesProps) {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIndices() {
      try {
        setLoading(true);
        setError(null);

        const results = await Promise.all(
          INDICES.map(async (index) => {
            const data = await getPreviousClose(index.symbol);
            if (!data) return null;

            const change = data.c - data.o;
            const changePercent = (change / data.o) * 100;

            return {
              symbol: index.symbol,
              name: index.name,
              price: data.c,
              change,
              changePercent
            };
          })
        );

        setIndices(results.filter((index): index is MarketIndex => index !== null));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market indices');
      } finally {
        setLoading(false);
      }
    }

    fetchIndices();
  }, [lastUpdated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-6">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {indices.map((index) => (
        <div
          key={index.symbol}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium">{index.name}</span>
            <span className="font-mono">${index.price.toFixed(2)}</span>
          </div>
          <div className={`flex items-center ${
            index.change >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {index.change >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>
              {index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}