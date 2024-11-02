import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { getMultipleStockSnapshots } from '../../services/polygon/stocksService';
import type { StockSnapshot } from '../../services/polygon/types';

// Top tech stocks for market sentiment calculation
const TECH_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA'];

interface MarketStatsProps {
  lastUpdated: Date;
}

export function MarketStats({ lastUpdated }: MarketStatsProps) {
  const [stats, setStats] = useState({
    advancers: 0,
    decliners: 0,
    totalVolume: 0,
    avgChange: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function calculateStats() {
      try {
        setLoading(true);
        const snapshots = await getMultipleStockSnapshots(TECH_STOCKS);
        
        let advancers = 0;
        let decliners = 0;
        let totalVolume = 0;
        let totalChange = 0;

        snapshots.forEach(snapshot => {
          if (!snapshot) return;

          const change = snapshot.todaysChangePerc;
          if (change > 0) advancers++;
          if (change < 0) decliners++;

          totalVolume += snapshot.day?.v || 0;
          totalChange += change;
        });

        setStats({
          advancers,
          decliners,
          totalVolume,
          avgChange: totalChange / snapshots.length
        });
      } catch (error) {
        console.error('Error calculating market stats:', error);
      } finally {
        setLoading(false);
      }
    }

    calculateStats();
  }, [lastUpdated]);

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-green-500 mb-2">
          <TrendingUp className="w-5 h-5" />
          <span className="font-medium">Advancers</span>
        </div>
        <div className="text-2xl font-mono">{stats.advancers}</div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-500 mb-2">
          <TrendingDown className="w-5 h-5" />
          <span className="font-medium">Decliners</span>
        </div>
        <div className="text-2xl font-mono">{stats.decliners}</div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-blue-500 mb-2">
          <BarChart2 className="w-5 h-5" />
          <span className="font-medium">Volume</span>
        </div>
        <div className="text-2xl font-mono">
          {(stats.totalVolume / 1000000).toFixed(1)}M
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-purple-500 mb-2">
          <DollarSign className="w-5 h-5" />
          <span className="font-medium">Avg Change</span>
        </div>
        <div className={`text-2xl font-mono ${
          stats.avgChange >= 0 ? 'text-green-500' : 'text-red-500'
        }`}>
          {stats.avgChange.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}