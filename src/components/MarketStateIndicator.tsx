import React, { useState, useEffect } from 'react';
import { getMarketStatus } from '../services/polygon/marketDataService';

interface MarketStateIndicatorProps {
  className?: string;
}

export function MarketStateIndicator({ className = '' }: MarketStateIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchMarketStatus() {
      try {
        const status = await getMarketStatus();
        setIsOpen(status.market === 'open');
      } catch (error) {
        console.error('Error fetching market status:', error);
        setIsOpen(false);
      }
    }

    fetchMarketStatus();
    const interval = setInterval(fetchMarketStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={`w-2 h-2 rounded-full ${
        isOpen ? 'bg-green-500' : 'bg-gray-400'
      } ${className}`}
      title={isOpen ? 'Market Open' : 'Market Closed'}
    />
  );
}