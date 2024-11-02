import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';

interface KeyTakeawaysProps {
  pros: string[];
  cons: string[];
}

export function KeyTakeaways({ pros, cons }: KeyTakeawaysProps) {
  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <h4 className="font-medium mb-3">Key Takeaways</h4>
      <div className="space-y-4">
        <div className="space-y-2">
          {pros.map((pro, index) => (
            <div key={index} className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <Check className="w-4 h-4" />
              <span className="text-sm">{pro}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {cons.map((con, index) => (
            <div key={index} className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{con}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}