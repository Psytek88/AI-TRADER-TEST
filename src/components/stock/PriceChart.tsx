import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { getDailyBars } from '../../services/polygon/barsService';
import type { DailyBar } from '../../services/polygon/types';

interface PriceChartProps {
  symbol: string;
  timeRange: string;
  showSMA: boolean;
  height: number;
}

interface ChartData {
  date: string;
  price: number;
  volume: number;
}

export function PriceChart({ symbol, timeRange, showSMA, height }: PriceChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchChartData() {
      if (!symbol) return;

      try {
        setLoading(true);
        setError(null);

        // Calculate date range and params based on timeRange
        const endDate = new Date();
        const startDate = new Date();
        let timespan: 'minute' | 'hour' | 'day' = 'day';
        let multiplier = 1;
        let limit = 365;

        switch (timeRange) {
          case '1h':
            startDate.setHours(startDate.getHours() - 1);
            timespan = 'minute';
            multiplier = 1;
            limit = 60;
            break;
          case '1d':
            startDate.setDate(startDate.getDate() - 1);
            timespan = 'minute';
            multiplier = 5;
            limit = 288;
            break;
          case '1w':
            startDate.setDate(startDate.getDate() - 7);
            timespan = 'hour';
            multiplier = 1;
            limit = 168;
            break;
          case '1m':
            startDate.setMonth(startDate.getMonth() - 1);
            timespan = 'day';
            multiplier = 1;
            limit = 31;
            break;
          case '6m':
            startDate.setMonth(startDate.getMonth() - 6);
            timespan = 'day';
            multiplier = 1;
            limit = 180;
            break;
          case '1y':
            startDate.setFullYear(startDate.getFullYear() - 1);
            timespan = 'day';
            multiplier = 1;
            limit = 365;
            break;
          default:
            startDate.setMonth(startDate.getMonth() - 1);
        }

        const bars = await getDailyBars({
          ticker: symbol,
          from: startDate.toISOString().split('T')[0],
          to: endDate.toISOString().split('T')[0],
          timespan,
          multiplier,
          limit
        });

        if (isMounted) {
          const chartData = bars.map((bar: DailyBar) => ({
            date: formatDate(new Date(bar.t), timeRange),
            price: bar.c,
            volume: bar.v
          }));

          setData(chartData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chart data';
          setError(errorMessage);
          setData([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchChartData();

    return () => {
      isMounted = false;
    };
  }, [symbol, timeRange]);

  function formatDate(date: Date, range: string): string {
    switch (range) {
      case '1h':
      case '1d':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '1w':
        return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit' });
      default:
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center text-red-500" style={{ height }}>
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-500" style={{ height }}>
        No data available for this time range
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          domain={['auto', 'auto']}
          tickFormatter={(value) => `$${value.toFixed(2)}`}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#3B82F6"
          fillOpacity={1}
          fill="url(#colorPrice)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}