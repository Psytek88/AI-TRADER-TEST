import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Bot, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { getStockSuggestions } from '../services/aiAnalysis';
import { SentimentChart } from './charts/SentimentChart';

interface Suggestion {
  symbol: string;
  action: 'Buy' | 'Sell' | 'Hold';
  summary: string;
  confidence: {
    technical: number;
    fundamental: number;
    sentiment: number;
    overall: number;
  };
  insights: {
    key_points: string[];
    risks: string[];
  };
  sentiment_trend: number[];
  last_updated: string;
}

interface AISuggestionsProps {
  onAIResearch?: (symbol: string) => void;
}

export function AISuggestions({ onAIResearch }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const data = await getStockSuggestions();
        setSuggestions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
    const interval = setInterval(fetchSuggestions, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="text-red-500 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold">AI Trading Suggestions</h2>
        </div>
        <span className="text-sm text-gray-500">
          Powered by Perplexity Llama 3.1
        </span>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.symbol}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold">{suggestion.symbol}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium truncate ${
                  suggestion.action === 'Buy'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : suggestion.action === 'Sell'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {suggestion.action}
                </span>
              </div>
              {onAIResearch && (
                <button
                  onClick={() => onAIResearch(suggestion.symbol)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                  title="Ask AI for details"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {suggestion.summary}
            </p>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {Object.entries(suggestion.confidence).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-xs text-gray-500 mb-1 capitalize truncate">
                    {key}
                  </div>
                  <div className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full ${
                        key === 'technical' ? 'bg-blue-500' :
                        key === 'fundamental' ? 'bg-green-500' :
                        key === 'sentiment' ? 'bg-purple-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <div className="text-xs mt-1 font-medium">{value}%</div>
                </div>
              ))}
            </div>

            <div className="h-16 mb-2">
              <SentimentChart data={suggestion.sentiment_trend} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center text-green-500 mb-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span className="font-medium text-xs">Key Points</span>
                </div>
                <ul className="space-y-1">
                  {suggestion.insights.key_points.slice(0, 2).map((point, i) => (
                    <li key={i} className="text-gray-600 dark:text-gray-300 truncate">
                      • {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center text-red-500 mb-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  <span className="font-medium text-xs">Risks</span>
                </div>
                <ul className="space-y-1">
                  {suggestion.insights.risks.slice(0, 2).map((risk, i) => (
                    <li key={i} className="text-gray-600 dark:text-gray-300 truncate">
                      • {risk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}