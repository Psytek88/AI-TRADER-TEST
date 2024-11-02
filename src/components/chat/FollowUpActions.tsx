import React from 'react';
import { BarChart2, Search, DollarSign } from 'lucide-react';

interface FollowUpActionsProps {
  symbol: string;
  onAction: (action: string, symbol: string) => void;
}

export function FollowUpActions({ symbol, onAction }: FollowUpActionsProps) {
  const actions = [
    { icon: <BarChart2 className="w-4 h-4" />, label: 'Show recent performance' },
    { icon: <Search className="w-4 h-4" />, label: 'Analyze competitors' },
    { icon: <DollarSign className="w-4 h-4" />, label: 'See financial breakdown' },
  ];

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 flex flex-wrap gap-2">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => onAction(action.label, symbol)}
          className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}