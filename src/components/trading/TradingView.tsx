import React, { useState } from 'react';
import { BarChart2, DollarSign } from 'lucide-react';
import { PriceChart } from '../stock/PriceChart';
import { OrderForm } from './OrderForm';
import { usePaperTradingStore } from '../../hooks/usePaperTrading';

export function TradingView() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [timeRange, setTimeRange] = useState('1d');
  const [showIndicators, setShowIndicators] = useState(false);
  const balance = usePaperTradingStore((state) => state.balance);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Trading Terminal</h3>
        <div className="flex items-center space-x-2 text-green-500">
          <DollarSign className="w-5 h-5" />
          <span className="font-mono text-lg">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <PriceChart
            symbol={selectedSymbol}
            timeRange={timeRange}
            showSMA={showIndicators}
            height={400}
          />
        </div>

        <div>
          <OrderForm symbol={selectedSymbol} />
        </div>
      </div>
    </div>
  );
}