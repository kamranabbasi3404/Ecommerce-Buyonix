/**
 * Stripe Payment Routes
 * API endpoints for processing Stripe payments
 */

const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../config/stripe');

/**
 * POST /payment/create-payment-intent
 * Create a new payment intent
 */
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', metadata = {} } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount',
            });
        }

        const result = await createPaymentIntent(amount, currency, metadata);

        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Error in create-payment-intent:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /payment/config
 * Get Stripe publishable key
 */
router.get('/config', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});

module.exports = router;
