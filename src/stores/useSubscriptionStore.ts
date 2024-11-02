import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createCheckoutSession, StripeError } from '../services/stripe';

interface SubscriptionState {
  isSubscribed: boolean;
  isSubscriptionPopupOpen: boolean;
  hasSeenSubscriptionPopup: boolean;
  isLoading: boolean;
  error: string | null;
  errorCode?: string;
  setSubscribed: (value: boolean) => void;
  setSubscriptionPopupOpen: (value: boolean) => void;
  setHasSeenSubscriptionPopup: (value: boolean) => void;
  clearError: () => void;
  startSubscription: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      isSubscribed: false,
      isSubscriptionPopupOpen: false,
      hasSeenSubscriptionPopup: false,
      isLoading: false,
      error: null,
      errorCode: undefined,
      setSubscribed: (value) => set({ isSubscribed: value }),
      setSubscriptionPopupOpen: (value) => set({ 
        isSubscriptionPopupOpen: value,
        error: null,
        errorCode: undefined
      }),
      setHasSeenSubscriptionPopup: (value) => set({ hasSeenSubscriptionPopup: value }),
      clearError: () => set({ error: null, errorCode: undefined }),
      startSubscription: async () => {
        try {
          set({ isLoading: true, error: null, errorCode: undefined });
          await createCheckoutSession();
          set({ isLoading: false });
        } catch (error) {
          let errorMessage = 'Failed to start subscription process';
          let errorCode = 'unknown';

          if (error instanceof StripeError) {
            errorMessage = error.message;
            errorCode = error.code || 'unknown';
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          set({ 
            isLoading: false, 
            error: errorMessage,
            errorCode
          });

          throw error;
        }
      },
    }),
    {
      name: 'subscription-storage',
      partialize: (state) => ({
        isSubscribed: state.isSubscribed,
        hasSeenSubscriptionPopup: state.hasSeenSubscriptionPopup,
      }),
    }
  )
);