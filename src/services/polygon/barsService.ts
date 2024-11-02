import { polygonClient, executeRequest, cache, handleApiError } from './config';
import type { ApiResponse, DailyBar } from './types';

interface GetBarsParams {
  ticker: string;
  from: string;
  to: string;
  timespan?: 'minute' | 'hour' | 'day';
  multiplier?: number;
  limit?: number;
}

export async function getDailyBars({
  ticker,
  from,
  to,
  timespan = 'day',
  multiplier = 1,
  limit = 365
}: GetBarsParams): Promise<DailyBar[]> {
  const cacheKey = `bars-${ticker}-${timespan}-${multiplier}-${from}-${to}-${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await executeRequest(() =>
      polygonClient.get<ApiResponse<DailyBar[]>>(
        `/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`,
        {
          params: {
            adjusted: true,
            sort: 'asc',
            limit
          }
        }
      )
    );

    if (!response.data?.results) {
      throw new Error('No data available for the specified range');
    }

    const bars = response.data.results;
    
    // Cache the results
    if (bars && bars.length > 0) {
      cache.set(cacheKey, bars);
    }
    
    return bars;
  } catch (error) {
    if (error instanceof Error) {
      // Convert to a regular object for error logging
      const errorObj = {
        message: error.message,
        name: error.name,
        ...(error as any)
      };
      console.error('Error fetching bars:', errorObj);
    }
    throw handleApiError(error);
  }
}