import React, { useCallback, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { MarketOverview } from './components/MarketOverview';
import { PaperTrading } from './components/PaperTrading';
import { AISuggestions } from './components/AISuggestions';
import { NewsAnalysis } from './components/NewsAnalysis';
import { ChatWidget } from './components/ChatWidget';
import { WatchList } from './components/WatchList';
import { FeatureUpdates } from './components/FeatureUpdates';
import { SearchArea } from './components/SearchArea';
import { AuthPopup } from './components/auth/AuthPopup';
import { SubscriptionPopup } from './components/subscription/SubscriptionPopup';
import { PremiumFeature } from './components/PremiumFeature';
import { useAuth } from './hooks/useAuth';
import { useSubscriptionStore } from './stores/useSubscriptionStore';

function App() {
  const { isAuthenticated, isAuthPopupOpen, setAuthPopupOpen } = useAuth();
  const { 
    isSubscriptionPopupOpen, 
    hasSeenSubscriptionPopup,
    setSubscriptionPopupOpen, 
    setHasSeenSubscriptionPopup,
    isSubscribed
  } = useSubscriptionStore();
  
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [initialChatMessage, setInitialChatMessage] = React.useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthPopupOpen(true);
      return;
    }

    if (isAuthenticated && !hasSeenSubscriptionPopup) {
      setSubscriptionPopupOpen(true);
      setHasSeenSubscriptionPopup(true);
    }

    if (initialChatMessage) {
      setIsChatOpen(true);
    }
  }, [
    isAuthenticated, 
    initialChatMessage, 
    setAuthPopupOpen, 
    hasSeenSubscriptionPopup,
    setSubscriptionPopupOpen,
    setHasSeenSubscriptionPopup
  ]);

  const handleAIResearch = useCallback((symbol: string) => {
    if (!isSubscribed) {
      setSubscriptionPopupOpen(true);
      return;
    }
    
    setInitialChatMessage(`Please analyze ${symbol} stock and provide a comprehensive analysis including technical indicators, fundamental data, recent news, and future outlook.`);
    setIsChatOpen(true);
  }, [isSubscribed, setSubscriptionPopupOpen]);

  const handleAuthClose = useCallback(() => {
    setAuthPopupOpen(false);
  }, [setAuthPopupOpen]);

  const handleSubscriptionClose = useCallback(() => {
    setSubscriptionPopupOpen(false);
  }, [setSubscriptionPopupOpen]);

  const handleSubscribe = async () => {
    // TODO: Implement Stripe checkout
    console.log('Implement Stripe checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navigation />
      
      <main className={`relative pt-20 pb-16 ${!isAuthenticated ? 'filter blur-[8px] pointer-events-none' : ''}`} style={{ zIndex: 0 }}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <SearchArea onAIResearch={handleAIResearch} />
          </div>
          
          <div className="grid grid-cols-12 gap-4">
            {/* Left Column */}
            <div className="col-span-3 space-y-4">
              <WatchList />
              <PremiumFeature title="AI Trading Insights">
                <AISuggestions onAIResearch={handleAIResearch} />
              </PremiumFeature>
            </div>

            {/* Center Column */}
            <div className="col-span-6">
              <div className="space-y-4">
                <MarketOverview onAIResearch={handleAIResearch} />
                <PremiumFeature title="Paper Trading Simulator">
                  <PaperTrading />
                </PremiumFeature>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-3">
              <PremiumFeature title="Market News & Analysis">
                <NewsAnalysis />
              </PremiumFeature>
            </div>
          </div>
        </div>
      </main>

      <ChatWidget
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
        initialMessage={initialChatMessage}
        isPremium={isSubscribed}
      />
      
      <FeatureUpdates />
      
      <AuthPopup 
        isOpen={isAuthPopupOpen}
        onClose={handleAuthClose}
      />

      <SubscriptionPopup
        isOpen={isSubscriptionPopupOpen}
        onClose={handleSubscriptionClose}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
}

export default App;