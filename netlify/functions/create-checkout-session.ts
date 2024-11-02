import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

interface CheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

const handler: Handler = async (event) => {
  // CORS headers for development
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    if (!event.body) {
      throw new Error('Missing request body');
    }

    const { priceId, successUrl, cancelUrl }: CheckoutSessionRequest = JSON.parse(event.body);

    if (!priceId || !successUrl || !cancelUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required parameters',
          details: {
            priceId: !priceId,
            successUrl: !successUrl,
            cancelUrl: !cancelUrl,
          }
        }),
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_creation: 'always',
      payment_method_collection: 'if_required',
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        id: session.id,
        url: session.url 
      }),
    };
  } catch (error) {
    console.error('Stripe session creation error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

export { handler };