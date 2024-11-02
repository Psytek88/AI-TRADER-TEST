import { create } from 'zustand';

const API_KEY = 'F6EB4565C6E0420D861B86143B17AAD1';
const BASE_URL = 'https://api.aletheiaapi.com/v2';

interface StockData {
  symbol: string;
  price: number;
  percentageChange: number;
  marketState: 'pre' | 'live' | 'post' | 'off';
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  marketCap?: number;
}

interface MarketState {
  data: Record<string, StockData>;
  lastUpdated: number;
  error: string | null;
  isLoading: boolean;
  updateData: (symbol: string, data: StockData) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

// Mock data for development and fallback
const mockData: Record<string, StockData> = {
  'AAPL': {
    symbol: 'AAPL',
    price: 175.84,
    percentageChange: 1.35,
    marketState: 'live',
    dayHigh: 176.82,
    dayLow: 174.91,
    volume: 54200000,
    marketCap: 2710000000000
  },
  'MSFT': {
    symbol: 'MSFT',
    price: 420.45,
    percentageChange: 1.37,
    marketState: 'live',
    dayHigh: 422.25,
    dayLow: 418.63,
    volume: 32100000,
    marketCap: 3120000000000
  },
  'SPY': {
    symbol: 'SPY',
    price: 513.70,
    percentageChange: 0.80,
    marketState: 'live'
  },
  'QQQ': {
    symbol: 'QQQ',
    price: 427.49,
    percentageChange: 1.14,
    marketState: 'live'
  },
  'DIA': {
    symbol: 'DIA',
    price: 389.96,
    percentageChange: 0.32,
    marketState: 'live'
  }
};

export const useMarketStore = create<MarketState>((set) => ({
  data: {},
  lastUpdated: Date.now(),
  error: null,
  isLoading: false,
  updateData: (symbol, data) =>
    set((state) => ({
      data: { ...state.data, [symbol]: data },
      lastUpdated: Date.now(),
      error: null,
    })),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}));

const headers = {
  'key': API_KEY,
  'Accept-Version': '2',
  'Content-Type': 'application/json',
};

// Cache configuration
const CACHE_DURATION = 10000; // 10 seconds
const dataCache: Record<string, { data: StockData; timestamp: number }> = {};

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { 
        headers,
        method: 'GET',
      });

      // Log the response for debugging
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
      }

      if (response.ok) return response;
      
      // If rate limited, wait before retry
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5');
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      // For 400 errors, throw with specific message
      if (response.status === 400) {
        throw new Error('Invalid request parameters. Please check symbol and fields.');
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error('Fetch error:', error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries reached');
}

export async function fetchStockData(symbol: string, fields: string[]): Promise<StockData> {
  // Validate symbol
  if (!symbol || typeof symbol !== 'string') {
    throw new Error('Invalid symbol provided');
  }

  // Return mock data in development
  if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_USE_MOCK_DATA === 'true') {
    return mockData[symbol] || {
      symbol,
      price: 100 + Math.random() * 100,
      percentageChange: (Math.random() * 4) - 2,
      marketState: 'live'
    };
  }

  const cacheKey = `${symbol}-${fields.join(',')}`;
  const cached = dataCache[cacheKey];
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    useMarketStore.getState().setLoading(true);
    
    // Build URL with validated parameters
    const params = new URLSearchParams({
      symbol: symbol.toUpperCase(),
      fields: fields.join(',')
    });
    
    const response = await fetchWithRetry(`${BASE_URL}/stock?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Failed to fetch stock data');
    }

    const stockData: StockData = {
      symbol,
      price: parseFloat(data.price) || 0,
      percentageChange: parseFloat(data.change_percent) || 0,
      marketState: determineMarketState(data.market_state),
      dayHigh: parseFloat(data.high) || undefined,
      dayLow: parseFloat(data.low) || undefined,
      volume: parseInt(data.volume) || undefined,
      marketCap: parseFloat(data.market_cap) || undefined,
    };

    // Update cache
    dataCache[cacheKey] = {
      data: stockData,
      timestamp: Date.now(),
    };

    useMarketStore.getState().setError(null);
    return stockData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stock data';
    useMarketStore.getState().setError(errorMessage);
    
    // Return mock data as fallback
    console.warn('Using mock data due to API error');
    return mockData[symbol] || {
      symbol,
      price: 100 + Math.random() * 100,
      percentageChange: (Math.random() * 4) - 2,
      marketState: 'live'
    };
  } finally {
    useMarketStore.getState().setLoading(false);
  }
}

function determineMarketState(state?: string): 'pre' | 'live' | 'post' | 'off' {
  if (!state) {
    const hour = new Date().getHours();
    if (hour < 9.5) return 'pre';
    if (hour < 16) return 'live';
    if (hour < 20) return 'post';
    return 'off';
  }
  
  switch (state.toLowerCase()) {
    case 'pre-market':
      return 'pre';
    case 'regular':
      return 'live';
    case 'after-hours':
      return 'post';
    default:
      return 'off';
  }
}

export async function fetchMarketOverview(): Promise<StockData[]> {
  const symbols = ['SPY', 'QQQ', 'DIA'];
  const fields = ['price', 'change_percent', 'market_state'];
  
  try {
    const results = await Promise.allSettled(
      symbols.map(symbol => fetchStockData(symbol, fields))
    );
    
    return results
      .filter((result): result is PromiseFulfilledResult<StockData> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  } catch (error) {
    console.error('Error fetching market overview:', error);
    // Return mock data as fallback
    return symbols.map(symbol => mockData[symbol]);
  }
}

// Throttle configuration
let lastUpdateTime = 0;
const MIN_UPDATE_INTERVAL = 5000; // 5 seconds

export async function fetchWatchlistData(symbols: string[]): Promise<StockData[]> {
  const now = Date.now();
  if (now - lastUpdateTime < MIN_UPDATE_INTERVAL) {
    return Object.values(useMarketStore.getState().data);
  }
  
  lastUpdateTime = now;
  const fields = ['price', 'change_percent', 'market_state'];
  
  try {
    const results = await Promise.allSettled(
      symbols.map(symbol => fetchStockData(symbol, fields))
    );
    
    return results
      .filter((result): result is PromiseFulfilledResult<StockData> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  } catch (error) {
    console.error('Error fetching watchlist data:', error);
    // Return mock data as fallback
    return symbols.map(symbol => mockData[symbol] || {
      symbol,
      price: 100 + Math.random() * 100,
      percentageChange: (Math.random() * 4) - 2,
      marketState: 'live'
    });
  }
}

export async function fetchDetailedStockData(symbol: string): Promise<StockData> {
  const fields = [
    'price',
    'change_percent',
    'market_state',
    'high',
    'low',
    'volume',
    'market_cap'
  ];
  
  return fetchStockData(symbol, fields);
}

let updateInterval: NodeJS.Timeout;
const activeSymbols = new Set<string>();

export function startRealtimeUpdates(symbols: string[]) {
  symbols.forEach(symbol => activeSymbols.add(symbol));

  if (updateInterval) {
    return; // Updates already running
  }

  const updateData = async () => {
    if (activeSymbols.size === 0) {
      stopRealtimeUpdates();
      return;
    }

    try {
      const data = await fetchWatchlistData(Array.from(activeSymbols));
      data.forEach(stock => {
        useMarketStore.getState().updateData(stock.symbol, stock);
      });
    } catch (error) {
      console.error('Error updating real-time data:', error);
    }
  };

  updateData();
  updateInterval = setInterval(updateData, MIN_UPDATE_INTERVAL);
}

export function stopRealtimeUpdates() {
  activeSymbols.clear();
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = undefined;
  }
}