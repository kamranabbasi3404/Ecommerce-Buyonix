import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContextType';
import type { CartItem } from '../context/CartContextType';

interface Recommendation {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images?: Array<string | { url?: string }>;
  rating?: number;
  reviewCount?: number;
  predictedRating?: number;
  reason?: string;
  sellerId?: {
    storeName?: string;
  };
}

const Recommendations: React.FC = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cartContext = useContext(CartContext);
  const addToCart = cartContext?.addToCart;

  const BACKEND_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        const storedUser = localStorage.getItem('user');
        let userId = '';

        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            userId = user._id;
          } catch (e) {
            console.error("Error parsing user from localStorage", e);
          }
        }

        if (!userId || userId.length !== 24) {
          userId = '65d8c12e9f1a2b3c4d5e6f78';
        }

        const response = await fetch(`${BACKEND_URL}/product/recommendations/${userId}?num=5`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server Error Response:", errorText);
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();

        if (data.success && data.recommendations) {
          setRecommendations(data.recommendations);
        } else {
          setError('No recommendations available');
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Could not load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Recommended For You</h2>
            <p className="text-gray-600">AI-powered personalized product suggestions</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  const handleCardClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Recommendation) => {
    e.stopPropagation();
    if (addToCart) {
      const imageUrl = product.images && product.images.length > 0
        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url)
        : undefined;

      const cartItem: CartItem = {
        _id: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        images: imageUrl ? [imageUrl] : []
      };
      addToCart(cartItem);
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Recommended For You</h2>
          <p className="text-gray-600">AI-powered personalized product suggestions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {recommendations.map((product) => {
          const discountPercent = product.discount && product.discount > 0 ? `-${product.discount}%` : null;
          const imageUrl = product.images && product.images.length > 0
            ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url)
            : 'https://via.placeholder.com/300';

          return (
            <div
              key={product._id}
              onClick={() => handleCardClick(product._id)}
              className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col cursor-pointer"
            >
              {discountPercent && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                  {discountPercent}
                </div>
              )}
              <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-teal-600 transition-colors min-h-[48px]">
                  {product.name}
                </h3>
                <div className="flex items-center mb-2">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm text-gray-600 ml-1">
                    {product.rating?.toFixed(1) || '0.0'} ({product.reviewCount || 0} reviews)
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2 min-h-[16px]">
                  {product.sellerId?.storeName ? `by ${product.sellerId.storeName}` : '\u00A0'}
                </p>
                <div className="flex items-center justify-between mb-3 mt-auto">
                  <div>
                    <span className="text-lg font-bold text-gray-900">${product.price?.toFixed(2)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="w-full bg-teal-600 text-white py-2 rounded-md font-medium hover:bg-teal-700 transition-colors"
                >
                  Add to cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Recommendations;