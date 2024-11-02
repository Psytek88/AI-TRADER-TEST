import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchlistStock {
  symbol: string;
  name: string;
}

interface WatchlistStore {
  stocks: WatchlistStock[];
  addStock: (stock: WatchlistStock) => void;
  removeStock: (symbol: string) => void;
  clearWatchlist: () => void;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set) => ({
      stocks: [],
      addStock: (stock) =>
        set((state) => ({
          stocks: state.stocks.some((s) => s.symbol === stock.symbol)
            ? state.stocks
            : [...state.stocks, stock],
        })),
      removeStock: (symbol) =>
        set((state) => ({
          stocks: state.stocks.filter((s) => s.symbol !== symbol),
        })),
      clearWatchlist: () => set({ stocks: [] }),
    }),
    {
      name: 'watchlist-storage',
    }
  )
);