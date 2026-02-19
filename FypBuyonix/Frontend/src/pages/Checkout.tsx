import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContextType';
import { FaTrash, FaArrowLeft, FaHeart, FaStar, FaRegStar, FaComments } from 'react-icons/fa';
import ChatWidget from '../components/ChatWidget';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  predictedRating?: number;
  reason?: string;
  colorVariants?: Array<{
    colorName: string;
    colorCode: string;
    image: string;
  }>;
}

interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  images?: (string | { url?: string })[];
  addedAt?: string;
}

interface Review {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

const Checkout: React.FC = () => {
  const cartContext = useContext(CartContext);
  const navigate = useNavigate();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);

  const [isBargainOpen, setIsBargainOpen] = useState(false);
  const [bargainAttempts, setBargainAttempts] = useState(3);
  const [offerInput, setOfferInput] = useState('');
  const [bargainMessages, setBargainMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [isProcessingOffer, setIsProcessingOffer] = useState(false);

  // Reviews and Chat states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatSellerId, setChatSellerId] = useState('');
  const [chatSellerName, setChatSellerName] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [productRating, setProductRating] = useState(0);
  const [productReviewCount, setProductReviewCount] = useState(0);

  // Review modal states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // Get the first item in cart (main product display)
  const mainProduct = cartContext?.cartItems?.[0];

  // Track bargained products in localStorage
  const BARGAINED_PRODUCTS_KEY = 'buyonix_bargained_products';

  // Track wishlist in localStorage
  const WISHLIST_KEY = 'buyonix_wishlist';

  const [isBargainCompleted, setIsBargainCompleted] = useState(() => {
    if (!mainProduct) return false;
    try {
      const bargainedProducts = localStorage.getItem(BARGAINED_PRODUCTS_KEY);
      if (bargainedProducts) {
        const productIds = JSON.parse(bargainedProducts);
        return productIds.includes(mainProduct._id);
      }
    } catch (error) {
      console.error('Error loading bargained products:', error);
    }
    return false;
  });

  const [isInWishlist, setIsInWishlist] = useState(() => {
    if (!mainProduct) return false;
    try {
      const wishlist = localStorage.getItem(WISHLIST_KEY);
      if (wishlist) {
        const wishlistItems: WishlistItem[] = JSON.parse(wishlist);
        return wishlistItems.some((item: WishlistItem) => item._id === mainProduct._id);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
    return false;
  });

  // Update bargain completed state when product changes
  useEffect(() => {
    if (!mainProduct) {
      setIsBargainCompleted(false);
      return;
    }

    try {
      const bargainedProducts = localStorage.getItem(BARGAINED_PRODUCTS_KEY);
      if (bargainedProducts) {
        const productIds = JSON.parse(bargainedProducts);
        setIsBargainCompleted(productIds.includes(mainProduct._id));
      } else {
        setIsBargainCompleted(false);
      }
    } catch (error) {
      console.error('Error checking bargained products:', error);
      setIsBargainCompleted(false);
    }

    // Also check wishlist when product changes
    try {
      const wishlist = localStorage.getItem(WISHLIST_KEY);
      if (wishlist) {
        const wishlistItems: WishlistItem[] = JSON.parse(wishlist);
        setIsInWishlist(wishlistItems.some((item: WishlistItem) => item._id === mainProduct._id));
      } else {
        setIsInWishlist(false);
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
      setIsInWishlist(false);
    }
  }, [mainProduct]);

  // Get user info for chat
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        setUserId(user._id || user.id || '');
        setUserName(user.name || user.email?.split('@')[0] || 'User');
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  // Fetch product details (for seller info and rating) and reviews
  useEffect(() => {
    if (!mainProduct?._id) return;

    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/product/${mainProduct._id}`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success && data.product) {
          setProductRating(data.product.rating || 0);
          setProductReviewCount(data.product.reviewCount || 0);
          if (data.product.sellerId) {
            setChatSellerId(data.product.sellerId._id || '');
            setChatSellerName(data.product.sellerId.storeName || 'Seller');
          }
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const response = await fetch(
          `http://localhost:5000/product/${mainProduct._id}/reviews?limit=5`,
          { credentials: 'include' }
        );
        const data = await response.json();
        if (data.success && data.reviews) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchProductDetails();
    fetchReviews();
  }, [mainProduct?._id]);

  // Fetch related products on mount
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        // Try to get AI-powered recommendations first using a mock user ID
        // In production, you'd get the actual userId from auth context
        const userId = localStorage.getItem('buyonix_user_id') || 'user_1';

        const response = await fetch(`http://localhost:5000/product/related/${userId}?num=4`);
        const result = await response.json();

        if (result.relatedProducts && result.relatedProducts.length > 0) {
          setRelatedProducts(result.relatedProducts);
        } else {
          // Fallback to random products if no recommendations
          const fallbackResponse = await fetch('http://localhost:5000/product?limit=4');
          const fallbackResult = await fallbackResponse.json();
          if (fallbackResult.products) {
            setRelatedProducts(fallbackResult.products);
          }
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
        // Fallback: try basic product fetch
        try {
          const response = await fetch('http://localhost:5000/product?limit=4');
          const result = await response.json();
          if (result.products) {
            setRelatedProducts(result.products);
          }
        } catch (fallbackError) {
          console.error('Error fetching fallback products:', fallbackError);
        }
      }
    };

    fetchRelatedProducts();
  }, []);

