import { create } from 'zustand';

const API_KEY = 'gisveota5ar66oqg5r18zvo0zdjlzb9cyd4zkn2c';
const BASE_URL = 'https://stocknewsapi.com/api/v1';

export interface StockNewsItem {
  news_url: string;
  image_url: string;
  title: string;
  text: string;
  source_name: string;
  date: string;
  topics: string[];
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  type: 'Article' | 'Video';
  tickers?: string[];
}

interface NewsResponse {
  data: StockNewsItem[];
  total_pages: number;
  total_items: number;
}

interface MarketSentimentResponse {
  total: {
    'Total Positive': number;
    'Total Negative': number;
    'Total Neutral': number;
    'Sentiment Score': number;
  };
}

export async function getMarketNews(section = 'general'): Promise<StockNewsItem[]> {
  try {
    const url = new URL(`${BASE_URL}/category`);
    url.searchParams.append('section', section);
    url.searchParams.append('items', '50');
    url.searchParams.append('page', '1');
    url.searchParams.append('token', API_KEY);
    url.searchParams.append('cache', 'false');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: NewsResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching market news:', error);
    return [];
  }
}

export async function getStockNews(symbols: string[]): Promise<StockNewsItem[]> {
  try {
    const url = new URL(`${BASE_URL}`);
    url.searchParams.append('tickers-include', symbols.join(','));
    url.searchParams.append('items', '50');
    url.searchParams.append('page', '1');
    url.searchParams.append('token', API_KEY);
    url.searchParams.append('cache', 'false');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: NewsResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching stock news:', error);
    return [];
  }
}

export async function getMarketSentiment(): Promise<number> {
  try {
    const url = new URL(`${BASE_URL}/stat`);
    url.searchParams.append('section', 'general');
    url.searchParams.append('date', 'last30days');
    url.searchParams.append('token', API_KEY);
    url.searchParams.append('cache', 'false');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: MarketSentimentResponse = await response.json();
    const { total } = data;
    
    // Calculate sentiment score (0-100)
    const totalArticles = total['Total Positive'] + total['Total Negative'] + total['Total Neutral'];
    const score = ((total['Total Positive'] * 100) + (total['Total Neutral'] * 50)) / totalArticles;
    
    return score;
  } catch (error) {
    console.error('Error fetching market sentiment:', error);
    return 50; // Default neutral sentiment
  }
}