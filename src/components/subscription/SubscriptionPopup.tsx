import React from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionPopup({ isOpen, onClose }: SubscriptionPopupProps) {
  const { startSubscription, isLoading, error, errorCode } = useSubscriptionStore();

  const handleSubscribe = async () => {
    try {
      await startSubscription();
    } catch (err) {
      // Error is handled by the store
    }
  };

  if (!isOpen) return null;

  const benefits = [
    'Real-time AI trading insights',
    'Advanced technical analysis',
    'Portfolio tracking & management',
    'Market sentiment analysis',
    'Personalized trading recommendations',
    'Priority customer support'
  ];

  const getErrorMessage = (error: string, code?: string) => {
    switch (code) {
      case 'checkout.session.failed':
        return 'Unable to start checkout process. Please try again.';
      case 'checkout.session.invalid':
        return 'Invalid checkout session. Please try again.';
      case 'checkout.redirect.failed':
        return 'Unable to redirect to checkout. Please try again.';
      default:
        return error;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60">
      <div className="w-full max-w-md bg-[#1a1f2e] rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Unlock Premium Features
        </h2>
        
        <p className="text-gray-400 text-lg mb-6">
          Get access to advanced AI trading features and real-time insights
        </p>

        <div className="mb-8">
          <div className="text-4xl font-bold text-white mb-2">$15</div>
          <div className="text-gray-400">per month</div>
        </div>

        <div className="space-y-3 mb-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-3 text-left">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-300">{benefit}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-red-500 text-sm">
              {getErrorMessage(error, errorCode)}
            </span>
          </div>
        )}

        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 mb-4 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            'Subscribe Now'
          )}
        </button>

        <button
          onClick={onClose}
          disabled={isLoading}
          className="w-full py-4 px-6 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          Maybe Later
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Secure payment powered by Stripe
          <br />
          Cancel anytime. No long-term commitment required.
        </p>
      </div>
    </div>
  );
}