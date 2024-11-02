import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';

interface SentimentChartProps {
  data: number[];
}

export function SentimentChart({ data }: SentimentChartProps) {
  const chartData = data.map((value, index) => ({
    value,
    time: index
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <defs>
          <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" hide />
        <YAxis hide domain={[0, 100]} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#3B82F6"
          fillOpacity={1}
          fill="url(#sentimentGradient)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}