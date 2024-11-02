import { ChatMessage } from '../types/chat';

const OPENROUTER_API_KEY = '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';
const VISION_MODEL = 'meta-llama/llama-3.2-11b-vision-instruct:free';
const CHAT_MODEL = 'perplexity/llama-3.1-sonar-huge-128k-online';
const TIMEOUT_MS = 30000;

const SYSTEM_PROMPT = `You are an AI trading assistant. For stock analysis requests, respond with a concise analysis in this exact format (no other text):
{
  "symbol": "STOCK_SYMBOL",
  "aiRating": "RATING_WITH_EMOJI",
  "summary": "BRIEF_OVERVIEW",
  "insights": [
    {
      "title": "Growth Potential",
      "icon": "🚀",
      "summary": "BRIEF_POINT",
      "details": "DETAILED_ANALYSIS"
    }
  ],
  "stats": {
    "sentiment": "Buy/Hold/Sell",
    "target": "PRICE_TARGET",
    "volatility": "Low/Medium/High",
    "volatilityValue": "PERCENTAGE"
  },
  "takeaways": {
    "pros": ["POINT1", "POINT2"],
    "cons": ["POINT1", "POINT2"]
  }
}`;

const CHART_ANALYSIS_PROMPT = `You are an expert technical analyst. When analyzing trading chart screenshots, provide a detailed analysis in the following format:

{
  "patterns": {
    "identified": ["List key chart patterns found"],
    "description": "Detailed explanation of patterns",
    "significance": "What these patterns suggest"
  },
  "indicators": {
    "trendlines": "Description of major trend lines",
    "support_resistance": ["Key support and resistance levels"],
    "momentum": "Analysis of momentum indicators"
  },
  "signals": {
    "primary": "Main trading signal (Buy/Sell/Hold)",
    "strength": "Signal strength (1-10)",
    "timeframe": "Short/Medium/Long term outlook",
    "risk_level": "Low/Medium/High"
  },
  "keyLevels": {
    "support": ["List of support prices"],
    "resistance": ["List of resistance prices"],
    "targets": {
      "upside": "Price target if bullish",
      "downside": "Price target if bearish"
    }
  },
  "recommendation": {
    "action": "Clear trading recommendation",
    "entry": "Suggested entry points",
    "stopLoss": "Recommended stop loss",
    "rationale": "Brief explanation of recommendation"
  }
}`;

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function analyzeScreenshot(imageBase64: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'TradeSage AI'
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          { 
            role: 'system', 
            content: CHART_ANALYSIS_PROMPT 
          },
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: 'Please analyze this trading chart and provide technical analysis:' 
              },
              { 
                type: 'image_url', 
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 1500,
        stream: false
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || 'Failed to analyze the chart.';
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      throw new Error(`Chart analysis failed: ${error.message}`);
    }
    throw error;
  }
}

export async function sendMessage(messages: ChatMessage[]): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const userMessage = messages[messages.length - 1].content.toLowerCase();
    const isAnalysisRequest = userMessage.includes('analysis') || userMessage.includes('analyze');
    const symbol = userMessage.split(' ').find(word => 
      word.length >= 1 && word.toUpperCase() === word && !['AI', 'API'].includes(word)
    ) || 'UNKNOWN';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'TradeSage AI'
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        temperature: isAnalysisRequest ? 0.3 : 0.7,
        max_tokens: 1000,
        stream: false
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Empty response from API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}