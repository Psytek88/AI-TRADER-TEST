import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutComponent {
  id: string;
  title: string;
  width: number;
  height: number;
  order: number;
  gridColumn?: string;
}

interface LayoutStore {
  components: LayoutComponent[];
  updateLayout: (newComponents: LayoutComponent[]) => void;
  updateComponentSize: (id: string, size: { width: number; height: number }) => void;
  resetLayout: () => void;
}

const defaultLayout: LayoutComponent[] = [
  { 
    id: 'market-overview', 
    title: 'Market Overview', 
    width: 1200, 
    height: 400, 
    order: 0,
    gridColumn: 'span 12'
  },
  { 
    id: 'watchlist', 
    title: 'Watchlist', 
    width: 400, 
    height: 500, 
    order: 1 
  },
  { 
    id: 'paper-trading', 
    title: 'Paper Trading', 
    width: 800, 
    height: 800, 
    order: 2 
  },
  { 
    id: 'ai-suggestions', 
    title: 'AI Suggestions', 
    width: 400, 
    height: 400, 
    order: 3 
  },
  { 
    id: 'news-analysis', 
    title: 'Market Sentiment & News', 
    width: 400, 
    height: 600, 
    order: 4 
  },
];

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      components: defaultLayout,
      updateLayout: (newComponents) => set({ components: newComponents }),
      updateComponentSize: (id, size) =>
        set((state) => ({
          components: state.components.map((component) =>
            component.id === id
              ? { ...component, ...size }
              : component
          ),
        })),
      resetLayout: () => set({ components: defaultLayout }),
    }),
    {
      name: 'dashboard-layout',
    }
  )
);