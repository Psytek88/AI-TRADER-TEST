import { polygonClient, executeRequest, cache, handleApiError } from './config';
import { ApiResponse, NewsArticle } from './types';

const CACHE_DURATION = 300000; // 5 minutes

export interface GetNewsParams {
  ticker?: string;
  published_utc?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  sort?: 'published_utc';
}

export async function getNews(params: GetNewsParams = {}): Promise<NewsArticle[]> {
  const cacheKey = `news-${JSON.stringify(params)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await executeRequest(() =>
      polygonClient.get<ApiResponse<NewsArticle[]>>('/v2/reference/news', {
        params: {
          ...params,
          limit: params.limit ?? 10,
          sort: params.sort ?? 'published_utc',
          order: params.order ?? 'desc'
        }
      })
    );

    if (!response.data?.results) {
      return [];
    }

    const articles = response.data.results;
    cache.set(cacheKey, articles, CACHE_DURATION);
    return articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function getTickerNews(ticker: string, limit = 10): Promise<NewsArticle[]> {
  return getNews({
    ticker,
    limit,
    sort: 'published_utc',
    order: 'desc'
  });
}