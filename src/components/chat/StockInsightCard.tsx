import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface StockInsightCardProps {
  title: string;
  icon: string;
  summary: string;
  details: string;
}

export function StockInsightCard({ title, icon, summary, details }: StockInsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="text-xl">{icon}</span>
          <span className="font-medium">{title}</span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isExpanded ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="p-4 bg-gray-50 dark:bg-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{summary}</p>
          <p className="text-sm text-gray-700 dark:text-gray-200">{details}</p>
        </div>
      </div>
    </div>
  );
}