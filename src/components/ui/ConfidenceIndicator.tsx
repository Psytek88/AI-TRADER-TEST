import React from 'react';

interface ConfidenceIndicatorProps {
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const colorClasses = {
  blue: 'bg-blue-100 dark:bg-blue-900',
  green: 'bg-green-100 dark:bg-green-900',
  purple: 'bg-purple-100 dark:bg-purple-900',
  orange: 'bg-orange-100 dark:bg-orange-900'
};

const textColorClasses = {
  blue: 'text-blue-800 dark:text-blue-200',
  green: 'text-green-800 dark:text-green-200',
  purple: 'text-purple-800 dark:text-purple-200',
  orange: 'text-orange-800 dark:text-orange-200'
};

export function ConfidenceIndicator({ label, value, color }: ConfidenceIndicatorProps) {
  return (
    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className={`text-lg font-bold ${textColorClasses[color]}`}>
        {value}%
      </div>
      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
        <div
          className={`h-full rounded-full ${textColorClasses[color]} bg-current`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}