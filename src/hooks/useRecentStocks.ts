import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Stock {
  symbol: string;
  name: string;
  change: string;
  timestamp: string;
}

interface RecentStocksStore {
  stocks: Stock[];
  addStock: (stock: Stock) => void;
  clearStocks: () => void;
}

export const useRecentStocksStore = create<RecentStocksStore>()(
  persist(
    (set) => ({
      stocks: [],
      addStock: (stock) =>
        set((state) => ({
          stocks: [
            stock,
            ...state.stocks.filter((s) => s.symbol !== stock.symbol),
          ].slice(0, 5),
        })),
      clearStocks: () => set({ stocks: [] }),
    }),
    {
      name: 'recent-stocks',
    }
  )
);