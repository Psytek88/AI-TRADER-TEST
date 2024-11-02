import React, { useEffect, useState, useCallback } from 'react';
import { Newspaper, Loader2, RefreshCw } from 'lucide-react';
import { NewsArticle, getMarketNews, getMarketSentiment } from '../services/marketApi';
import { useWatchlistStore } from '../hooks/useWatchlist';

const TOPICS = [
  { id: 'general', label: 'General' },
  { id: 'blockchain', label: 'Blockchain' },
  { id: 'earnings', label: 'Earnings' },
  { id: 'ipo', label: 'IPO' },
  { id: 'mergers_and_acquisitions', label: 'M&A' },
  { id: 'technology', label: 'Technology' }
];

export function NewsAnalysis() {
  const { stocks } = useWatchlistStore();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState('general');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [sentimentScore, setSentimentScore] = useState(50);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to score news importance
  const scoreNewsImportance = (article: NewsArticle): number => {
    let score = 0;

    // Score based on publisher reputation
    const majorPublishers = ['Bloomberg', 'Reuters', 'Financial Times', 'Wall Street Journal', 'CNBC'];
    if (majorPublishers.some(pub => article.publisher.name.includes(pub))) {
      score += 30;
    }

    // Score based on ticker mentions
    if (article.tickers && article.tickers.length > 0) {
      score += Math.min(article.tickers.length * 5, 20); // Max 20 points for tickers
    }

    // Score based on keywords
    const importantKeywords = [
      'earnings', 'revenue', 'profit', 'merger', 'acquisition',
      'SEC', 'FDA', 'investigation', 'lawsuit', 'breakthrough',
      'patent', 'CEO', 'executive', 'dividend', 'stock split'
    ];
    
    const content = `${article.title} ${article.description}`.toLowerCase();
    const keywordMatches = importantKeywords.filter(keyword => 
      content.includes(keyword.toLowerCase())
    );
    score += keywordMatches.length * 10;

    // Recency bonus (last 24 hours)
    const publishedTime = new Date(article.published_utc).getTime();
    const now = Date.now();
    const hoursAgo = (now - publishedTime) / (1000 * 60 * 60);
    if (hoursAgo <= 24) {
      score += Math.max(0, 20 - (hoursAgo * 0.8)); // Gradually decrease bonus over 24 hours
    }

    return score;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newsData = await getMarketNews({
        symbols: selectedStock ? [selectedStock] : undefined,
        limit: 25 // Fetch more than needed to filter important ones
      });

      // Score and sort news by importance
      const scoredNews = newsData
        .map(article => ({
          article,
          score: scoreNewsImportance(article)
        }))
        .sort((a, b) => b.score - a.score)
        .map(({ article }) => article)
        .slice(0, 4); // Keep only top 4 most important news

      setNews(scoredNews);

      const sentiment = await getMarketSentiment(
        selectedStock ? [selectedStock] : undefined
      );
      setSentimentScore(sentiment);
    } catch (err) {
      setError('Failed to fetch news. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedStock]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchData, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Market Sentiment & News</h2>
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Refresh news"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Market Sentiment
          </span>
          <span className={`text-sm font-medium ${
            sentimentScore > 60 ? 'text-green-500' : 
            sentimentScore < 40 ? 'text-red-500' : 
            'text-yellow-500'
          }`}>
            {sentimentScore.toFixed(1)}% {
              sentimentScore > 60 ? 'Positive' : 
              sentimentScore < 40 ? 'Negative' : 
              'Neutral'
            }
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              sentimentScore > 60 ? 'bg-green-500' : 
              sentimentScore < 40 ? 'bg-red-500' : 
              'bg-yellow-500'
            }`}
            style={{ width: `${sentimentScore}%` }}
          ></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => {
            setSelectedStock(null);
            setSelectedTopic('general');
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedStock && selectedTopic === 'general'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All News
        </button>

        {stocks.map((stock) => (
          <button
            key={stock.symbol}
            onClick={() => {
              setSelectedStock(stock.symbol);
              setSelectedTopic('general');
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedStock === stock.symbol
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {stock.symbol}
          </button>
        ))}
      </div>

      {error ? (
        <div className="text-center text-red-500 dark:text-red-400 py-4">
          {error}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          No news available at the moment
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((article) => (
            <a
              key={article.id}
              href={article.article_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div className="relative flex-shrink-0">
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt=""
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Newspaper className="w-5 h-5 mt-1" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium mb-1 line-clamp-2">{article.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                  {article.description}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium truncate">{article.publisher.name}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(article.published_utc).toLocaleString()}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}