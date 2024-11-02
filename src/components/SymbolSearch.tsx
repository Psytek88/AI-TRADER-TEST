import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Building2, Globe2, DollarSign } from 'lucide-react';
import { searchTickers, getTickerDetails } from '../services/polygon/tickersService';
import { useWatchlistStore } from '../hooks/useWatchlist';
import { MarketStateIndicator } from './MarketStateIndicator';
import { SearchResult, TickerDetails } from '../services/polygon/types';

interface SymbolSearchProps {
  onSelect?: (symbol: string) => void;
}

export function SymbolSearch({ onSelect }: SymbolSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<TickerDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { addStock } = useWatchlistStore();

  const handleSearch = async () => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchResults = await searchTickers(query);
      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching symbols:', error);
      setError('Failed to fetch stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSymbol = async (result: SearchResult) => {
    setQuery('');
    setShowResults(false);
    onSelect?.(result.ticker);

    try {
      const details = await getTickerDetails(result.ticker);
      setSelectedDetails(details);

      if (details) {
        addStock({
          symbol: result.ticker,
          name: result.name,
          price: '0.00',
          change: '0.00',
          volume: '0',
        });
      }
    } catch (error) {
      console.error('Error fetching stock details:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatMarketCap = (value?: number) => {
    if (!value) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stocks (e.g., AAPL, TSLA)"
          className="w-full px-4 py-3 pl-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="absolute z-50 w-full mt-2 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl text-red-600 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {showResults && (results.length > 0 || loading) && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
            </div>
          ) : (
            results.map((result) => (
              <button
                key={result.ticker}
                onClick={() => handleSelectSymbol(result)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-3">
                    {result.branding?.icon_url && (
                      <img
                        src={result.branding.icon_url}
                        alt=""
                        className="w-6 h-6 rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <span className="font-medium">{result.ticker}</span>
                      <span className="ml-2 text-sm text-gray-500">{result.name}</span>
                    </div>
                  </div>
                  <MarketStateIndicator state={result.active ? 'live' : 'off'} />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Building2 className="w-4 h-4" />
                    <span>{result.primary_exchange}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Globe2 className="w-4 h-4" />
                    <span>{result.locale.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatMarketCap(result.market_cap)}</span>
                  </div>
                </div>

                {result.description && (
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {result.description}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}