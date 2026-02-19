import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingBag, FaMinus, FaPlus, FaArrowRight, FaShoppingCart } from 'react-icons/fa';
import { CartContext } from '../context/CartContextType';

const ShoppingCart: React.FC = () => {
  const cartContext = useContext(CartContext);
  const navigate = useNavigate();

  if (!cartContext) {
    return null;
  }

  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity } = cartContext;

  // Calculate totals
  const subtotal = cartItems.reduce((sum: number, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = cartItems.length > 0 ? 10 : 0;
  const totalPrice = subtotal + deliveryFee;

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Sidebar Cart */}
      <div
        className={`fixed top-0 right-0 h-full w-[420px] max-w-full z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        style={{
          background: 'linear-gradient(180deg, #f8fffe 0%, #ffffff 100%)',
          boxShadow: isCartOpen ? '-8px 0 30px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 px-6 py-5 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <FaShoppingCart className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Shopping Cart
              </h2>
              <p className="text-teal-100 text-xs mt-0.5">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
            }}
            className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items or Empty State */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            // Empty Cart State
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                <FaShoppingBag className="text-gray-300 text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Looks like you haven't added anything yet.<br />
                Discover amazing products!
              </p>
              <button
                onClick={() => {
                  navigate('/');
                  setIsCartOpen(false);
                }}
                className="px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all hover:shadow-lg hover:shadow-teal-200 flex items-center gap-2"
              >
                Start Shopping <FaArrowRight className="text-xs" />
              </button>
            </div>
          ) : (
            // Cart Items List
            <div className="p-5 space-y-3">
              {cartItems.map((item, index) => (
                <div
                  key={item._id}
                  className="group relative bg-white rounded-xl border border-gray-100 p-4 hover:border-teal-200 hover:shadow-md transition-all duration-200"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <div className="w-[85px] h-[85px] rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                          <img
                            src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="w-[85px] h-[85px] bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          <FaShoppingBag className="text-gray-300 text-xl" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">
                          {item.name}
                        </h4>
                        <p className="text-base font-bold text-teal-600">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Selector + Remove */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-0 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600"
                          >
                            <FaMinus className="text-[10px]" />
                          </button>
                          <span className="w-9 text-center text-sm font-semibold text-gray-900 border-l border-r border-gray-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600"
                          >
                            <FaPlus className="text-[10px]" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          aria-label="Remove from cart"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400">Item total</span>
                    <span className="text-sm font-bold text-gray-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Total & Checkout */}
        {cartItems.length > 0 && (
          <div
            className="flex-shrink-0 border-t border-gray-200 bg-white p-5"
            style={{
              boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
            }}
          >
            {/* Price Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-medium">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2.5 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-teal-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              to="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-base transition-all hover:shadow-lg hover:shadow-teal-200 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              }}
            >
              Proceed to Checkout <FaArrowRight className="text-sm" />
            </Link>

            {/* Continue Shopping Button */}
            <button
              onClick={() => {
                navigate('/');
                setIsCartOpen(false);
              }}
              className="w-full mt-2.5 py-3 rounded-xl font-medium text-gray-700 text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ShoppingCart;
