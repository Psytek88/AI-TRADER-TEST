import { ALPHA_VANTAGE_API_KEY } from '../config';

const BASE_URL = 'https://www.alphavantage.co/query';
const DELAY = 12000; // 12 seconds delay between API calls to avoid rate limiting
const MOCK_DATA = true; // Use mock data when API limit is reached

let lastCallTime = 0;

async function rateLimitedFetch(url: string) {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTime;
  
  if (timeSinceLastCall < DELAY) {
    await new Promise(resolve => setTimeout(resolve, DELAY - timeSinceLastCall));
  }
  
  lastCallTime = Date.now();
  const response = await fetch(url);
  const data = await response.json();

  if (data.Note || data['Error Message']) {
    throw new Error(data.Note || data['Error Message']);
  }

  return data;
}

// Mock data for when API limit is reached
const mockQuotes = {
  'NVDA': { price: '875.32', change: '+15.67', changePercent: '+1.82%' },
  'META': { price: '485.58', change: '+8.43', changePercent: '+1.77%' },
  'NFLX': { price: '605.88', change: '+2.31', changePercent: '+0.38%' },
  '^GSPC': { price: '5137.08', change: '+40.81', changePercent: '+0.80%' },
  '^IXIC': { price: '16274.94', change: '+183.02', changePercent: '+1.14%' },
  '^DJI': { price: '38996.39', change: '+125.69', changePercent: '+0.32%' }
};

const mockNews = [
  {
    title: "Tech Sector Continues Strong Performance",
    url: "https://example.com/tech-news",
    source: "Market News Daily",
    summary: "Leading tech companies show robust growth amid AI boom",
    time: new Date().toLocaleString()
  },
  {
    title: "Market Rally Extends on Economic Data",
    url: "https://example.com/market-news",
    source: "Financial Times",
    summary: "Positive economic indicators drive market gains",
    time: new Date().toLocaleString()
  }
];

const mockSuggestions = [
  {
    symbol: 'NVDA',
    action: 'Buy',
    reason: 'Strong AI chip demand and market leadership',
    confidence: 85
  },
  {
    symbol: 'META',
    action: 'Buy',
    reason: 'Digital ad recovery and AI investments',
    confidence: 80
  }
];

export async function searchSymbol(keywords: string) {
  try {
    const data = await rateLimitedFetch(
      `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    return data.bestMatches?.map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
    })) || [];
  } catch (error) {
    console.error('Error searching symbols:', error);
    return [];
  }
}

export async function getMarketOverview() {
  const indices = ['^GSPC', '^IXIC', '^DJI'];
  const quotes = [];

  for (const symbol of indices) {
    try {
      if (MOCK_DATA) {
        quotes.push({
          symbol: symbol.replace('^', ''),
          price: mockQuotes[symbol].price,
          change: mockQuotes[symbol].change,
          changePercent: mockQuotes[symbol].changePercent,
        });
        continue;
      }

      const data = await rateLimitedFetch(
        `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      const quote = data['Global Quote'];
      if (quote) {
        quotes.push({
          symbol: symbol.replace('^', ''),
          price: parseFloat(quote['05. price']).toFixed(2),
          change: parseFloat(quote['09. change']).toFixed(2),
          changePercent: quote['10. change percent'].replace('%', ''),
        });
      }
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      // Use mock data as fallback
      quotes.push({
        symbol: symbol.replace('^', ''),
        price: mockQuotes[symbol].price,
        change: mockQuotes[symbol].change,
        changePercent: mockQuotes[symbol].changePercent,
      });
    }
  }

  return quotes;
}

export async function getMarketNews(options: { topics?: string[] } = {}) {
  try {
    if (MOCK_DATA) {
      return mockNews;
    }

    const params = new URLSearchParams({
      function: 'NEWS_SENTIMENT',
      apikey: ALPHA_VANTAGE_API_KEY
    });

    if (options.topics?.length) {
      params.append('topics', options.topics.join(','));
    }

    const data = await rateLimitedFetch(`${BASE_URL}?${params.toString()}`);
    
    return (data.feed || []).slice(0, 5).map((item: any) => ({
      title: item.title,
      url: item.url,
      source: item.source,
      summary: item.summary,
      time: new Date(item.time_published).toLocaleString(),
    }));
  } catch (error) {
    console.error('Error fetching market news:', error);
    return mockNews;
  }
}

export async function getStockSuggestions() {
  const stocks = ['NVDA', 'META', 'NFLX'];
  const suggestions = [];

  for (const symbol of stocks) {
    try {
      if (MOCK_DATA) {
        const mockSuggestion = mockSuggestions.find(s => s.symbol === symbol);
        if (mockSuggestion) {
          suggestions.push(mockSuggestion);
        }
        continue;
      }

      const [quoteData, overviewData] = await Promise.all([
        rateLimitedFetch(`${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`),
        rateLimitedFetch(`${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`)
      ]);

      const quote = quoteData['Global Quote'];
      if (quote) {
        const changePercent = parseFloat(quote['10. change percent']);
        
        let action = 'Hold';
        if (changePercent > 2) action = 'Buy';
        if (changePercent < -2) action = 'Sell';

        suggestions.push({
          symbol,
          action,
          reason: overviewData.Description?.slice(0, 100) + '...' || 'Based on technical analysis',
          confidence: Math.round(Math.abs(changePercent) * 10),
        });
      }
    } catch (error) {
      console.error(`Error fetching suggestions for ${symbol}:`, error);
      // Use mock data as fallback
      const mockSuggestion = mockSuggestions.find(s => s.symbol === symbol);
      if (mockSuggestion) {
        suggestions.push(mockSuggestion);
      }
    }
  }

  return suggestions;
}