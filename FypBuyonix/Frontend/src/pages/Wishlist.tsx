import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContextType';
import { FaTrash, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';

interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  addedAt?: string;
}

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const cartContext = useContext(CartContext);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const WISHLIST_KEY = 'buyonix_wishlist';

  // Load wishlist from localStorage
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_KEY);
      if (savedWishlist) {
        const items = JSON.parse(savedWishlist);
        setWishlistItems(items);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove item from wishlist
  const removeFromWishlist = (productId: string) => {
    try {
      const updatedItems = wishlistItems.filter(item => item._id !== productId);
      setWishlistItems(updatedItems);
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  // Add item to cart
  const handleAddToCart = (item: WishlistItem) => {
    if (cartContext) {
      cartContext.addToCart({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        images: item.images || [],
      });
      alert('✓ Added to cart!');
    }
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      setWishlistItems([]);
      localStorage.setItem(WISHLIST_KEY, JSON.stringify([]));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="py-12 text-center text-gray-600">Loading wishlist...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          {wishlistItems.length > 0 && (
            <span className="ml-auto bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
              {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">💭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Save items to your wishlist to easily find them later
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Wishlist Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {wishlistItems.map((item) => {
                const imageUrl = item.images?.[0] || 'https://via.placeholder.com/300';
                const discountPercent = item.discount && item.discount > 0 ? `-${item.discount}%` : null;
                const addedDate = item.addedAt ? new Date(item.addedAt).toLocaleDateString() : 'Recently added';

                return (
                  <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Image Container */}
                    <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden group">
                      {discountPercent && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                          {discountPercent}
                        </div>
                      )}
                      <img
                        src={typeof imageUrl === 'string' ? imageUrl : (imageUrl as { url?: string })?.url || ''}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-800 line-clamp-2 flex-1">{item.name}</h3>
                        <button
                          onClick={() => removeFromWishlist(item._id)}
                          className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                          title="Remove from wishlist"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>

                      {/* Rating */}
                      {item.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-yellow-400">★</span>
                          <span className="text-xs text-gray-600">
                            {item.rating.toFixed(1)} ({item.reviewCount || 0} reviews)
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="mb-3">
                        <span className="text-lg font-bold text-teal-600">${item.price.toFixed(2)}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            ${item.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Added Date */}
                      <p className="text-xs text-gray-400 mb-3">Added: {addedDate}</p>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="px-3 py-2 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <FaShoppingCart size={12} /> Add
                        </button>
                        <button
                          onClick={() => navigate(`/product/${item._id}`)}
                          className="px-3 py-2 border border-teal-600 text-teal-600 text-xs font-medium rounded-lg hover:bg-teal-50 transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clear Wishlist Button */}
            <div className="flex justify-center">
              <button
                onClick={clearWishlist}
                className="px-6 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                Clear Entire Wishlist
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
