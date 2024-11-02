import { loadStripe, Stripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51QGa5xBX8HOkLvUhwsJY7mOvrNCeIlDoHq6yYYqmMiXfjOmzMIKBoJ3Y85FHMFE8WljEAOpttr5BeZEAA2xuOXGO00JHJsNOr5';

interface CheckoutSessionResponse {
  id: string;
  url: string;
  error?: { message: string };
}

export class StripeError extends Error {
  constructor(
    message: string,
    public code?: string,
    public decline_code?: string
  ) {
    super(message);
    this.name = 'StripeError';
  }
}

let stripeInstance: Stripe | null = null;

async function getStripe(): Promise<Stripe> {
  if (!stripeInstance) {
    stripeInstance = await loadStripe(STRIPE_PUBLISHABLE_KEY);
    if (!stripeInstance) {
      throw new StripeError('Failed to initialize Stripe');
    }
  }
  return stripeInstance;
}

export async function createCheckoutSession(): Promise<void> {
  try {
    const stripe = await getStripe();

    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: 'price_1QGlfqBX8HOkLvUhJkTjIjTC',
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription/cancel`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Invalid server response' }));
      throw new StripeError(
        errorData.error || `HTTP error! status: ${response.status}`,
        'checkout.session.failed'
      );
    }

    const session: CheckoutSessionResponse = await response.json();

    if (!session || !session.id) {
      throw new StripeError(
        'Invalid session data received from server',
        'checkout.session.invalid'
      );
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (error) {
      throw new StripeError(
        error.message || 'Failed to redirect to checkout',
        'checkout.redirect.failed'
      );
    }
  } catch (error) {
    if (error instanceof StripeError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new StripeError(error.message, 'checkout.unknown');
    }
    throw new StripeError('An unexpected error occurred during checkout', 'checkout.unknown');
  }
}