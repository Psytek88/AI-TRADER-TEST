import React from 'react';
import { Lock } from 'lucide-react';
import { useSubscriptionStore } from '../stores/useSubscriptionStore';

interface PremiumFeatureProps {
  children: React.ReactNode;
  title?: string;
}

export function PremiumFeature({ children, title }: PremiumFeatureProps) {
  const { isSubscribed, setSubscriptionPopupOpen } = useSubscriptionStore();

  if (isSubscribed) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 backdrop-blur-[8px] bg-black/60 flex flex-col items-center justify-center z-50 rounded-xl p-8">
        <div className="max-w-[240px] flex flex-col items-center">
          <Lock className="w-8 h-8 text-white/80 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2 text-center">
            {title || 'Premium Feature'}
          </h3>
          <p className="text-sm text-gray-300 mb-4 text-center">
            Subscribe to unlock advanced AI trading features
          </p>
          <button
            onClick={() => setSubscriptionPopupOpen(true)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );
}