  if (!cartContext) {
    return null;
  }

  const { cartItems, removeFromCart, updateQuantity, updatePrice } = cartContext;

  // Helper function to mark product as bargained
  const markProductAsBargained = (productId: string) => {
    try {
      const bargainedProducts = localStorage.getItem(BARGAINED_PRODUCTS_KEY);
      const productIds: string[] = bargainedProducts ? JSON.parse(bargainedProducts) : [];

      if (!productIds.includes(productId)) {
        productIds.push(productId);
        localStorage.setItem(BARGAINED_PRODUCTS_KEY, JSON.stringify(productIds));
      }

      setIsBargainCompleted(true);
    } catch (error) {
      console.error('Error saving bargained product:', error);
    }
  };

  // Helper function to add/remove from wishlist
  const toggleWishlist = () => {
    if (!mainProduct) return;

    try {
      const wishlist = localStorage.getItem(WISHLIST_KEY);
      let wishlistItems: WishlistItem[] = wishlist ? JSON.parse(wishlist) : [];

      if (isInWishlist) {
        // Remove from wishlist
        wishlistItems = wishlistItems.filter(item => item._id !== mainProduct._id);
      } else {
        // Add to wishlist
        wishlistItems.push({
          _id: mainProduct._id,
          name: mainProduct.name,
          price: mainProduct.price,
          images: mainProduct.images,
          addedAt: new Date().toISOString()
        });
      }

      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistItems));
      setIsInWishlist(!isInWishlist);

