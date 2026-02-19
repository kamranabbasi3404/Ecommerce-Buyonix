/**
 * Real Stripe Payment Component
 * Uses Stripe Elements for secure card input
 */

import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface RealStripePaymentProps {
    amount: number;
    onSuccess: () => void;
    onError: (error: string) => void;
}

const RealStripePayment: React.FC<RealStripePaymentProps> = ({ amount, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage('');

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + '/order-confirmation',
                },
                redirect: 'if_required',
            });

            if (error) {
                setErrorMessage(error.message || 'Payment failed');
                onError(error.message || 'Payment failed');
                setIsProcessing(false);
            } else {
                console.log('✅ Payment successful!');
                setIsProcessing(false);
                onSuccess();
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'An error occurred');
            onError(err.message || 'An error occurred');
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Stripe Elements Payment Form */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <PaymentElement />
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">⚠️ {errorMessage}</p>
                </div>
            )}

            {/* Amount Display */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                    <span className="text-2xl font-bold text-gray-900">${amount.toFixed(2)}</span>
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${!stripe || isProcessing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700 active:scale-95'
                    } text-white`}
            >
                {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing Payment...</span>
                    </div>
                ) : (
                    `Pay $${amount.toFixed(2)}`
                )}
            </button>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span>🔒</span>
                <span>Secured by Stripe • Test Mode</span>
            </div>
        </form>
    );
};

export default RealStripePayment;
