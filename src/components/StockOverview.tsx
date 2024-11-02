import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart2, DollarSign, Activity, Percent, Loader2, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import { getTickerDetails, getPreviousClose } from '../services/polygon/stocksService';
import { PriceChart } from './stock/PriceChart';
import { KeyMetrics } from './stock/KeyMetrics';
import { StockNews } from './stock/StockNews';
import type { TickerDetails, PreviousClose } from '../services/polygon/types';

interface StockOverviewProps {
  symbol: string;
  onAIResearch?: (symbol: string) => void;
}

export function StockOverview({ symbol, onAIResearch }: StockOverviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<TickerDetails | null>(null);
  const [prevClose, setPrevClose] = useState<PreviousClose | null>(null);
  const [selectedRange, setSelectedRange] = useState('1d');
  const [showSMA, setShowSMA] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [detailsData, prevCloseData] = await Promise.all([
          getTickerDetails(symbol),
          getPreviousClose(symbol)
        ]);

        setDetails(detailsData);
        setPrevClose(prevCloseData);
      } catch (err) {
        setError('Failed to fetch stock data');
        console.error('Error fetching stock data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !details || !prevClose) {
    return (
      <div className="text-center p-8 text-red-500">
        {error || 'Unable to load stock data'}
      </div>
    );
  }

  const change = prevClose.c - prevClose.o;
  const changePercent = (change / prevClose.o) * 100;
  const isPositive = change >= 0;

  return (
    <div className="space-y-6">
      {/* Header with Price */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold">{symbol}</h2>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label={isExpanded ? 'Minimize overview' : 'Expand overview'}
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              {onAIResearch && (
                <button
                  onClick={() => onAIResearch(symbol)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  <Bot className="w-4 h-4" />
                  <span className="text-sm font-medium">AI Research</span>
                </button>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400">{details.name}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold">${prevClose.c.toFixed(2)}</div>
            <div className={`flex items-center justify-end ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-5 h-5 mr-1" />
              ) : (
                <TrendingDown className="w-5 h-5 mr-1" />
              )}
              <span className="font-medium">
                {change.toFixed(2)} ({changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart2 className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Volume</span>
                </div>
                <div className="text-2xl font-mono">{prevClose.v.toLocaleString()}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  VWAP: ${prevClose.vw.toFixed(2)}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Market Cap</span>
                </div>
                <div className="text-2xl font-mono">
                  ${(details.market_cap || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {details.currency_name}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Day Range</span>
                </div>
                <div className="text-lg font-mono">
                  ${prevClose.l.toFixed(2)} - ${prevClose.h.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Percent className="w-4 h-4 mr-1" />
                  Range: {((prevClose.h - prevClose.l) / prevClose.l * 100).toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Price Chart Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  {['1D', '1W', '1M', '6M', '1Y'].map(range => (
                    <button
                      key={range}
                      onClick={() => setSelectedRange(range.toLowerCase())}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        selectedRange === range.toLowerCase()
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showSMA}
                      onChange={(e) => setShowSMA(e.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Show SMA</span>
                  </label>
                </div>
              </div>
              <PriceChart
                symbol={symbol}
                timeRange={selectedRange}
                showSMA={showSMA}
                height={300}
              />
            </div>

            {/* Key Metrics */}
            <div className="mt-6">
              <KeyMetrics
                symbol={symbol}
                details={details}
                prevClose={prevClose}
              />
            </div>

            {/* Recent News */}
            <div className="mt-6">
              <StockNews symbol={symbol} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}