      // Show feedback
      if (!isInWishlist) {
        alert('✓ Added to Wishlist!');
      } else {
        alert('✓ Removed from Wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Error updating wishlist');
    }
  };



  const handleSmartBargainingClick = () => {
    if (!mainProduct) return;
    setIsBargainOpen(true);
    setBargainAttempts(3);
    setOfferInput('');
    setIsProcessingOffer(false);
    setBargainMessages([
      {
        sender: 'ai',
        text: "Try your offer, let's see if the AI agrees!",
      },
    ]);
  };

  const closeBargainModal = () => {
    setIsBargainOpen(false);
    setOfferInput('');
    setIsProcessingOffer(false);
  };

  const handleSendOffer = async () => {
    if (!mainProduct || isProcessingOffer) return;
    if (bargainAttempts <= 0) {
      alert('No bargaining attempts left. Please try again later.');
      return;
    }

    const offerValue = parseFloat(offerInput);
    if (Number.isNaN(offerValue) || offerValue <= 0) {
      alert('Please enter a valid amount in $.');
      return;
    }

    // Add user message to chat
    setBargainMessages((prev) => [...prev, { sender: 'user', text: `$${offerValue.toFixed(2)}` }]);
    setOfferInput('');
    setIsProcessingOffer(true);

    try {
      // Call AI bargaining API
      const response = await fetch('http://localhost:5000/bargain/negotiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: mainProduct.name,
          originalPrice: mainProduct.price,
          userOffer: offerValue,
          attemptNumber: 4 - bargainAttempts, // Convert remaining to attempt number
          conversationHistory: bargainMessages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          }))
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add AI response to chat
        setBargainMessages((prev) => [...prev, { sender: 'ai', text: data.aiResponse }]);

        // Update attempts
        if (data.accepted) {
          setBargainAttempts(0);
          markProductAsBargained(mainProduct._id); // Lock bargaining and save to localStorage

          // Update the product price in cart if deal accepted
          if (data.finalPrice && data.finalPrice < mainProduct.price) {
            // Update the price in the cart
            updatePrice(mainProduct._id, data.finalPrice);

            // Show success message
            setTimeout(() => {
              alert(`🎉 Congratulations! Price updated to $${data.finalPrice.toFixed(2)} (${data.discountPercentage}% off)`);
            }, 500);
          }
        } else {
          setBargainAttempts((prev) => Math.max(0, prev - 1));
        }
      } else {
        throw new Error(data.error || 'Bargaining failed');
      }
    } catch (error) {
      console.error('Bargaining error:', error);

      // Fallback to tiered discount logic if API fails
      let maxDiscountPercent;
      let targetDiscountPercent;

      if (mainProduct.price < 50) {
        maxDiscountPercent = 0.05;
        targetDiscountPercent = 0.03;
      } else if (mainProduct.price >= 50 && mainProduct.price <= 100) {
        maxDiscountPercent = 0.10;
        targetDiscountPercent = 0.07;
      } else {
        maxDiscountPercent = 0.15;
        targetDiscountPercent = 0.12;
      }

      const targetPrice = mainProduct.price * (1 - targetDiscountPercent);
      const minPrice = mainProduct.price * (1 - maxDiscountPercent);
      let aiResponse = '';
      let accepted = false;
      let finalPrice = mainProduct.price;

      if (offerValue >= mainProduct.price) {
        aiResponse = 'Great! Your offer matches the listing price. Deal accepted. 🎉';
        accepted = true;
        finalPrice = offerValue;
      } else if (offerValue >= targetPrice) {
        aiResponse = `Deal accepted! You can buy it for $${offerValue.toFixed(2)}. 🤝`;
        accepted = true;
        finalPrice = offerValue;
      } else if (bargainAttempts - 1 <= 0) {
        aiResponse = `Looks like we can only go as low as $${minPrice.toFixed(2)}. Offer accepted at that price. ✨`;
        accepted = true;
        finalPrice = minPrice;
      } else {
        aiResponse = `Hmm, that's a bit low. Can you try something closer to $${targetPrice.toFixed(2)}? 💰`;
      }

      setBargainMessages((prev) => [...prev, { sender: 'ai', text: aiResponse }]);
      setBargainAttempts((prev) => (accepted ? 0 : Math.max(0, prev - 1)));

      // Update price in fallback mode too
      if (accepted && finalPrice < mainProduct.price) {
        markProductAsBargained(mainProduct._id); // Lock bargaining and save to localStorage
        updatePrice(mainProduct._id, finalPrice);
        setTimeout(() => {
          const discount = ((mainProduct.price - finalPrice) / mainProduct.price * 100).toFixed(1);
          alert(`🎉 Congratulations! Price updated to $${finalPrice.toFixed(2)} (${discount}% off)`);
        }, 500);
      }
    } finally {
      setIsProcessingOffer(false);
    }
  };

  // Submit Review Handler
  const handleSubmitReview = async () => {
    if (!mainProduct || userRating === 0) return;

    setSubmittingRating(true);

    const storedUser = localStorage.getItem('userInfo');
    let reviewUserId = '';
    let reviewUserName = 'Anonymous';

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        reviewUserId = user._id || user.id || '';
        reviewUserName = user.name || user.email?.split('@')[0] || 'Anonymous';
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }

    if (!reviewUserId) {
      alert('Please login to submit a review');
      setSubmittingRating(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/product/${mainProduct._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: reviewUserId,
          rating: userRating,
          comment: ratingComment,
          userName: reviewUserName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProductRating(data.newRating);
        setProductReviewCount(data.reviewCount);

        const newReview: Review = {
          _id: data.review._id,
          productId: mainProduct._id,
          userId: reviewUserId,
          rating: userRating,
          comment: ratingComment,
          userName: reviewUserName,
          createdAt: new Date().toISOString(),
        };
        setReviews(prev => [newReview, ...prev]);

        alert('Review submitted successfully!');
      } else {
        alert(data.message || 'Could not submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Error submitting review. Please try again.');
    } finally {
      setSubmittingRating(false);
      setShowRatingModal(false);
      setUserRating(0);
      setRatingComment('');
    }
  };

  // Redirect to home if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add items to proceed to checkout</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Product Section */}
        {mainProduct && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Product Images */}
              <div>
                {/* Main Image */}
                <div className="bg-gray-200 rounded-lg overflow-hidden mb-4 flex items-center justify-center h-96">
                  {/* Show color variant image if selected, otherwise show normal product image */}
                  {selectedColor !== null && mainProduct.colorVariants && mainProduct.colorVariants[selectedColor] ? (
                    <img
                      src={mainProduct.colorVariants[selectedColor].image}
                      alt={`${mainProduct.name} - ${mainProduct.colorVariants[selectedColor].colorName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : mainProduct.images && mainProduct.images.length > 0 ? (
                    <img
                      src={typeof mainProduct.images[selectedImageIndex] === 'string'
                        ? mainProduct.images[selectedImageIndex]
                        : (mainProduct.images[selectedImageIndex] as { url?: string })?.url || ''}
                      alt={mainProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-xl">No image</div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {mainProduct.images && mainProduct.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {mainProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-20 h-20 rounded overflow-hidden border-2 flex-shrink-0 ${selectedImageIndex === idx ? 'border-teal-600' : 'border-gray-300'
                          }`}
                      >
                        <img
                          src={typeof img === 'string' ? img : (img as { url?: string })?.url || ''}
                          alt={`thumb-${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product Details */}
              <div className="flex flex-col justify-between">
                {/* Top Section */}
                <div>
                  {/* In Stock Badge */}
                  <div className="inline-block bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold mb-3">
                    ✓ In Stock
                  </div>

                  {/* Product Name & Rating */}
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{mainProduct.name}</h1>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-yellow-400 text-lg">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < Math.floor(productRating) ? '★' : '☆'}</span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {productRating.toFixed(1)} ({productReviewCount} reviews)
                    </span>
                  </div>

                  {/* Color Selector */}
                  {mainProduct.colorVariants && mainProduct.colorVariants.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-700">Color:</span>
                        <span className="text-sm text-gray-600">
                          {selectedColor !== null ? mainProduct.colorVariants[selectedColor].colorName : 'Original'}
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        {/* Original/Default button */}
                        <button
                          onClick={() => setSelectedColor(null)}
                          className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center text-sm font-bold ${selectedColor === null
                            ? 'border-teal-600 ring-2 ring-teal-200 scale-110 bg-gray-100'
                            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                            }`}
                          title="Original"
                        >
                          ✓
                        </button>
                        {mainProduct.colorVariants.map((variant, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedColor(idx)}
                            className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === idx
                              ? 'border-teal-600 ring-2 ring-teal-200 scale-110'
                              : 'border-gray-300 hover:border-gray-400'
                              }`}
                            style={{ backgroundColor: variant.colorCode }}
                            title={variant.colorName}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Seller Info with Chat Button */}
                  {chatSellerName && (
                    <div className="flex items-center justify-between mb-4 bg-gray-50 px-3 py-2 rounded-lg">
                      <p className="text-gray-600 text-sm">
                        Sold by <span className="font-semibold text-gray-800">{chatSellerName}</span>
                      </p>
                      <button
                        onClick={() => {
                          if (!userId) {
                            alert('Please login to chat with seller');
                            return;
                          }
                          setShowChat(true);
                        }}
                        className="px-3 py-1.5 bg-teal-50 text-teal-600 rounded text-xs font-medium hover:bg-teal-100 transition-colors flex items-center gap-1"
                      >
                        <FaComments /> Chat with Seller
                      </button>
                    </div>
                  )}

                  {/* Price Section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-1">
                      <span className="text-4xl font-bold text-teal-600">${mainProduct.price.toFixed(2)}</span>
                    </div>
                    <p className="text-gray-600 text-sm">Inclusive of all taxes</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6 text-sm text-gray-700">
                    <p>✓ Premium quality with best price guaranteed</p>
                    <p>✓ Free returns & easy exchange</p>
                    <p>✓ Same day delivery available</p>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-sm font-medium text-gray-700">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
                      <button
                        onClick={() => updateQuantity(mainProduct._id, Math.max(1, mainProduct.quantity - 1))}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-200"
                      >
                        −
                      </button>
                      <span className="px-4 py-2 font-medium border-l border-r border-gray-300">
                        {mainProduct.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(mainProduct._id, mainProduct.quantity + 1)}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Buy Now Button */}
                  <button
                    onClick={() => {
                      // Check authentication before navigating
                      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                      if (!isLoggedIn) {
                        // Save current path for redirect after login
                        localStorage.setItem('redirectAfterLogin', '/buy-now');
                        alert('Please login or create an account to place an order.');
                        navigate('/login');
                      } else {
                        navigate('/buy-now');
                      }
                    }}
                    className="w-full bg-teal-600 text-white font-bold py-4 rounded-lg hover:bg-teal-700 transition-colors text-lg"
                  >
                    Buy Now
                  </button>

                  {/* Features Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleSmartBargainingClick}
                      disabled={isBargainCompleted}
                      className={`px-3 py-2 border text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${isBargainCompleted
                        ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'border-teal-600 text-teal-600 hover:bg-teal-50'
                        }`}
                      title={isBargainCompleted ? 'Bargaining completed for this product' : 'Negotiate the price with AI'}
                    >
                      <span></span> {isBargainCompleted ? '✓ Bargained' : 'Smart Bargaining'}
                    </button>
                    <button
                      onClick={toggleWishlist}
                      className={`px-3 py-2 border text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${isInWishlist
                        ? 'border-red-300 bg-red-50 text-red-600'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <FaHeart style={{ fill: isInWishlist ? 'currentColor' : 'none' }} /> {isInWishlist ? 'Saved' : 'Wishlist'}
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(mainProduct._id)}
                    className="w-full px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaTrash /> Remove from cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Reviews Section */}
        {mainProduct && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Customer Reviews ({productReviewCount})
              </h2>
              <button
                onClick={() => setShowRatingModal(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 text-sm"
              >
                <FaStar /> Write a Review
              </button>
            </div>

            {loadingReviews ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews yet for this product.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-semibold text-sm">
                          {review.userName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium text-gray-800">{review.userName}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                          size={12}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other Items in Cart */}
        {cartItems.length > 1 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Other Items in Cart ({cartItems.length - 1})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cartItems.slice(1).map((item) => (
                <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex gap-3 mb-3">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={typeof item.images[0] === 'string' ? item.images[0] : (item.images[0] as { url?: string })?.url || ''}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.name}</h4>
                      <p className="text-teal-600 font-bold text-sm">$ {item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products Recommendations */}
        {relatedProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-bold text-gray-900"> Product Recommendations</h2>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Based on your history</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((product: Product) => {
                const imageUrl = product.images?.[0] || 'https://via.placeholder.com/250';

                return (
                  <div key={product._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group">
                    {/* Image Container */}
                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                      {product.discount && product.discount > 0 && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          -{product.discount}%
                        </div>
                      )}
                      {product.predictedRating && (
                        <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                          ⭐ {product.predictedRating.toFixed(1)}
                        </div>
                      )}
                      <img
                        src={typeof imageUrl === 'string' ? imageUrl : (imageUrl as { url?: string })?.url || ''}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{product.name}</h3>

                      {/* Show recommendation reason */}
                      {product.reason && (
                        <p className="text-xs text-blue-600 mb-2 italic">{product.reason}</p>
                      )}

                      {/* Rating */}
                      {product.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-yellow-400 text-sm">★</span>
                          <span className="text-xs text-gray-600">{product.rating.toFixed(1)}</span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="mb-3">
                        <p className="text-teal-600 font-bold text-lg">$ {product.price.toFixed(2)}</p>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => {
                          if (cartContext) {
                            cartContext.addToCart({
                              _id: product._id,
                              name: product.name,
                              price: product.price,
                              quantity: 1,
                              images: product.images || [],
                            });
                          }
                        }}
                        className="w-full bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-yellow-400">4.5</p>
                <p className="text-sm text-gray-600">out of 5</p>
              </div>
              <div className="flex text-yellow-400 text-2xl">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
            </div>
          </div>

          {/* Sample Reviews */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            {[1, 2, 3].map((review) => (
              <div key={review} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                  A
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm">John Doe</p>
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">2 days ago</p>
                  <p className="text-sm text-gray-700">Great product! Excellent quality and fast delivery. Highly satisfied with the purchase and would definitely recommend.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {isBargainOpen && mainProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b bg-gradient-to-r from-white to-emerald-50">
              <div>
                <p className="text-sm uppercase tracking-widest text-gray-400 font-semibold">Bargain with AI</p>
                <h3 className="text-2xl font-bold text-gray-900">Let's Make a Deal - Smart Pricing Just for You!</h3>
              </div>
              <button
                onClick={closeBargainModal}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-xl"
                aria-label="Close bargaining modal"
              >
                ×
              </button>
            </div>

            <div className="px-8 py-8 space-y-6 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100">
                    {mainProduct.images && mainProduct.images.length > 0 ? (
                      <img
                        src={typeof mainProduct.images[0] === 'string'
                          ? mainProduct.images[0]
                          : (mainProduct.images[0] as { url?: string })?.url || ''}
                        alt={mainProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Product ID: {mainProduct._id}</p>
                    <h4 className="text-xl font-semibold text-gray-900">{mainProduct.name}</h4>
                    <p className="text-sm text-gray-500">Original Price</p>
                    <p className="text-2xl font-bold text-teal-600">$ {mainProduct.price.toFixed(0)}</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">Bargaining Attempts</p>
                  <div className="flex items-center justify-center gap-3">
                    {Array.from({ length: 3 }).map((_, index) => {
                      const attemptAvailable = bargainAttempts >= 3 - index;
                      return (
                        <span
                          key={index}
                          className={`w-10 h-10 rounded-lg border flex items-center justify-center text-xl ${attemptAvailable ? 'border-teal-500 text-teal-500' : 'border-gray-200 text-gray-300'
                            }`}
                        >
                          ✓
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {bargainAttempts > 0 ? `${bargainAttempts} attempt(s) left` : 'Bargain locked in'}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="h-64 overflow-y-auto space-y-4">
                  {bargainMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.sender === 'ai'
                          ? 'bg-gray-100 text-gray-700 rounded-bl-none'
                          : 'bg-teal-600 text-white rounded-br-none'
                          }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {bargainMessages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm">Start bargaining to see messages here.</div>
                  )}
                </div>
                <div className="mt-6 flex flex-col md:flex-row gap-3">
                  <input
                    type="number"
                    placeholder="Enter your offer in $..."
                    value={offerInput}
                    onChange={(e) => setOfferInput(e.target.value)}
                    disabled={bargainAttempts === 0}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                  />
                  <button
                    onClick={handleSendOffer}
                    disabled={bargainAttempts === 0 || isProcessingOffer}
                    className="w-full md:w-40 bg-teal-500 text-white font-semibold rounded-xl px-4 py-3 hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {isProcessingOffer ? 'Processing...' : 'Send Offer'}
                  </button>
                </div>
                {bargainAttempts === 0 && (
                  <p className="mt-3 text-xs text-gray-500">Offer accepted or attempts exhausted. Close the assistant to restart.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {showChat && chatSellerId && (
        <ChatWidget
          sellerId={chatSellerId}
          sellerName={chatSellerName}
          userId={userId}
          userName={userName}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setShowRatingModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Rate This Product</h3>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setUserRating(star)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  {star <= (hoverRating || userRating) ? (
                    <FaStar className="text-yellow-400" />
                  ) : (
                    <FaRegStar className="text-gray-300" />
                  )}
                </button>
              ))}
            </div>

            <p className="text-center text-gray-600 mb-4">
              {userRating === 0 && 'Click to rate'}
              {userRating === 1 && 'Poor'}
              {userRating === 2 && 'Fair'}
              {userRating === 3 && 'Good'}
              {userRating === 4 && 'Very Good'}
              {userRating === 5 && 'Excellent!'}
            </p>

            {/* Comment */}
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Write a review (optional)..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 resize-none h-24 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={userRating === 0 || submittingRating}
                className="flex-1 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingRating ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
