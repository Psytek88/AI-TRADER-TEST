import React from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface QuickStatsProps {
  stats: {
    sentiment: string;
    target: string;
    volatility: string;
    volatilityValue: string;
  };
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700">
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-5 h-5 text-blue-500" />
        <div>
          <div className="text-sm font-medium">Analyst Sentiment</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {stats.sentiment} (Target: {stats.target})
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <AlertTriangle className="w-5 h-5 text-yellow-500" />
        <div>
          <div className="text-sm font-medium">Volatility</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {stats.volatility} ({stats.volatilityValue})
          </div>
        </div>
      </div>
    </div>
  );
}