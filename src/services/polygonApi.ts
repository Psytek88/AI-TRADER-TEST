import axios from 'axios';

const API_KEY = 'QadEeZuTRe1mJK_aCr1B04_BLqq8iaqF';
const BASE_URL = 'https://api.polygon.io';

// Add rate limiting
const RATE_LIMIT = 5; // requests per second
let lastCallTime = 0;
const callQueue: (() => Promise<any>)[] = [];
let isProcessingQueue = false;

async function processQueue() {
  if (isProcessingQueue || callQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (callQueue.length > 0) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    if (timeSinceLastCall < (1000 / RATE_LIMIT)) {
      await new Promise(resolve => 
        setTimeout(resolve, (1000 / RATE_LIMIT) - timeSinceLastCall)
      );
    }
    
    const call = callQueue.shift();
    if (call) {
      lastCallTime = Date.now();
      try {
        await call();
      } catch (error) {
        console.error('API call failed:', error);
      }
    }
  }
  
  isProcessingQueue = false;
}

function queueApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    callQueue.push(async () => {
      try {
        const result = await apiCall();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
}

// API Endpoints
export interface TickerDetails {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  active: boolean;
  currency_name: string;
  market_cap?: number;
  description?: string;
}

export interface StockPrice {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

export interface NewsItem {
  id: string;
  publisher: {
    name: string;
    homepage_url: string;
  };
  title: string;
  author: string;
  published_utc: string;
  article_url: string;
  tickers: string[];
  description: string;
  keywords: string[];
  image_url?: string;
}

// Get list of active tickers
export async function getTickers(params: { 
  active?: boolean; 
  limit?: number; 
  market?: string;
  type?: string;
} = {}) {
  const { active = true, limit = 100, market = 'stocks', type = 'CS' } = params;
  
  return queueApiCall(() => 
    axios.get(`${BASE_URL}/v3/reference/tickers`, {
      params: {
        active,
        limit,
        market,
        type,
        apiKey: API_KEY
      }
    })
  ).then(response => response.data.results);
}

// Get detailed information about a specific ticker
export async function getTickerDetails(symbol: string): Promise<TickerDetails> {
  return queueApiCall(() =>
    axios.get(`${BASE_URL}/v3/reference/tickers/${symbol}`, {
      params: { apiKey: API_KEY }
    })
  ).then(response => response.data.results);
}

// Get latest news for a ticker
export async function getTickerNews(params: {
  ticker?: string;
  limit?: number;
} = {}): Promise<NewsItem[]> {
  const { ticker, limit = 10 } = params;
  
  return queueApiCall(() =>
    axios.get(`${BASE_URL}/v2/reference/news`, {
      params: {
        ticker,
        limit,
        apiKey: API_KEY
      }
    })
  ).then(response => response.data.results);
}

// Get historical daily price data
export async function getDailyPrices(params: {
  ticker: string;
  from: string;
  to: string;
  limit?: number;
}): Promise<StockPrice[]> {
  const { ticker, from, to, limit = 365 } = params;
  
  return queueApiCall(() =>
    axios.get(`${BASE_URL}/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}`, {
      params: {
        limit,
        apiKey: API_KEY
      }
    })
  ).then(response => response.data.results || []);
}

// Get real-time quote
export async function getQuote(ticker: string) {
  return queueApiCall(() =>
    axios.get(`${BASE_URL}/v2/last/trade/${ticker}`, {
      params: { apiKey: API_KEY }
    })
  ).then(response => response.data.results);
}

// Get market status
export async function getMarketStatus() {
  return queueApiCall(() =>
    axios.get(`${BASE_URL}/v1/marketstatus/now`, {
      params: { apiKey: API_KEY }
    })
  ).then(response => response.data);
}

// Get company financials
export async function getFinancials(ticker: string) {
  return queueApiCall(() =>
    axios.get(`${BASE_URL}/vX/reference/financials`, {
      params: {
        ticker,
        apiKey: API_KEY
      }
    })
  ).then(response => response.data.results);
}

// Error handling wrapper
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.error('API call failed:', error);
    return fallback;
  }
}