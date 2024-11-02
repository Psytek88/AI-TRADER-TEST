import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Loader2 } from 'lucide-react';
import { getTickerNews } from '../../services/polygon/newsService';
import type { NewsArticle } from '../../services/polygon/types';

interface StockNewsProps {
  symbol: string;
}

export function StockNews({ symbol }: StockNewsProps) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        setError(null);
        const articles = await getTickerNews(symbol, 5);
        setNews(articles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [symbol]);

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Newspaper className="w-5 h-5 mr-2" />
          Latest News
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Newspaper className="w-5 h-5 mr-2" />
          Latest News
        </h3>
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Newspaper className="w-5 h-5 mr-2" />
        Latest News
      </h3>

      <div className="space-y-4">
        {news.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            No recent news available for {symbol}
          </div>
        ) : (
          news.map((article) => (
            <a
              key={article.id}
              href={article.article_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start">
                    {article.image_url && (
                      <img
                        src={article.image_url}
                        alt=""
                        className="w-16 h-16 object-cover rounded mr-3 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h4 className="font-medium mb-1 pr-6">{article.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                        {article.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <img
                      src={article.publisher.favicon_url}
                      alt=""
                      className="w-4 h-4 mr-2"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span>{article.publisher.name}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {new Date(article.published_utc).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 flex-shrink-0 text-gray-400 mt-1" />
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}