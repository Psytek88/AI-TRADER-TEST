import React from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface MiniChartProps {
  symbol: string;
}

export function MiniChart({ symbol }: MiniChartProps) {
  // Mock data - replace with real data in production
  const data = [
    { date: '2024-01', value: 150 },
    { date: '2024-02', value: 180 },
    { date: '2024-03', value: 165 },
    { date: '2024-04', value: 200 },
  ];

  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" hide />
          <YAxis hide />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#4F46E5"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}