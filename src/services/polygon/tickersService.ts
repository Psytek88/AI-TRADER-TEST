import { polygonClient, executeRequest, cache, handleApiError } from './config';
import { ApiResponse, TickerDetails, SearchResult } from './types';

const CACHE_DURATION = 300000; // 5 minutes

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
    cache.set(cacheKey, results, CACHE_DURATION);
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
    cache.set(cacheKey, details, CACHE_DURATION);
    return details;
  } catch (error) {
    console.error(`Error fetching ticker details for ${symbol}:`, error);
    return null;
  }
}