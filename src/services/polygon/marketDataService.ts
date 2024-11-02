import { polygonClient, executeRequest, cache } from './config';

interface MarketStatus {
  afterHours: boolean;
  earlyHours: boolean;
  market: string;
  serverTime: string;
  exchanges: {
    nasdaq: string;
    nyse: string;
    otc: string;
  };
}

const CACHE_DURATION = 60000; // 1 minute

export async function getMarketStatus(): Promise<MarketStatus> {
  const cacheKey = 'market-status';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await executeRequest(() =>
      polygonClient.get<MarketStatus>('/v1/marketstatus/now')
    );

    const status = response.data;
    cache.set(cacheKey, status, CACHE_DURATION);
    return status;
  } catch (error) {
    console.error('Error fetching market status:', error);
    // Return a default status if the API call fails
    return {
      afterHours: false,
      earlyHours: false,
      market: 'closed',
      serverTime: new Date().toISOString(),
      exchanges: {
        nasdaq: 'closed',
        nyse: 'closed',
        otc: 'closed'
      }
    };
  }
}