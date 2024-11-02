import React from 'react';
import { ChevronDown, ChevronUp, TrendingUp, BarChart2, DollarSign, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { StockInsightCard } from './StockInsightCard';
import { QuickStats } from './QuickStats';
import { KeyTakeaways } from './KeyTakeaways';
import { FollowUpActions } from './FollowUpActions';
import { MiniChart } from './MiniChart';
import { useWatchlistStore } from '../../hooks/useWatchlist';

interface StockAnalysisWidgetProps {
  symbol: string;
  aiRating: string;
  summary: string;
  insights: Array<{
    title: string;
    icon: string;
    summary: string;
    details: string;
  }>;
  stats: {
    sentiment: string;
    target: string;
    volatility: string;
    volatilityValue: string;
  };
  takeaways: {
    pros: string[];
    cons: string[];
  };
  onFollowUpAction?: (action: string, symbol: string) => void;
}

export function StockAnalysisWidget(props: StockAnalysisWidgetProps) {
  const data = typeof props === 'string' ? JSON.parse(props) : props;
  const { stocks, addStock, removeStock } = useWatchlistStore();
  const isWatched = stocks.some(stock => stock.symbol === data.symbol);

  const handleWatchlistToggle = () => {
    if (isWatched) {
      removeStock(data.symbol);
    } else {
      addStock({
        symbol: data.symbol,
        name: data.summary.split(' - ')[0],
        price: '0.00',
        change: '0.00',
        volume: '0',
      });
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold">{data.symbol}</h3>
            <button
              onClick={handleWatchlistToggle}
              className={`p-1 rounded-full ${
                isWatched
                  ? 'text-blue-500 hover:text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={`${isWatched ? 'Remove from' : 'Add to'} watchlist`}
            >
              {isWatched ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
            {data.aiRating}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{data.summary}</p>
      </div>

      <QuickStats stats={data.stats} />

      <div className="p-4 space-y-3">
        {data.insights.map((insight: any, index: number) => (
          <StockInsightCard key={index} {...insight} />
        ))}
      </div>

      <KeyTakeaways {...data.takeaways} />

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <MiniChart symbol={data.symbol} />
      </div>

      <FollowUpActions 
        symbol={data.symbol} 
        onAction={props.onFollowUpAction || (() => {})} 
      />
    </div>
  );
}