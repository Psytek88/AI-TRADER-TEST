import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51QGa5xBX8HOkLvUhdhSITRo08P9TvxAus8rqfPDIGjJd8M5HXct1P0JNEdquKGZ8MYlDj8sByPopF9k0krd1NObR007hfxfhSo', {
  apiVersion: '2023-10-16',
});

const endpointSecret = 'your_webhook_secret';

const handler: Handler = async (event) => {
  const sig = event.headers['stripe-signature'];

  if (!sig) {
    return {
      statusCode: 400,
      body: 'Missing stripe-signature header',
    };
  }

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body || '',
      sig,
      endpointSecret
    );

    // Handle the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        const session = stripeEvent.data.object;
        // Update user's subscription status in Firebase
        break;
      
      case 'customer.subscription.deleted':
        const subscription = stripeEvent.data.object;
        // Handle subscription cancellation
        break;
      
      default:
        console.log(`Unhandled event type ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (err) {
    console.error('Error processing webhook:', err);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }
};

export { handler };