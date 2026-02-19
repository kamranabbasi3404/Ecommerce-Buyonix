/**
 * Stripe Test Mode Payment Component
 * Simulates Stripe payment for FYP demonstration
 * Uses official Stripe test card numbers
 */

import React, { useState } from 'react';

interface StripeTestPaymentProps {
    amount: number;
    onSuccess: () => void;
    onError: (error: string) => void;
}

const StripeTestPayment: React.FC<StripeTestPaymentProps> = ({ amount, onSuccess, onError }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    // Stripe official test card numbers
    const testCards = {
        '4242424242424242': { name: 'Visa - Success', result: 'success' },
        '4000002500003155': { name: 'Visa - 3D Secure', result: 'success' },
        '4000000000009995': { name: 'Visa - Declined', result: 'declined' },
        '5555555555554444': { name: 'Mastercard - Success', result: 'success' },
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0; i < match.length; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        return parts.length ? parts.join(' ') : value;
    };

    const formatExpiry = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.slice(0, 2) + '/' + v.slice(2, 4);
        }
        return v;
    };

    const validateCard = (cardNum: string): boolean => {
        const cleanCard = cardNum.replace(/\s/g, '');
        return Object.keys(testCards).includes(cleanCard);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!cardNumber || !expiry || !cvc || !cardholderName) {
            setError('Please fill in all fields');
            return;
        }

        const cleanCard = cardNumber.replace(/\s/g, '');

        if (!validateCard(cleanCard)) {
            setError('Please use a valid Stripe test card number');
            return;
        }

        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            const cardInfo = testCards[cleanCard as keyof typeof testCards];

            if (cardInfo.result === 'success') {
                console.log('✅ Payment Successful!');
                console.log('Card Type:', cardInfo.name);
                console.log('Amount:', `$${amount.toFixed(2)}`);
                setIsProcessing(false);
                onSuccess();
            } else {
                setError('Card declined. Please try another card.');
                setIsProcessing(false);
                onError('Card declined');
            }
        }, 2000);
    };

    return (
        <div className="space-y-4">
            {/* Test Mode Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">💳</span>
                    <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 mb-1">Stripe Test Mode</h3>
                        <p className="text-sm text-blue-700 mb-2">Use these test card numbers:</p>
                        <div className="space-y-1 text-xs text-blue-600">
                            <p>✅ <strong>4242 4242 4242 4242</strong> - Success</p>
                            <p>✅ <strong>5555 5555 5555 4444</strong> - Mastercard Success</p>
                            <p>❌ <strong>4000 0000 0000 9995</strong> - Declined</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Cardholder Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                    </label>
                    <input
                        type="text"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Card Number */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                    </label>
                    <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                </div>

                {/* Expiry and CVC */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                        </label>
                        <input
                            type="text"
                            value={expiry}
                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVC
                        </label>
                        <input
                            type="text"
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            placeholder="123"
                            maxLength={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">⚠️ {error}</p>
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
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${isProcessing
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
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
                    <span>Secured by Stripe Test Mode • No real charges</span>
                </div>
            </form>
        </div>
    );
};

export default StripeTestPayment;
