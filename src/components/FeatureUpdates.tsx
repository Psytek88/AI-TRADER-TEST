import React, { useState } from 'react';
import { Bell, X, ChevronRight } from 'lucide-react';

interface Update {
  id: string;
  date: string;
  title: string;
  description: string;
  isNew?: boolean;
}

const updates: Update[] = [
  {
    id: '1',
    date: '2024-01-31',
    title: 'Draggable Dashboard Components',
    description: 'You can now customize your dashboard by dragging and rearranging components.',
    isNew: true
  },
  {
    id: '2',
    date: '2024-01-31',
    title: 'Watchlist Integration',
    description: 'Add stocks to your watchlist directly from chat analysis or search.',
    isNew: true
  },
  {
    id: '3',
    date: '2024-01-31',
    title: 'Enhanced Market News',
    description: 'Real-time market news with sentiment analysis and filtering by stock.',
    isNew: true
  }
];

export function FeatureUpdates() {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedUpdates, setDismissedUpdates] = useState<string[]>([]);

  const handleDismiss = (updateId: string) => {
    setDismissedUpdates(prev => [...prev, updateId]);
  };

  const activeUpdates = updates.filter(update => !dismissedUpdates.includes(update.id));
  const hasNewUpdates = activeUpdates.some(update => update.isNew);

  if (activeUpdates.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span>New Updates</span>
          {hasNewUpdates && (
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold">Platform Updates</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {activeUpdates.map((update) => (
              <div
                key={update.id}
                className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium flex items-center">
                      {update.title}
                      {update.isNew && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          New
                        </span>
                      )}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(update.date).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDismiss(update.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {update.description}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setDismissedUpdates(updates.map(u => u.id))}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Dismiss All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}