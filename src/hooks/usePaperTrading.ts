import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Position {
  symbol: string;
  shares: number;
  avgPrice: number;
  totalCost: number;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  total: number;
  timestamp: number;
  status: 'filled' | 'pending' | 'cancelled';
}

interface PaperTradingState {
  balance: number;
  positions: Position[];
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'timestamp'>) => void;
  updatePosition: (position: Position) => void;
  resetPortfolio: () => void;
}

const INITIAL_BALANCE = 100000;

export const usePaperTradingStore = create<PaperTradingState>()(
  persist(
    (set) => ({
      balance: INITIAL_BALANCE,
      positions: [],
      trades: [],
      addTrade: (trade) => 
        set((state) => {
          const newTrade = {
            ...trade,
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
          };
          
          const cost = trade.price * trade.shares;
          const newBalance = trade.type === 'buy' 
            ? state.balance - cost
            : state.balance + cost;

          return {
            trades: [newTrade, ...state.trades],
            balance: newBalance,
          };
        }),
      updatePosition: (position) =>
        set((state) => ({
          positions: [
            ...state.positions.filter((p) => p.symbol !== position.symbol),
            position,
          ],
        })),
      resetPortfolio: () =>
        set({
          balance: INITIAL_BALANCE,
          positions: [],
          trades: [],
        }),
    }),
    {
      name: 'paper-trading-storage',
    }
  )
);