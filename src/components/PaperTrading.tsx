import React, { useState, useEffect } from 'react';
import { DollarSign, Loader2 } from 'lucide-react';
import { SymbolSearch } from './SymbolSearch';
import { PriceChart } from './stock/PriceChart';
import { OrderForm } from './trading/OrderForm';
import { usePaperTradingStore } from '../hooks/usePaperTrading';
import { getTickerDetails, getPreviousClose } from '../services/polygon/stocksService';
import type { TickerDetails, PreviousClose } from '../services/polygon/types';

interface StockData {
  details: TickerDetails;
  prevClose: PreviousClose;
}

const timeRanges = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
];

export function PaperTrading() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('1d');
  const balance = usePaperTradingStore((state) => state.balance);

  useEffect(() => {
    async function fetchStockData() {
      if (!selectedSymbol) return;

      try {
        setLoading(true);
        setError(null);

        const [details, prevClose] = await Promise.all([
          getTickerDetails(selectedSymbol),
          getPreviousClose(selectedSymbol)
        ]);

        if (!details || !prevClose) {
          throw new Error('Unable to fetch stock data');
        }

        setStockData({ details, prevClose });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
        console.error('Error fetching stock data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStockData();
  }, [selectedSymbol]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Paper Trading Simulator</h2>
          <div className="flex items-center space-x-2 text-green-500">
            <DollarSign className="w-5 h-5" />
            <span className="font-mono text-lg">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        
        <SymbolSearch onSelect={setSelectedSymbol} />
      </div>

      {selectedSymbol && (
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              {error}
            </div>
          ) : stockData && (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedSymbol}</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {stockData.details.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-mono">
                      ${stockData.prevClose.c.toFixed(2)}
                    </div>
                    <div className={`flex items-center justify-end ${
                      stockData.prevClose.c >= stockData.prevClose.o
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}>
                      {((stockData.prevClose.c - stockData.prevClose.o) / stockData.prevClose.o * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4 flex space-x-2">
                {timeRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      timeRange === range.value
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                  <PriceChart
                    symbol={selectedSymbol}
                    timeRange={timeRange}
                    showSMA={false}
                    height={400}
                  />
                </div>

                <div>
                  <OrderForm 
                    symbol={selectedSymbol}
                    currentPrice={stockData.prevClose.c}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}