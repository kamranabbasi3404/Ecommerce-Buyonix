import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContextType';
import { FaArrowLeft } from 'react-icons/fa';
import { checkAuthStatus } from '../utils/auth';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe, createPaymentIntent, stripeAppearance } from '../config/stripe';
import RealStripePayment from '../components/RealStripePayment';
import { trackPurchase } from '../utils/interactionTracking';

const BuyNow: React.FC = () => {
  const cartContext = useContext(CartContext);
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'card',
  });

  const [paymentDetails, setPaymentDetails] = useState({
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    bAN: '',
    transactionId: '',
  });

  // Stripe state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise] = useState(() => getStripe());

  // Check authentication on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      setCheckingAuth(true);

      const localLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

      let googleLoggedIn = false;
      try {
        const googleAuthData = await checkAuthStatus();
        if (googleAuthData && googleAuthData.user) {
          googleLoggedIn = true;
          localStorage.setItem('isLoggedIn', 'true');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }

      const authenticated = localLoggedIn || googleLoggedIn;
      setIsAuthenticated(authenticated);

      if (!authenticated) {
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem('redirectAfterLogin', currentPath);
        alert('Please login or create an account to place an order.');
        navigate('/login');
      }

      setCheckingAuth(false);
    };

    verifyAuth();
  }, [navigate]);

  // Create payment intent when card payment is selected
  useEffect(() => {
    const initializePayment = async () => {
      if (formData.paymentMethod === 'card' && cartContext && cartContext.cartItems.length > 0) {
        const subtotal = cartContext.cartItems.reduce((sum: number, item) => sum + (item.price * item.quantity), 0);
        const shipping = 10.00;
        const total = subtotal + shipping;

        const result = await createPaymentIntent(total, 'usd', {
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
        });

        if (result && result.success) {
          setClientSecret(result.clientSecret);
        }
      }
    };

    initializePayment();
  }, [formData.paymentMethod, formData.email, formData.firstName, formData.lastName, cartContext]);

  if (!cartContext) {
    return null;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const { cartItems } = cartContext;
  const mainProduct = cartItems[0];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const localLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!localLoggedIn) {
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem('redirectAfterLogin', currentPath);
      alert('Your session has expired. Please login again to place an order.');
      navigate('/login');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber || !formData.address || !formData.city || !formData.postalCode) {
      alert('Please fill in all shipping information fields');
      return;
    }

    // ✅ Card payment validation - must use Stripe payment form, not Place Order button
    if (formData.paymentMethod === 'card') {
      alert('⚠️ For card payments, please use the "Pay Now" button in the Card Payment section above.');
      return;
    }

    // ✅ EasyPaisa/JazzCash validation - transaction ID required
    if ((formData.paymentMethod === 'easypaisa' || formData.paymentMethod === 'jazzcash') && !paymentDetails.transactionId.trim()) {
      alert(`⚠️ Please enter your ${formData.paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} Transaction ID to proceed.`);
      return;
    }

    try {
      const orderData = {
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        paymentMethod: formData.paymentMethod,
        paymentDetails: (formData.paymentMethod === 'easypaisa' || formData.paymentMethod === 'jazzcash') ? paymentDetails : null,
        items: cartItems,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        orderDate: new Date().toISOString(),
      };

      const response = await fetch('http://localhost:5000/order/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const result = await response.json();
      console.log('Order placed successfully:', result);

      // Track purchase for each item in cart
      for (const item of cartItems) {
        // You can add rating tracking here later
        // For now, just track the purchase without rating
        await trackPurchase(item._id);
      }

      if (cartContext?.clearCart) {
        cartContext.clearCart();
      }

      navigate('/order-confirmation');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const subtotal = cartItems.reduce((sum: number, item) => sum + (item.price * item.quantity), 0);
  const shipping = 10.00;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h2>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      placeholder="John"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      placeholder="Doe"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleFormChange}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    placeholder="Street address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleFormChange}
                      placeholder="Karachi"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleFormChange}
                      placeholder="75500"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>

              <div className="flex gap-4 mb-6">
                {[
                  { id: 'easypaisa', label: 'EasyPaisa', icon: '📱' },
                  { id: 'jazzcash', label: 'JazzCash', icon: '📲' },
                  { id: 'card', label: 'Card', icon: '💳' },
                  { id: 'cod', label: 'COD', icon: '📦' },
                ].map((method) => (
                  <label key={method.id} className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={formData.paymentMethod === method.id}
                      onChange={handleFormChange}
                      className="hidden"
                    />
                    <div
                      className={`p-3 border-2 rounded-lg text-center transition-all ${formData.paymentMethod === method.id
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-300 hover:border-teal-300'
                        }`}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <p className="text-xs font-medium text-gray-700 mt-1">{method.label}</p>
                    </div>
                  </label>
                ))}
              </div>

              {(formData.paymentMethod === 'easypaisa' || formData.paymentMethod === 'jazzcash') && (
                <div className="space-y-4 border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {formData.paymentMethod === 'easypaisa' ? '📱 EasyPaisa' : '📲 JazzCash'} Payment Details
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Title</label>
                      <input
                        type="text"
                        value="Buyonix E-Commerce"
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} Number
                      </label>
                      <input
                        type="text"
                        value={formData.paymentMethod === 'easypaisa' ? '0312-3456789' : '0300-1234567'}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                      <p className="font-medium">📌 Instructions:</p>
                      <ol className="list-decimal ml-4 mt-1 space-y-1">
                        <li>Open your {formData.paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} app</li>
                        <li>Send Rs. {(subtotal + shipping).toFixed(0)} to the number above</li>
                        <li>Copy the Transaction ID and paste below</li>
                      </ol>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID (TRX ID)</label>
                      <input
                        type="text"
                        name="transactionId"
                        value={paymentDetails.transactionId}
                        onChange={handlePaymentChange}
                        placeholder="Enter your transaction ID"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>
              )}


              {formData.paymentMethod === 'card' && clientSecret && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-4">💳 Card Payment (Stripe)</h3>
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                    <RealStripePayment
                      amount={total}
                      onSuccess={() => {
                        console.log('✅ Payment successful!');
                        handlePlaceOrder(new Event('submit') as any);
                      }}
                      onError={(error: string) => {
                        console.error('❌ Payment failed:', error);
                      }}
                    />
                  </Elements>
                </div>
              )}

              {formData.paymentMethod === 'card' && !clientSecret && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    <span className="ml-3 text-gray-600">Initializing payment...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

              {mainProduct && (
                <div className="flex gap-4 pb-4 border-b border-gray-200">
                  <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0">
                    {mainProduct.images && mainProduct.images.length > 0 ? (
                      <img
                        src={typeof mainProduct.images[0] === 'string'
                          ? mainProduct.images[0]
                          : (mainProduct.images[0] as { url?: string })?.url || ''}
                        alt={mainProduct.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{mainProduct.name}</h3>
                    <p className="text-teal-600 font-bold">${mainProduct.price.toFixed(2)}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-teal-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                <p className="font-medium">By placing your order, you agree to our terms and conditions</p>
              </div>

              {formData.paymentMethod === 'card' ? (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800 text-center">
                  <p className="font-medium">💳 Please complete card payment using the form above</p>
                </div>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Place Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyNow;
