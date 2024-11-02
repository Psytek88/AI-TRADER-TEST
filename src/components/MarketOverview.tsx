import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { MarketIndices } from './market/MarketIndices';
import { MarketMovers } from './market/MarketMovers';

interface MarketOverviewProps {
  onAIResearch?: (symbol: string) => void;
}

export function MarketOverview({ onAIResearch }: MarketOverviewProps) {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Market Overview</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
            aria-label="Refresh market data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Major Market Indices */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
            Major Indices
          </h3>
          <MarketIndices lastUpdated={lastUpdated} />
        </div>

        {/* Top Market Movers */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
            Top Movers
          </h3>
          <MarketMovers 
            lastUpdated={lastUpdated} 
            onAIResearch={onAIResearch}
          />
        </div>
      </div>
    </div>
  );
}