import { sendMessage } from './openrouter';
import { getTickerNews, getNews } from './polygon/newsService';
import { getTickerDetails, getPreviousClose } from './polygon/stocksService';
import type { NewsArticle, TickerDetails, PreviousClose } from './polygon/types';

interface AIAnalysis {
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

const WATCHED_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META'];
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Load cached data from localStorage
function loadCachedAnalysis(): Record<string, { data: AIAnalysis; timestamp: number }> {
  try {
    const cached = localStorage.getItem('aiAnalysisCache');
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}

// Save cache to localStorage
function saveCacheToStorage(cache: Record<string, { data: AIAnalysis; timestamp: number }>) {
  try {
    localStorage.setItem('aiAnalysisCache', JSON.stringify(cache));
  } catch (error) {
    console.warn('Failed to save AI analysis cache:', error);
  }
}

const analysisCache = loadCachedAnalysis();

// Mock data for fallback when API fails
const getMockAnalysis = (symbol: string): AIAnalysis => ({
  symbol,
  action: 'Hold',
  summary: `${symbol} analysis temporarily unavailable. Using cached data.`,
  confidence: {
    technical: 50,
    fundamental: 50,
    sentiment: 50,
    overall: 50
  },
  insights: {
    key_points: [
      'Real-time data temporarily unavailable',
      'Using historical analysis',
      'Consider waiting for live data'
    ],
    risks: [
      'Analysis based on cached data',
      'Market conditions may have changed'
    ]
  },
  sentiment_trend: Array(10).fill(50),
  last_updated: new Date().toISOString()
});

async function analyzeSentiment(articles: NewsArticle[]): Promise<number> {
  if (!articles || articles.length === 0) return 50;

  try {
    const text = articles
      .slice(0, 5)
      .map(article => 
        `Title: ${article.title}\nSummary: ${article.description || ''}`
      )
      .join('\n\n');

    const prompt = `Analyze the market sentiment from these news articles and return only a number between 0-100 representing bullish sentiment (100 = extremely bullish, 0 = extremely bearish).`;

    const response = await sendMessage([{
      role: 'user',
      content: `${prompt}\n\nArticles:\n${text}`,
      timestamp: Date.now()
    }]);

    const match = response.match(/\d+/);
    return match ? Math.min(100, Math.max(0, parseInt(match[0], 10))) : 50;
  } catch (error) {
    console.warn('Sentiment analysis fallback:', error);
    return 50;
  }
}

async function analyzeStock(symbol: string): Promise<AIAnalysis> {
  try {
    // Check cache first
    const cached = analysisCache[symbol];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Fetch all required data with proper error handling
    const [details, prevClose, companyNews, marketNews] = await Promise.all([
      getTickerDetails(symbol).catch(() => null),
      getPreviousClose(symbol).catch(() => null),
      getTickerNews(symbol, 5).catch(() => []),
      getNews({ limit: 5 }).catch(() => [])
    ]);

    // If essential data is missing, use mock data
    if (!details || !prevClose) {
      console.warn(`Using mock data for ${symbol} due to missing data`);
      return getMockAnalysis(symbol);
    }

    // Calculate metrics from available data
    const priceChange = prevClose.c - prevClose.o;
    const priceChangePercent = (priceChange / prevClose.o) * 100;
    const volatility = ((prevClose.h - prevClose.l) / prevClose.o) * 100;

    // Get sentiment scores with fallback
    const companyNewsScore = await analyzeSentiment(companyNews);
    const marketNewsScore = await analyzeSentiment(marketNews);

    const analysisPrompt = `Analyze ${symbol} (${details.name}) trading outlook based on:

Price Action:
- Current: $${prevClose.c}
- Change: ${priceChangePercent.toFixed(2)}%
- Volatility: ${volatility.toFixed(2)}%

Market Context:
- Company Sentiment: ${companyNewsScore}/100
- Market Sentiment: ${marketNewsScore}/100
- Recent Headlines: ${companyNews.slice(0, 2).map(n => n.title).join(' | ')}

Provide analysis in JSON format:
{
  "action": "Buy/Sell/Hold",
  "summary": "Brief analysis",
  "confidence": {
    "technical": 0-100,
    "fundamental": 0-100,
    "sentiment": 0-100
  },
  "insights": {
    "key_points": ["3 key points"],
    "risks": ["2 risks"]
  }
}`;

    const response = await sendMessage([{
      role: 'user',
      content: analysisPrompt,
      timestamp: Date.now()
    }]);

    let analysis;
    try {
      analysis = JSON.parse(response);
    } catch (error) {
      console.warn(`Invalid analysis response for ${symbol}, using mock data`);
      return getMockAnalysis(symbol);
    }

    const overallConfidence = Math.round(
      (analysis.confidence.technical * 0.4) +
      (analysis.confidence.fundamental * 0.3) +
      (analysis.confidence.sentiment * 0.3)
    );

    const result: AIAnalysis = {
      symbol,
      action: analysis.action,
      summary: analysis.summary,
      confidence: {
        ...analysis.confidence,
        overall: overallConfidence
      },
      insights: analysis.insights,
      sentiment_trend: Array(10).fill(0).map((_, i) => 
        Math.min(100, Math.max(0, companyNewsScore + (Math.random() * 10 - 5)))
      ),
      last_updated: new Date().toISOString()
    };

    // Update cache
    analysisCache[symbol] = {
      data: result,
      timestamp: Date.now()
    };

    // Save to localStorage
    saveCacheToStorage(analysisCache);

    return result;
  } catch (error) {
    console.warn(`Analysis error for ${symbol}, using mock data:`, error);
    return getMockAnalysis(symbol);
  }
}

export async function getStockSuggestions(): Promise<AIAnalysis[]> {
  try {
    const analyses = await Promise.all(
      WATCHED_STOCKS.map(symbol => 
        analyzeStock(symbol).catch(() => getMockAnalysis(symbol))
      )
    );

    return analyses.sort((a, b) => b.confidence.overall - a.confidence.overall);
  } catch (error) {
    console.warn('Error getting stock suggestions, using mock data:', error);
    return WATCHED_STOCKS.map(getMockAnalysis);
  }
}