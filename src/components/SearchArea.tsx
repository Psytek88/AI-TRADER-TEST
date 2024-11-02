import React, { useState } from 'react';
import { SymbolSearch } from './SymbolSearch';
import { StockOverview } from './StockOverview';
import { useSubscriptionStore } from '../stores/useSubscriptionStore';

interface SearchAreaProps {
  onAIResearch?: (symbol: string) => void;
}

export function SearchArea({ onAIResearch }: SearchAreaProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const { isSubscribed } = useSubscriptionStore();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="max-w-3xl mx-auto">
        <SymbolSearch onSelect={setSelectedSymbol} />
        
        {selectedSymbol && (
          <div className="mt-6">
            <StockOverview 
              symbol={selectedSymbol} 
              onAIResearch={isSubscribed ? onAIResearch : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}