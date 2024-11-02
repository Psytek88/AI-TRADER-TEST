export interface ApiResponse<T> {
  status?: string;
  count?: number;
  results?: T;
  request_id?: string;
  next_url?: string;
}

export interface StockSnapshot {
  ticker: string;
  day: {
    c: number;  // close
    h: number;  // high
    l: number;  // low
    o: number;  // open
    v: number;  // volume
    vw: number; // volume weighted average
  };
  prevDay: {
    c: number;
    h: number;
    l: number;
    o: number;
    v: number;
    vw: number;
  };
  todaysChange: number;
  todaysChangePerc: number;
  updated: number;
}

export interface TickerDetails {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  active: boolean;
  currency_name: string;
  cik?: string;
  composite_figi?: string;
  share_class_figi?: string;
  market_cap?: number;
  phone_number?: string;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  };
  description?: string;
  sic_code?: string;
  sic_description?: string;
  ticker_root?: string;
  homepage_url?: string;
  total_employees?: number;
  list_date?: string;
  branding?: {
    logo_url?: string;
    icon_url?: string;
  };
  share_class_shares_outstanding?: number;
  weighted_shares_outstanding?: number;
}

export interface SearchResult {
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
  branding?: {
    logo_url?: string;
    icon_url?: string;
  };
}

export interface DailyBar {
  c: number;  // close price
  h: number;  // high price
  l: number;  // low price
  n: number;  // number of transactions
  o: number;  // open price
  t: number;  // timestamp
  v: number;  // trading volume
  vw: number; // volume weighted average price
}

export interface PreviousClose {
  T: string;   // ticker
  c: number;   // close price
  h: number;   // high price
  l: number;   // low price
  o: number;   // open price
  t: number;   // timestamp
  v: number;   // volume
  vw: number;  // volume weighted average price
}

export interface NewsArticle {
  id: string;
  publisher: {
    name: string;
    homepage_url: string;
    logo_url?: string;
    favicon_url?: string;
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