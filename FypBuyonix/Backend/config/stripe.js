/**
 * Stripe Payment Gateway Configuration
 * Real Stripe integration for processing payments
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Payment Intent
 */
const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            metadata: metadata,
            payment_method_types: ['card'], // Only allow card payments
        });

        return {
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Create a Stripe Checkout Session
 * Redirects user to Stripe's hosted payment page
 */
const createCheckoutSession = async (items, customerEmail, successUrl, cancelUrl) => {
    try {
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: item.images && item.images.length > 0
                        ? [typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url || '']
                        : [],
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity || 1,
        }));

        // Add shipping as a line item
        lineItems.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Shipping',
                },
                unit_amount: 1000, // $10.00 shipping
            },
            quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: customerEmail || undefined,
        });

        return {
            success: true,
            sessionId: session.id,
            url: session.url,
        };
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

module.exports = {
    stripe,
    createPaymentIntent,
    createCheckoutSession,
};
