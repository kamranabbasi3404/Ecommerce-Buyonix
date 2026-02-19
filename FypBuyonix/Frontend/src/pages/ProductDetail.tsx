import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContextType';
import { FaArrowLeft, FaStar, FaRegStar, FaShoppingCart, FaComments } from 'react-icons/fa';
import ChatWidget from '../components/ChatWidget';

interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    images?: string[];
    rating?: number;
    reviewCount?: number;
    category?: string;
    sellerId?: {
        _id?: string;
        storeName?: string;
    };
    colorVariants?: Array<{
        colorName: string;
        colorCode: string;
        image: string;
    }>;
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

const ProductDetail = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const cartContext = useContext(CartContext);

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState<number | null>(null);

    // Rating states
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);

    // Related products state
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    // Reviews state
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    // Chat state
    const [showChat, setShowChat] = useState(false);
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');

    // Bargain states
    const [isBargainOpen, setIsBargainOpen] = useState(false);
    const [bargainAttempts, setBargainAttempts] = useState(3);
    const [offerInput, setOfferInput] = useState('');
    const [bargainMessages, setBargainMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
    const [isProcessingOffer, setIsProcessingOffer] = useState(false);
    const [bargainedPrice, setBargainedPrice] = useState<number | null>(null);
    const BARGAINED_PRODUCTS_KEY = 'buyonix_bargained_products';
    const BARGAIN_LOCK_DAYS = 10; // Lock expires after 10 days

    // Check if product was already bargained
    const [isBargainCompleted, setIsBargainCompleted] = useState(false);

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

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;

            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/product/${productId}`, {
                    credentials: 'include',
                });

                if (!response.ok) throw new Error('Product not found');

                const data = await response.json();
                if (data.success) {
                    setProduct(data.product);
                } else {
                    throw new Error(data.error || 'Failed to fetch product');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load product');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    // Fetch related products
    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!product?.category) return;

            try {
                const response = await fetch(
                    `http://localhost:5000/product?category=${encodeURIComponent(product.category)}&limit=6`,
                    { credentials: 'include' }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.products) {
                        // Filter out the current product
                        const filtered = data.products.filter((p: Product) => p._id !== productId).slice(0, 4);
                        setRelatedProducts(filtered);
                    }
                }
            } catch (err) {
                console.error('Error fetching related products:', err);
            }
        };

        fetchRelatedProducts();
    }, [product?.category, productId]);

    // Fetch reviews
    useEffect(() => {
        const fetchReviews = async () => {
            if (!productId) return;

            setLoadingReviews(true);
            try {
                const response = await fetch(
                    `http://localhost:5000/product/${productId}/reviews?limit=10`,
                    { credentials: 'include' }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.reviews) {
                        setReviews(data.reviews);
                    }
                }
            } catch (err) {
                console.error('Error fetching reviews:', err);
            } finally {
                setLoadingReviews(false);
            }
        };

        fetchReviews();
    }, [productId]);

    const handleAddToCart = () => {
        if (!product || !cartContext) return;

        cartContext.addToCart({
            _id: product._id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            images: product.images,
        });
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/checkout');
    };

    const handleSubmitRating = async () => {
        if (!product || userRating === 0) return;

        setSubmittingRating(true);

        // Get user from localStorage
        const storedUser = localStorage.getItem('userInfo');
        let userId = '';
        let userName = 'Anonymous';

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                userId = user._id || user.id || '';
                userName = user.name || user.email?.split('@')[0] || 'Anonymous';
            } catch (e) {
                console.error('Error parsing user:', e);
            }
        }

        if (!userId) {
            alert('Please login to submit a review');
            setSubmittingRating(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/product/${product._id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    userId,
                    rating: userRating,
                    comment: ratingComment,
                    userName,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Update product rating from backend response
                setProduct({
                    ...product,
                    rating: data.newRating,
                    reviewCount: data.reviewCount,
                });

                // Add new review to local state
                const newReview: Review = {
                    _id: data.review._id,
                    productId: product._id,
                    userId,
                    rating: userRating,
                    comment: ratingComment,
                    userName,
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

    // Check if product was already bargained - must be before conditional returns!
    useEffect(() => {
        if (!product?._id) return;
        try {
            const stored = localStorage.getItem(BARGAINED_PRODUCTS_KEY);
            if (stored) {
                let entries = JSON.parse(stored);
                const now = Date.now();
                const expiryMs = BARGAIN_LOCK_DAYS * 24 * 60 * 60 * 1000;

                // Clear old format (plain string array) — this resets all existing locks
                if (entries.length > 0 && typeof entries[0] === 'string') {
                    localStorage.removeItem(BARGAINED_PRODUCTS_KEY);
                    setIsBargainCompleted(false);
                    return;
                }

                // Filter out expired entries (older than 10 days)
                const validEntries = entries.filter(
                    (e: { productId: string; timestamp: number }) => (now - e.timestamp) < expiryMs
                );

                // Clean up expired entries from storage
                if (validEntries.length !== entries.length) {
                    localStorage.setItem(BARGAINED_PRODUCTS_KEY, JSON.stringify(validEntries));
                }

                setIsBargainCompleted(
                    validEntries.some((e: { productId: string }) => e.productId === product._id)
                );
            }
        } catch (error) {
            console.error('Error checking bargained products:', error);
        }
    }, [product?._id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading product...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😔</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }


    // Mark product as bargained (with timestamp for 10-day expiry)
    const markProductAsBargained = (productId: string) => {
        try {
            const stored = localStorage.getItem(BARGAINED_PRODUCTS_KEY);
            let entries: { productId: string; timestamp: number }[] = stored ? JSON.parse(stored) : [];

            // Migrate old format if needed
            if (entries.length > 0 && typeof entries[0] === 'string') {
                entries = (entries as unknown as string[]).map(id => ({ productId: id, timestamp: Date.now() }));
            }

            if (!entries.some(e => e.productId === productId)) {
                entries.push({ productId, timestamp: Date.now() });
                localStorage.setItem(BARGAINED_PRODUCTS_KEY, JSON.stringify(entries));
            }
            setIsBargainCompleted(true);
        } catch (error) {
            console.error('Error saving bargained product:', error);
        }
    };

    const handleSmartBargainingClick = () => {
        if (!product) return;
        setIsBargainOpen(true);
        setBargainAttempts(3);
        setOfferInput('');
        setIsProcessingOffer(false);
        setBargainMessages([{ sender: 'ai', text: "Try your offer, let's see if the AI agrees!" }]);
    };

    const closeBargainModal = () => {
        setIsBargainOpen(false);
        setOfferInput('');
        setIsProcessingOffer(false);
    };

    const handleSendOffer = async () => {
        if (!product || isProcessingOffer) return;
        if (bargainAttempts <= 0) {
            alert('No bargaining attempts left. Please try again later.');
            return;
        }

        const offerValue = parseFloat(offerInput);
        if (Number.isNaN(offerValue) || offerValue <= 0) {
            alert('Please enter a valid amount in $.');
            return;
        }

        setBargainMessages((prev) => [...prev, { sender: 'user', text: `$${offerValue.toFixed(2)}` }]);
        setOfferInput('');
        setIsProcessingOffer(true);

        try {
            const response = await fetch('http://localhost:5000/bargain/negotiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: product.name,
                    originalPrice: product.price,
                    userOffer: offerValue,
                    attemptNumber: 4 - bargainAttempts,
                    conversationHistory: bargainMessages.map(msg => ({
                        role: msg.sender === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.text }]
                    }))
                }),
            });

            const data = await response.json();

            if (data.success) {
                setBargainMessages((prev) => [...prev, { sender: 'ai', text: data.aiResponse }]);
                if (data.accepted) {
                    setBargainAttempts(0);
                    markProductAsBargained(product._id);
                    if (data.finalPrice && data.finalPrice < product.price) {
                        setBargainedPrice(data.finalPrice);
                        setTimeout(() => {
                            alert(`🎉 Congratulations! You can buy at $${data.finalPrice.toFixed(2)} (${data.discountPercentage}% off)`);
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
            // Fallback logic
            let maxDiscountPercent = product.price < 50 ? 0.05 : product.price <= 100 ? 0.10 : 0.15;
            let targetDiscountPercent = product.price < 50 ? 0.03 : product.price <= 100 ? 0.07 : 0.12;
            const targetPrice = product.price * (1 - targetDiscountPercent);
            const minPrice = product.price * (1 - maxDiscountPercent);
            let aiResponse = '';
            let accepted = false;
            let finalPrice = product.price;

            if (offerValue >= product.price) {
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

            if (accepted && finalPrice < product.price) {
                markProductAsBargained(product._id);
                setBargainedPrice(finalPrice);
                setTimeout(() => {
                    const discount = ((product.price - finalPrice) / product.price * 100).toFixed(1);
                    alert(`🎉 Congratulations! You can buy at $${finalPrice.toFixed(2)} (${discount}% off)`);
                }, 500);
            }
        } finally {
            setIsProcessingOffer(false);
        }
    };

    // Use color variant image if selected, otherwise use product image
    const mainImage = selectedColor !== null && product.colorVariants?.[selectedColor]
        ? product.colorVariants[selectedColor].image
        : product.images?.[selectedImage] || 'https://via.placeholder.com/600';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                    >
                        <FaArrowLeft /> Back
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 truncate">{product.name}</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    {/* Left: Images */}
                    <div className="flex flex-col">
                        {/* Main Image */}
                        <div className="bg-gray-100 rounded-lg overflow-hidden shadow-sm mb-2 flex-1 flex items-center justify-center">
                            <img
                                src={mainImage}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain p-2"
                            />
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-teal-600 shadow-md' : 'border-gray-200'
                                            }`}
                                    >
                                        <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        {/* Category */}
                        {product.category && (
                            <span className="inline-block bg-teal-100 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full mb-2 uppercase tracking-wide">
                                {product.category}
                            </span>
                        )}

                        {/* Name */}
                        <h1 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h1>

                        {/* Rating & Reviews */}
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-yellow-400 text-sm">
                                        {i < Math.floor(product.rating || 0) ? '★' : '☆'}
                                    </span>
                                ))}
                            </div>
                            <span className="text-gray-600 text-sm">
                                {product.rating?.toFixed(1) || '0.0'} ({product.reviewCount || 0})
                            </span>

                            {/* Rate This Product Button */}
                            <button
                                onClick={() => setShowRatingModal(true)}
                                className="ml-auto px-3 py-1.5 border border-teal-600 text-teal-600 rounded text-xs font-medium hover:bg-teal-50 transition-colors flex items-center gap-1"
                            >
                                <FaStar className="text-xs" /> Rate
                            </button>
                        </div>

                        {/* Color Variants */}
                        {product.colorVariants && product.colorVariants.length > 0 && (
                            <div className="mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-gray-700">Color:</span>
                                    <span className="text-sm text-gray-600">
                                        {selectedColor !== null ? product.colorVariants[selectedColor].colorName : 'Original'}
                                    </span>
                                </div>
                                <div className="flex gap-2 items-center">
                                    {/* Original/Default button */}
                                    <button
                                        onClick={() => setSelectedColor(null)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center text-xs font-bold ${selectedColor === null
                                            ? 'border-teal-600 ring-2 ring-teal-200 scale-110 bg-gray-100'
                                            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                                            }`}
                                        title="Original"
                                    >
                                        ✓
                                    </button>
                                    {product.colorVariants.map((variant, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedColor(idx)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === idx
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

                        {/* Seller */}
                        {product.sellerId?.storeName && (
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-gray-500 text-sm">
                                    Sold by <span className="font-semibold text-gray-700">{product.sellerId.storeName}</span>
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
                                    <FaComments /> Chat
                                </button>
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl font-bold text-teal-600">${product.price.toFixed(2)}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <>
                                    <span className="text-base text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                        -{product.discount}%
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="mb-4">
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Description</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        {/* Features */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <p className="flex items-center gap-1 text-gray-700">✓ Premium Quality</p>
                                <p className="flex items-center gap-1 text-gray-700">✓ Fast Delivery</p>
                                <p className="flex items-center gap-1 text-gray-700">✓ Easy Returns</p>
                                <p className="flex items-center gap-1 text-gray-700">✓ Secure Payment</p>
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-gray-700 text-sm font-medium">Qty:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    −
                                </button>
                                <span className="px-4 py-2 font-medium border-x border-gray-300">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mb-3">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <FaShoppingCart /> Add to Cart
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors"
                            >
                                Buy Now
                            </button>
                        </div>

                        {/* Smart Bargaining Button */}
                        <button
                            onClick={handleSmartBargainingClick}
                            disabled={isBargainCompleted}
                            className={`w-full py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors ${isBargainCompleted
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600'
                                }`}
                        >
                            🤝 {isBargainCompleted ? 'Bargain Completed' : 'Smart Bargaining'} {bargainedPrice && `- $${bargainedPrice.toFixed(2)}`}
                        </button>
                    </div>
                </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="max-w-7xl mx-auto px-6 py-10 border-t border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Customer Reviews ({product.reviewCount || 0})
                    </h2>
                    <button
                        onClick={() => setShowRatingModal(true)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
                    >
                        <FaStar /> Write a Review
                    </button>
                </div>

                {loadingReviews ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading reviews...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <p className="text-gray-500 text-lg">No reviews yet</p>
                        <p className="text-gray-400 text-sm mt-1">Be the first to review this product!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                                        <p className="text-xs text-gray-400">
                                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="text-lg">
                                                {i < review.rating ? (
                                                    <FaStar className="text-yellow-400" />
                                                ) : (
                                                    <FaRegStar className="text-gray-300" />
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {review.comment && (
                                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                                onClick={handleSubmitRating}
                                disabled={userRating === 0 || submittingRating}
                                className="flex-1 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submittingRating ? 'Submitting...' : 'Submit Rating'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommended Products Section */}
            {relatedProducts.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 py-10 border-t border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((item) => (
                            <div
                                key={item._id}
                                onClick={() => navigate(`/product/${item._id}`)}
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                <div className="h-40 bg-gray-100">
                                    <img
                                        src={item.images?.[0] || 'https://via.placeholder.com/300'}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 text-sm">
                                        {item.name}
                                    </h3>
                                    <div className="flex items-center gap-1 mb-2">
                                        <span className="text-yellow-400 text-sm">★</span>
                                        <span className="text-xs text-gray-500">
                                            {item.rating?.toFixed(1) || '0.0'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-teal-600">
                                            ${item.price.toFixed(2)}
                                        </span>
                                        {item.originalPrice && item.originalPrice > item.price && (
                                            <span className="text-xs text-red-500 font-medium">
                                                -{item.discount}%
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (cartContext) {
                                                cartContext.addToCart({
                                                    _id: item._id,
                                                    name: item.name,
                                                    price: item.price,
                                                    quantity: 1,
                                                    images: item.images,
                                                });
                                            }
                                        }}
                                        className="w-full mt-3 bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bargain Modal */}
            {isBargainOpen && product && (
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
                                        {product.images && product.images.length > 0 ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Product</p>
                                        <h4 className="text-xl font-semibold text-gray-900">{product.name}</h4>
                                        <p className="text-sm text-gray-500">Original Price</p>
                                        <p className="text-2xl font-bold text-teal-600">$ {product.price.toFixed(0)}</p>
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
                                                    className={`w-10 h-10 rounded-lg border flex items-center justify-center text-xl ${attemptAvailable ? 'border-teal-500 text-teal-500' : 'border-gray-200 text-gray-300'}`}
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
                                                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.sender === 'ai' ? 'bg-gray-100 text-gray-700 rounded-bl-none' : 'bg-teal-600 text-white rounded-br-none'}`}
                                            >
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
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
                                        disabled={isProcessingOffer || bargainAttempts === 0}
                                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${isProcessingOffer || bargainAttempts === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
                                    >
                                        {isProcessingOffer ? 'Processing...' : 'Send Offer'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Widget */}
            {showChat && product?.sellerId?._id && (
                <ChatWidget
                    sellerId={product.sellerId._id}
                    sellerName={product.sellerId.storeName || 'Seller'}
                    userId={userId}
                    userName={userName}
                    onClose={() => setShowChat(false)}
                />
            )}
        </div>
    );
};

export default ProductDetail;
