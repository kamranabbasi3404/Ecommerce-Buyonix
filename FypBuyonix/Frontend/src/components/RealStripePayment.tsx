/**
 * Real Stripe Payment Component  
 * Uses individual Stripe Elements (cardNumber, cardExpiry, cardCvc)
 * Injects CSS directly to bypass Tailwind v4 layer overrides
 */

import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe, StripeCardNumberElement } from '@stripe/stripe-js';

interface RealStripePaymentProps {
    amount: number;
    clientSecret: string;
    onSuccess: () => void;
    onError: (error: string) => void;
}

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

const elementStyle = {
    base: {
        fontSize: '16px',
        lineHeight: '24px',
        color: '#1f2937',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
            color: '#9ca3af',
        },
    },
    invalid: {
        color: '#ef4444',
    },
};

const RealStripePayment: React.FC<RealStripePaymentProps> = ({ amount, clientSecret, onSuccess, onError }) => {
    const cardNumberRef = useRef<HTMLDivElement>(null);
    const cardExpiryRef = useRef<HTMLDivElement>(null);
    const cardCvcRef = useRef<HTMLDivElement>(null);

    const [stripe, setStripe] = useState<Stripe | null>(null);
    const [cardNumberElement, setCardNumberElement] = useState<StripeCardNumberElement | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [cardNumberComplete, setCardNumberComplete] = useState(false);
    const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
    const [cardCvcComplete, setCardCvcComplete] = useState(false);
    const [stripeLoaded, setStripeLoaded] = useState(false);
    const [stripeLoadError, setStripeLoadError] = useState('');

    const allComplete = cardNumberComplete && cardExpiryComplete && cardCvcComplete;

    // Inject CSS to fix Stripe iframe sizing (bypasses Tailwind v4 layers)
    useEffect(() => {
        const styleId = 'stripe-iframe-fix';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .StripeElement,
            .__StripeElement {
                min-height: 24px !important;
                width: 100% !important;
                display: block !important;
            }
            .StripeElement iframe,
            .__StripeElement iframe,
            .stripe-card-container iframe {
                width: 100% !important;
                height: 24px !important;
                min-height: 24px !important;
                display: block !important;
                pointer-events: auto !important;
                opacity: 1 !important;
                visibility: visible !important;
                position: relative !important;
                z-index: 1 !important;
            }
            .stripe-card-container {
                position: relative !important;
                overflow: visible !important;
            }
            .stripe-card-container * {
                pointer-events: auto !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            const el = document.getElementById(styleId);
            if (el) el.remove();
        };
    }, []);

    // Initialize Stripe and mount separate elements
    useEffect(() => {
        let mounted = true;

        const initStripe = async () => {
            try {
                console.log('🔄 Loading Stripe.js...');
                const stripeInstance = await loadStripe(stripePublishableKey);

                if (!mounted) return;

                if (!stripeInstance) {
                    setStripeLoadError('Failed to load Stripe.');
                    return;
                }

                console.log('✅ Stripe.js loaded');
                setStripe(stripeInstance);

                const elements = stripeInstance.elements();

                const cardNum = elements.create('cardNumber', { style: elementStyle, showIcon: true });
                const cardExp = elements.create('cardExpiry', { style: elementStyle });
                const cardCv = elements.create('cardCvc', { style: elementStyle });

                if (cardNumberRef.current) {
                    cardNum.mount(cardNumberRef.current);
                    console.log('✅ Card number mounted');
                }
                if (cardExpiryRef.current) {
                    cardExp.mount(cardExpiryRef.current);
                    console.log('✅ Card expiry mounted');
                }
                if (cardCvcRef.current) {
                    cardCv.mount(cardCvcRef.current);
                    console.log('✅ Card CVC mounted');
                }

                cardNum.on('change', (e) => {
                    setCardNumberComplete(e.complete);
                    setErrorMessage(e.error ? e.error.message : '');
                });
                cardExp.on('change', (e) => {
                    setCardExpiryComplete(e.complete);
                    if (e.error) setErrorMessage(e.error.message);
                });
                cardCv.on('change', (e) => {
                    setCardCvcComplete(e.complete);
                    if (e.error) setErrorMessage(e.error.message);
                });

                cardNum.on('ready', () => {
                    console.log('✅ Card number READY for input');
                    if (mounted) setStripeLoaded(true);

                    // Force iframe height fix after mount
                    setTimeout(() => {
                        document.querySelectorAll('.stripe-card-container iframe').forEach((iframe) => {
                            (iframe as HTMLIFrameElement).style.height = '24px';
                            (iframe as HTMLIFrameElement).style.minHeight = '24px';
                            (iframe as HTMLIFrameElement).style.pointerEvents = 'auto';
                            (iframe as HTMLIFrameElement).style.display = 'block';
                        });
                        console.log('✅ Forced iframe height fix applied');
                    }, 500);
                });

                setCardNumberElement(cardNum);
            } catch (err: any) {
                console.error('❌ Stripe init error:', err);
                if (mounted) setStripeLoadError(err.message || 'Failed to init Stripe');
            }
        };

        initStripe();
        return () => { mounted = false; };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !cardNumberElement) {
            setErrorMessage('Payment form not ready.');
            return;
        }
        if (!allComplete) {
            setErrorMessage('Please complete all card details.');
            return;
        }

        setIsProcessing(true);
        setErrorMessage('');

        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: cardNumberElement },
            });

            if (error) {
                setErrorMessage(error.message || 'Payment failed.');
                onError(error.message || 'Payment failed');
            } else if (paymentIntent?.status === 'succeeded') {
                console.log('✅ Payment successful! ID:', paymentIntent.id);
                onSuccess();
            } else {
                setErrorMessage(`Status: ${paymentIntent?.status}`);
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'An error occurred.');
            onError(err.message || 'Error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (stripeLoadError) {
        return (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '16px' }}>
                <p style={{ color: '#991B1B', fontWeight: 600 }}>⚠️ {stripeLoadError}</p>
                <button onClick={() => window.location.reload()}
                    style={{ marginTop: '8px', padding: '8px 16px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    Reload Page
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            {/* Test Mode Info */}
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', color: '#1D4ED8' }}>
                    🧪 <strong>Test Mode</strong>: Card <strong>4242 4242 4242 4242</strong> • Exp <strong>12/30</strong> • CVC <strong>123</strong>
                </p>
            </div>

            {/* Card Number */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Card Number</label>
                <div
                    ref={cardNumberRef}
                    className="stripe-card-container"
                    style={{
                        padding: '12px 16px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        background: 'white',
                        minHeight: '48px',
                        position: 'relative',
                        overflow: 'visible',
                    }}
                />
            </div>

            {/* Expiry and CVC */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Expiry Date</label>
                    <div
                        ref={cardExpiryRef}
                        className="stripe-card-container"
                        style={{
                            padding: '12px 16px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            background: 'white',
                            minHeight: '48px',
                            position: 'relative',
                            overflow: 'visible',
                        }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>CVC</label>
                    <div
                        ref={cardCvcRef}
                        className="stripe-card-container"
                        style={{
                            padding: '12px 16px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '8px',
                            background: 'white',
                            minHeight: '48px',
                            position: 'relative',
                            overflow: 'visible',
                        }}
                    />
                </div>
            </div>

            {/* Loading */}
            {!stripeLoaded && !stripeLoadError && (
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>⏳ Loading payment form...</p>
            )}

            {/* Error */}
            {errorMessage && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '14px', color: '#991B1B' }}>⚠️ {errorMessage}</p>
                </div>
            )}

            {/* Total */}
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Total:</span>
                <span style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>${amount.toFixed(2)}</span>
            </div>

            {/* Pay Button */}
            <button
                type="submit"
                disabled={!stripe || isProcessing || !allComplete}
                style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'white',
                    background: (!stripe || isProcessing || !allComplete) ? '#9CA3AF' : '#0D9488',
                    cursor: (!stripe || isProcessing || !allComplete) ? 'not-allowed' : 'pointer',
                    marginBottom: '12px',
                }}
            >
                {isProcessing ? '⏳ Processing...' : `Pay $${amount.toFixed(2)}`}
            </button>

            <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF' }}>🔒 Secured by Stripe</p>
        </form>
    );
};

export default RealStripePayment;
