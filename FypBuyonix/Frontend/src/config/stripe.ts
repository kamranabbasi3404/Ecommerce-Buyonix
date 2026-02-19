/**
 * Stripe Frontend Configuration
 * Real Stripe.js integration
 */

import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Initialize Stripe
let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(stripePublishableKey);
    }
    return stripePromise;
};

// Create Payment Intent
export const createPaymentIntent = async (amount: number, currency: string = 'usd', metadata: any = {}) => {
    try {
        const response = await fetch(`${API_URL}/payment/create-payment-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount,
                currency,
                metadata,
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return null;
    }
};

export const stripeAppearance = {
    theme: 'stripe' as const,
    variables: {
        colorPrimary: '#0d9488',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
    },
};
