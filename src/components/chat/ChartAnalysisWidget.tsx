import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface ChartAnalysisWidgetProps {
  analysis: string;
}

interface AnalysisSection {
  title: string;
  content: string;
  icon?: React.ReactNode;
}

export function ChartAnalysisWidget({ analysis }: ChartAnalysisWidgetProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections: AnalysisSection[] = [
    {
      title: 'Pattern Recognition',
      content: analysis,
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />
    },
    {
      title: 'Technical Indicators',
      content: analysis,
      icon: <TrendingDown className="w-5 h-5 text-purple-500" />
    },
    {
      title: 'Risk Assessment',
      content: analysis,
      icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />
    }
  ];

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-2">Chart Analysis</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Technical analysis based on chart patterns and indicators
        </p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sections.map((section) => (
          <div key={section.title} className="p-4">
            <button
              onClick={() => setExpandedSection(
                expandedSection === section.title ? null : section.title
              )}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                {section.icon}
                <span className="font-medium">{section.title}</span>
              </div>
              {expandedSection === section.title ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {expandedSection === section.title && (
              <div className="mt-4 pl-7 text-sm text-gray-600 dark:text-gray-300">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-700 mt-2">
        <div className="text-sm font-medium mb-2">Trading Signals</div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
            Buy Signal
          </button>
          <button className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
            Strong Support
          </button>
        </div>
      </div>
    </div>
  );
}