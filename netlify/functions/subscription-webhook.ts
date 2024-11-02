import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
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
  const signature = event.headers['stripe-signature'];

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing signature or webhook secret' }),
    };
  }

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body || '',
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (stripeEvent.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Get customer email from Stripe
        const customer = await stripe.customers.retrieve(customerId);
        const userEmail = typeof customer === 'object' ? customer.email : null;

        if (!userEmail) {
          throw new Error('No email found for customer');
        }

        // Update user subscription status in Firebase
        await db.collection('users').doc(userEmail).set({
          stripeCustomerId: customerId,
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date(),
        }, { merge: true });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        const customer = await stripe.customers.retrieve(customerId);
        const userEmail = typeof customer === 'object' ? customer.email : null;

        if (!userEmail) {
          throw new Error('No email found for customer');
        }

        // Update user subscription status in Firebase
        await db.collection('users').doc(userEmail).set({
          subscriptionStatus: 'canceled',
          subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date(),
        }, { merge: true });

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent;
        
        // Log successful payment
        await db.collection('payments').add({
          stripePaymentId: paymentIntent.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status,
          customerId: paymentIntent.customer,
          createdAt: new Date(),
        });

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent;
        
        // Log failed payment
        await db.collection('payments').add({
          stripePaymentId: paymentIntent.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status,
          customerId: paymentIntent.customer,
          error: paymentIntent.last_payment_error,
          createdAt: new Date(),
        });

        break;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (err) {
    console.error('Webhook Error:', err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: err instanceof Error ? err.message : 'Unknown error',
      }),
    };
  }
};

export { handler };