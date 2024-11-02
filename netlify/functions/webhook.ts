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

    const handleSubscriptionChange = async (subscription: Stripe.Subscription) => {
      const customerId = subscription.customer as string;
      const customer = await stripe.customers.retrieve(customerId);
      const userEmail = typeof customer === 'object' ? customer.email : null;

      if (!userEmail) {
        throw new Error('No email found for customer');
      }

      await db.collection('users').doc(userEmail).set({
        stripeCustomerId: customerId,
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date(),
      }, { merge: true });
    };

    switch (stripeEvent.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await handleSubscriptionChange(subscription);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const customer = await stripe.customers.retrieve(invoice.customer as string);
          const userEmail = typeof customer === 'object' ? customer.email : null;

          if (userEmail) {
            await db.collection('users').doc(userEmail).set({
              subscriptionStatus: 'past_due',
              lastPaymentError: invoice.last_payment_error?.message,
              updatedAt: new Date(),
            }, { merge: true });
          }
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const userEmail = typeof customer === 'object' ? customer.email : null;

        if (userEmail) {
          await db.collection('users').doc(userEmail).set({
            trialEndsAt: new Date(subscription.trial_end! * 1000),
            updatedAt: new Date(),
          }, { merge: true });
        }
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