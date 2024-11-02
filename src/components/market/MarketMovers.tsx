import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader2, Bot } from 'lucide-react';
import { getTopMovers } from '../../services/polygon/stocksService';
import type { StockSnapshot } from '../../services/polygon/types';

interface MarketMover {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface MarketMoversProps {
  lastUpdated: Date;
  onAIResearch?: (symbol: string) => void;
}

export function MarketMovers({ lastUpdated, onAIResearch }: MarketMoversProps) {
  const [movers, setMovers] = useState<MarketMover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovers() {
      try {
        setLoading(true);
        setError(null);

        const [gainers, losers] = await Promise.all([
          getTopMovers('gainers'),
          getTopMovers('losers')
        ]);

        const processSnapshot = (snapshot: StockSnapshot): MarketMover => ({
          symbol: snapshot.ticker,
          price: snapshot.day?.c || snapshot.prevDay?.c || 0,
          change: snapshot.todaysChange,
          changePercent: snapshot.todaysChangePerc,
          volume: snapshot.day?.v || 0
        });

        const allMovers = [
          ...gainers.map(processSnapshot),
          ...losers.map(processSnapshot)
        ].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
        .slice(0, 6);

        setMovers(allMovers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market movers');
      } finally {
        setLoading(false);
      }
    }

    fetchMovers();
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
    <div className="grid grid-cols-2 gap-4">
      {movers.map((mover) => (
        <div
          key={mover.symbol}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{mover.symbol}</span>
              {onAIResearch && (
                <button
                  onClick={() => onAIResearch(mover.symbol)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                  title="AI Research"
                >
                  <Bot className="w-4 h-4" />
                </button>
              )}
              <div className="text-sm text-gray-500">
                Vol: {(mover.volume / 1000000).toFixed(1)}M
              </div>
            </div>
            <span className="font-mono">${mover.price.toFixed(2)}</span>
          </div>
          <div className={`flex items-center ${
            mover.change >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {mover.change >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>
              {mover.change.toFixed(2)} ({mover.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}