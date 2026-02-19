import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBag } from 'react-icons/fa';

export default function OrderConfirmation() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home after 5 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg border-2 border-teal-300 border-dashed p-12 text-center max-w-md">
        {/* Bag Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-teal-100 rounded-full p-6">
            <FaShoppingBag className="text-4xl text-teal-600" />
          </div>
        </div>

        {/* Success Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Order Placed Successfully!
        </h1>

        {/* Message */}
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          Thank you for your purchase. You will receive a confirmation email shortly.
        </p>

        {/* Redirecting Text */}
        <p className="text-gray-500 text-sm">
          Redirecting to home page...
        </p>
      </div>
    </div>
  );
}
