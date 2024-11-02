import React from 'react';
import { TrendingUp, Target, Activity, Star } from 'lucide-react';
import type { TickerDetails, PreviousClose } from '../../services/polygon/types';

interface KeyMetricsProps {
  symbol: string;
  details: TickerDetails;
  prevClose: PreviousClose;
}

export function KeyMetrics({ symbol, details, prevClose }: KeyMetricsProps) {
  const metrics = {
    ytdReturn: '+25.4%', // This would need to be calculated from historical data
    priceRange: {
      low: prevClose.l.toFixed(2),
      high: prevClose.h.toFixed(2),
    },
    volatility: calculateVolatility(prevClose),
    volatilityScore: calculateVolatilityScore(prevClose),
    priceTarget: (prevClose.c * 1.1).toFixed(2), // Example price target
    ratings: {
      buy: 28,
      hold: 12,
      sell: 2,
    },
  };

  function calculateVolatility(data: PreviousClose): string {
    const range = ((data.h - data.l) / data.l) * 100;
    if (range > 5) return 'High';
    if (range > 2) return 'Medium';
    return 'Low';
  }

  function calculateVolatilityScore(data: PreviousClose): number {
    return ((data.h - data.l) / data.l) * 100;
  }

  const totalRatings = metrics.ratings.buy + metrics.ratings.hold + metrics.ratings.sell;
  const buyPercentage = (metrics.ratings.buy / totalRatings) * 100;
  const holdPercentage = (metrics.ratings.hold / totalRatings) * 100;
  const sellPercentage = (metrics.ratings.sell / totalRatings) * 100;

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">Today's Range</span>
              <span className="font-medium">${metrics.priceRange.low} - ${metrics.priceRange.high}</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">Volume</span>
              <span className="font-mono">{prevClose.v.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Volatility</span>
              <div className="flex items-center">
                <Activity className="w-4 h-4 mr-1 text-yellow-500" />
                <span>{metrics.volatility}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Market Cap</span>
              <div className="flex items-center text-blue-500">
                <Target className="w-4 h-4 mr-1" />
                <span className="font-medium">
                  ${(details.market_cap || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">Company Info</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {details.description?.slice(0, 200)}...
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Exchange</span>
              <span>{details.primary_exchange}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Currency</span>
              <span>{details.currency_name}</span>
            </div>
            {details.total_employees && (
              <div className="flex items-center justify-between text-sm">
                <span>Employees</span>
                <span>{details.total_employees.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}