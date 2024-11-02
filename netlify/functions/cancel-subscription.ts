import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const db = getFirestore();

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email } = JSON.parse(event.body || '{}');

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    // Get user's subscription data from Firebase
    const userDoc = await db.collection('users').doc(email).get();
    const userData = userDoc.data();

    if (!userData?.subscriptionId) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No active subscription found' }),
      };
    }

    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.update(
      userData.subscriptionId,
      { cancel_at_period_end: true }
    );

    // Update the user's subscription status in Firebase
    await userDoc.ref.set({
      subscriptionStatus: 'canceling',
      canceledAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Subscription canceled successfully',
        cancelDate: new Date(subscription.current_period_end * 1000),
      }),
    };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };