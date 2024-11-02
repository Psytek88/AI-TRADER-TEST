import { getTickerDetails, getNews, getDailyBars } from './polygon';
import type { TickerDetails, NewsArticle, DailyBar } from './polygon/types';

// Cache configuration
const CACHE_DURATION = 10000; // 10 seconds
const dataCache: Record<string, { data: any; timestamp: number }> = {};

export interface StockData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  volume: string;
  marketCap: string;
  high52w: string;
  low52w: string;
  avgVolume: string;
  peRatio: string;
  dividend: string;
}

// Mock data for development and fallback
const mockData: Record<string, StockData> = {
  'AAPL': {
    name: 'Apple Inc.',
    symbol: 'AAPL',
    price: '175.84',
    change: '+2.34',
    changePercent: '+1.35%',
    volume: '54.2M',
    marketCap: '2.71T',
    high52w: '198.23',
    low52w: '124.17',
    avgVolume: '62.3M',
    peRatio: '27.2',
    dividend: '0.96%'
  },
  'MSFT': {
    name: 'Microsoft Corporation',
    symbol: 'MSFT',
    price: '420.45',
    change: '+5.67',
    changePercent: '+1.37%',
    volume: '32.1M',
    marketCap: '3.12T',
    high52w: '425.32',
    low52w: '245.61',
    avgVolume: '28.5M',
    peRatio: '35.8',
    dividend: '0.71%'
  },
  'GOOGL': {
    name: 'Alphabet Inc.',
    symbol: 'GOOGL',
    price: '147.68',
    change: '+1.23',
    changePercent: '+0.84%',
    volume: '28.5M',
    marketCap: '1.85T',
    high52w: '153.78',
    low52w: '89.42',
    avgVolume: '30.2M',
    peRatio: '25.4',
    dividend: '0.00%'
  }
};

export function getStockPrice(symbol: string): StockData {
  return mockData[symbol] || {
    symbol,
    name: 'Unknown Stock',
    price: '0.00',
    change: '+0.00',
    changePercent: '+0.00%',
    volume: '0',
    marketCap: '0',
    high52w: '0.00',
    low52w: '0.00',
    avgVolume: '0',
    peRatio: '0',
    dividend: '0.00%'
  };
}

export async function getMarketNews(options: { symbols?: string[], limit?: number } = {}): Promise<NewsArticle[]> {
  const cacheKey = `news-${options.symbols?.join(',') || 'all'}-${options.limit || 10}`;
  const cached = dataCache[cacheKey];

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    let news: NewsArticle[] = [];
    if (options.symbols?.length) {
      // Fetch news for specific symbols
      const promises = options.symbols.map(symbol => getNews({ ticker: symbol, limit: options.limit }));
      const results = await Promise.all(promises);
      news = results.flat();
    } else {
      // Fetch general market news
      news = await getNews({ limit: options.limit });
    }

    // Update cache
    dataCache[cacheKey] = {
      data: news,
      timestamp: Date.now()
    };

    return news;
  } catch (error) {
    console.error('Error fetching market news:', error);
    return [];
  }
}

export async function getMarketSentiment(symbols?: string[]): Promise<number> {
  const cacheKey = `sentiment-${symbols?.join(',') || 'market'}`;
  const cached = dataCache[cacheKey];

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Fetch recent news articles
    const news = await getMarketNews({ symbols, limit: 50 });
    
    // Calculate sentiment based on news volume and keywords
    // This is a simplified sentiment calculation
    const totalArticles = news.length;
    if (totalArticles === 0) return 50; // Neutral sentiment if no news

    const positiveKeywords = ['surge', 'gain', 'rise', 'growth', 'positive', 'bullish'];
    const negativeKeywords = ['drop', 'fall', 'decline', 'negative', 'bearish', 'risk'];

    let positiveCount = 0;
    let negativeCount = 0;

    news.forEach(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      if (positiveKeywords.some(keyword => text.includes(keyword))) positiveCount++;
      if (negativeKeywords.some(keyword => text.includes(keyword))) negativeCount++;
    });

    const sentiment = ((positiveCount * 100) + (totalArticles - positiveCount - negativeCount) * 50) / totalArticles;

    // Update cache
    dataCache[cacheKey] = {
      data: sentiment,
      timestamp: Date.now()
    };

    return sentiment;
  } catch (error) {
    console.error('Error calculating market sentiment:', error);
    return 50; // Default neutral sentiment
  }
}

export async function getMarketOverview(): Promise<{ symbol: string; price: string; change: string; changePercent: string; }[]> {
  const indices = ['SPY', 'QQQ', 'DIA'];
  const overview = [];

  for (const symbol of indices) {
    try {
      const bars = await getDailyBars({
        ticker: symbol,
        from: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
        limit: 2
      });

      if (bars.length >= 2) {
        const currentPrice = bars[1].c;
        const previousPrice = bars[0].c;
        const change = currentPrice - previousPrice;
        const changePercent = (change / previousPrice) * 100;

        overview.push({
          symbol,
          price: currentPrice.toFixed(2),
          change: change.toFixed(2),
          changePercent: changePercent.toFixed(2)
        });
      }
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      // Use mock data as fallback
      overview.push({
        symbol,
        price: '0.00',
        change: '0.00',
        changePercent: '0.00'
      });
    }
  }

  return overview;
}