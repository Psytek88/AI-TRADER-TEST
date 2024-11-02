import React from 'react';

export function LoadingCards() {
  return (
    <>
      {[1, 2, 3].map((index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
        </div>
      ))}
    </>
  );
}