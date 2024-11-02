import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../stores/useAuthStore';

export async function updateUserSubscription(
  email: string,
  subscriptionData: {
    stripeCustomerId: string;
    subscriptionId: string;
    subscriptionStatus: string;
    subscriptionPeriodEnd: Date;
  }
) {
  try {
    await setDoc(
      doc(db, 'users', email),
      {
        ...subscriptionData,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(email: string) {
  try {
    const response = await fetch('/.netlify/functions/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}