import React, { useState } from 'react';
import { usePaperTradingStore } from '../../hooks/usePaperTrading';

interface OrderFormProps {
  symbol: string;
  currentPrice: number;
}

export function OrderForm({ symbol, currentPrice }: OrderFormProps) {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [shares, setShares] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const addTrade = usePaperTradingStore((state) => state.addTrade);

  const handleSubmit = (type: 'buy' | 'sell') => {
    const quantity = parseInt(shares, 10);
    const price = orderType === 'limit' ? parseFloat(limitPrice) : currentPrice;
    
    if (quantity > 0 && price > 0) {
      addTrade({
        symbol,
        type,
        shares: quantity,
        price,
        total: price * quantity,
        status: orderType === 'market' ? 'filled' : 'pending',
      });

      // Reset form
      setShares('');
      setLimitPrice('');
    }
  };

  const estimatedTotal = parseFloat(shares) * (
    orderType === 'limit' ? parseFloat(limitPrice) || currentPrice : currentPrice
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <h4 className="font-medium mb-4">Place Order</h4>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Order Type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as 'market' | 'limit')}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Shares</label>
          <input
            type="number"
            min="1"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
        </div>

        {orderType === 'limit' && (
          <div>
            <label className="block text-sm font-medium mb-1">Limit Price</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
        )}

        <div className="py-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between text-sm mb-2">
            <span>Current Price:</span>
            <span className="font-mono">${currentPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span>Estimated Total:</span>
            <span className="font-mono">${estimatedTotal.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSubmit('buy')}
            disabled={!shares || (orderType === 'limit' && !limitPrice)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buy
          </button>
          <button
            onClick={() => handleSubmit('sell')}
            disabled={!shares || (orderType === 'limit' && !limitPrice)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sell
          </button>
        </div>
      </div>
    </div>
  );
}