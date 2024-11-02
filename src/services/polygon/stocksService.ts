import { polygonClient, executeRequest, cache, handleApiError } from './config';
import type { ApiResponse, StockSnapshot, TickerDetails, SearchResult, PreviousClose } from './types';

const DEFAULT_CACHE_DURATION = 30000; // 30 seconds for real-time data

export async function getStockSnapshot(ticker: string): Promise<StockSnapshot | null> {
  const cacheKey = `snapshot-${ticker}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await executeRequest(() =>
      polygonClient.get<ApiResponse<StockSnapshot>>(`/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}`)
    );

    if (!response.data?.results) {
      return null;
    }

    const snapshot = response.data.results;
    cache.set(cacheKey, snapshot);
    return snapshot;
  } catch (error) {
    console.error(`Error fetching snapshot for ${ticker}:`, error);
    return null;
  }
}

export async function searchTickers(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const cacheKey = `search-${query}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await executeRequest(() =>
      polygonClient.get<ApiResponse<SearchResult[]>>('/v3/reference/tickers', {
        params: {
          search: query,
          active: true,
          sort: 'ticker',
          order: 'asc',
          limit: 10,
          market: 'stocks'
        }
      })
    );

    const results = response.data?.results || [];
    cache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error searching tickers:', error);
    return [];
  }
}

export async function getTickerDetails(symbol: string): Promise<TickerDetails | null> {
  const cacheKey = `ticker-details-${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await executeRequest(() =>
      polygonClient.get<ApiResponse<TickerDetails>>(`/v3/reference/tickers/${symbol}`)
    );

    if (!response.data?.results) {
      return null;
    }

    const details = response.data.results;
    cache.set(cacheKey, details);
    return details;
  } catch (error) {
    console.error(`Error fetching ticker details for ${symbol}:`, error);
    return null;
  }
}

export async function getPreviousClose(symbol: string): Promise<PreviousClose | null> {
  const cacheKey = `prev-close-${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await executeRequest(() =>
      polygonClient.get<ApiResponse<PreviousClose>>(`/v2/aggs/ticker/${symbol}/prev`, {
        params: {
          adjusted: true
        }
      })
    );

    if (!response.data?.results?.[0]) {
      return null;
    }

    const prevClose = response.data.results[0];
    cache.set(cacheKey, prevClose, DEFAULT_CACHE_DURATION);
    return prevClose;
  } catch (error) {
    console.error(`Error fetching previous close for ${symbol}:`, error);
    return null;
  }
}

export async function getTopMovers(direction: 'gainers' | 'losers'): Promise<StockSnapshot[]> {
  const cacheKey = `top-${direction}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await executeRequest(() =>
      polygonClient.get<ApiResponse<StockSnapshot[]>>(`/v2/snapshot/locale/us/markets/stocks/${direction}`, {
        params: {
          limit: 5
        }
      })
    );

    if (!response.data?.tickers) {
      return [];
    }

    const movers = response.data.tickers;
    cache.set(cacheKey, movers, 60000); // Cache for 1 minute
    return movers;
  } catch (error) {
    console.error(`Error fetching ${direction}:`, error);
    return [];
  }
}

export async function getMarketStatus(): Promise<any> {
  const cacheKey = 'market-status';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await executeRequest(() =>
      polygonClient.get('/v1/marketstatus/now')
    );

    const status = response.data;
    cache.set(cacheKey, status, 60000); // Cache for 1 minute
    return status;
  } catch (error) {
    console.error('Error fetching market status:', error);
    throw error;
  }
}