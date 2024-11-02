import axios from 'axios';

export const POLYGON_API_KEY = 'QadEeZuTRe1mJK_aCr1B04_BLqq8iaqF';
export const BASE_URL = 'https://api.polygon.io';

// Create axios instance with default config
export const polygonClient = axios.create({
  baseURL: BASE_URL,
  params: {
    apiKey: POLYGON_API_KEY
  },
  headers: {
    'Authorization': `Bearer ${POLYGON_API_KEY}`
  }
});

// Cache configuration
export const CACHE_DURATION = 1800000; // 30 minutes in milliseconds

class Cache {
  private store: Map<string, { data: any; timestamp: number }> = new Map();

  set(key: string, value: any, duration = CACHE_DURATION): void {
    this.store.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }

  get(key: string, allowExpired = false): any | null {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (!allowExpired && Date.now() - item.timestamp > CACHE_DURATION) {
      this.store.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.store.clear();
  }
}

export const cache = new Cache();

// Request Queue Implementation
class RequestQueue {
  private queue: Array<{
    request: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private readonly minInterval = 200; // 200ms between requests
  private readonly maxRetries = 2;
  private currentRetries = 0;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const now = Date.now();
    const timeToWait = Math.max(0, this.minInterval - (now - this.lastRequestTime));

    if (timeToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }

    const { request, resolve, reject } = this.queue.shift()!;

    try {
      this.lastRequestTime = Date.now();
      const response = await request();
      this.currentRetries = 0;
      resolve(response);
    } catch (error: any) {
      if (
        error.response?.status === 429 &&
        this.currentRetries < this.maxRetries
      ) {
        this.currentRetries++;
        this.queue.unshift({ request, resolve, reject });
        await new Promise(resolve => setTimeout(resolve, this.minInterval * 2));
      } else {
        reject(error);
      }
    } finally {
      this.isProcessing = false;
      this.processQueue();
    }
  }
}

export const requestQueue = new RequestQueue();

export async function executeRequest<T>(request: () => Promise<T>): Promise<T> {
  return requestQueue.add(request);
}

export class PolygonApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'PolygonApiError';
  }
}

export function handleApiError(error: any): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message;
    
    if (status === 429) {
      throw new PolygonApiError('Rate limit exceeded. Please try again later.', status, 'RATE_LIMIT');
    } else if (status === 403) {
      throw new PolygonApiError('API key invalid or unauthorized access.', status, 'UNAUTHORIZED');
    } else if (status === 404) {
      throw new PolygonApiError('Resource not found.', status, 'NOT_FOUND');
    }
    
    throw new PolygonApiError(message, status);
  }
  
  throw new PolygonApiError('An unexpected error occurred');
}