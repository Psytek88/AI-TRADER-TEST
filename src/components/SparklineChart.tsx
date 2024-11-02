import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export function SparklineChart({
  data,
  color = '#3B82F6',
  height = 20
}: SparklineChartProps) {
  const chartData = data.map((value, index) => ({ value }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}