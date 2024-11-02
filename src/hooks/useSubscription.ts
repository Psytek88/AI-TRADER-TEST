import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useSubscriptionStore } from '../stores/useSubscriptionStore';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useSubscription() {
  const { user } = useAuthStore();
  const { setSubscribed } = useSubscriptionStore();

  useEffect(() => {
    if (!user?.email) {
      setSubscribed(false);
      return;
    }

    // Listen to subscription changes in real-time
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.email),
      (snapshot) => {
        const data = snapshot.data();
        const isActive = data?.subscriptionStatus === 'active';
        const periodEnd = data?.subscriptionPeriodEnd?.toDate();
        
        // Check if subscription is active and not expired
        setSubscribed(
          isActive && periodEnd && periodEnd.getTime() > Date.now()
        );
      },
      (error) => {
        console.error('Error fetching subscription status:', error);
        setSubscribed(false);
      }
    );

    return () => unsubscribe();
  }, [user, setSubscribed]);

  return useSubscriptionStore();
}