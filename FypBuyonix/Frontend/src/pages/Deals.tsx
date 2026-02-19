import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContextType';

interface ProductImageObject { url?: string }

interface Product {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  images?: Array<string | ProductImageObject>;
  sellerId?: string | { _id?: string; storeName?: string };
  rating?: number;
  reviewCount?: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
  hasNextPage: boolean;
}

type DealType = 'flash' | 'clearance' | 'bestsellers' | 'daily';
type CategoryFilter = 'all' | 'electronics' | 'fashion' | 'footwear' | 'accessories';

const Deals: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDealType, setActiveDealType] = useState<DealType>('flash');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState({ hours: 12, minutes: 34, seconds: 55 });
  const cartContext = useContext(CartContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset when it reaches 0
          return { hours: 12, minutes: 34, seconds: 55 };
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  const fetchProducts = useCallback(async (page: number) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(
        `http://localhost:5000/product?page=${page}&limit=20`,
        { credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          setProducts(Array.isArray(data.products) ? data.products : []);
        } else {
          setProducts((prev) => [...prev, ...(Array.isArray(data.products) ? data.products : [])]);
        }
        setPagination(data.pagination);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Fetch products error', err);
      setError('Unable to load products');
    } finally {
      if (page === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchProducts(1);
    }
  }, [fetchProducts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (
            pagination &&
            pagination.hasNextPage &&
            !loadingMore &&
            !loading
          ) {
            fetchProducts(currentPage + 1);
          }
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [pagination, currentPage, loadingMore, loading, fetchProducts]);

  // Filter products based on deal type
  const getFilteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by deal type
    switch (activeDealType) {
      case 'flash':
        // Products with discount >= 15%
        filtered = filtered.filter(p => p.discount && p.discount >= 15);
        break;
      case 'clearance':
        // Products with discount >= 50%
        filtered = filtered.filter(p => p.discount && p.discount >= 50);
        break;
      case 'bestsellers':
        // Products with high rating and reviews
        filtered = filtered.filter(p =>
          (p.rating && p.rating >= 4.5) || (p.reviewCount && p.reviewCount >= 100)
        );
        break;
      case 'daily':
        // Products with any discount
        filtered = filtered.filter(p => p.discount && p.discount > 0);
        break;
    }

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p =>
        p.category && p.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Sort by discount (highest first)
    filtered.sort((a, b) => {
      const discountA = a.discount || 0;
      const discountB = b.discount || 0;
      return discountB - discountA;
    });

    return filtered;
  }, [products, activeDealType, activeCategory]);

  // Product card component
  const ProductCard = ({ product }: { product: Product }) => {
    const imageUrl = product.images && product.images.length > 0
      ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
      : 'https://via.placeholder.com/300';
    const discountPercent = product.discount && product.discount > 0
      ? `-${product.discount}%`
      : null;

    const handleAddToCart = () => {
      if (cartContext) {
        cartContext.addToCart({
          _id: product._id,
          name: product.name,
          price: product.price || 0,
          quantity: 1,
          images: product.images,
        });
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow relative">
        <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
          {discountPercent && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
              {discountPercent}
            </div>
          )}
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">{product.name}</h3>
          <div className="flex items-center mb-2">
            <span className="text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i}>{i < Math.floor(product.rating || 0) ? '★' : '☆'}</span>
              ))}
            </span>
            <span className="text-sm text-gray-600 ml-1">
              ({product.reviewCount || 0})
            </span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-bold text-gray-900">${product.price?.toFixed(2) || 'N/A'}</span>
              {product.originalPrice && product.originalPrice > (product.price || 0) && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full bg-teal-600 text-white py-2 rounded-md font-medium hover:bg-teal-700 transition-colors"
          >
            Add to cart
          </button>
        </div>
      </div>
    );
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with ${email}! You'll receive exclusive deals.`);
      setEmail('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="py-12 text-center text-gray-600">Loading deals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="py-12 text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Coral Header Banner */}
      <div className="bg-gradient-to-r from-coral-500 to-pink-500 text-white py-12 pt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Hot Deals & Offers</h1>
              <p className="text-xl text-pink-50">Save big on your favorite products with our exclusive deals.</p>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4">
              <span className="text-2xl">⏱️</span>
              <div>
                <p className="text-sm text-pink-100">Flash Deals end in</p>
                <p className="text-2xl font-bold">
                  {String(countdown.hours).padStart(2, '0')}:
                  {String(countdown.minutes).padStart(2, '0')}:
                  {String(countdown.seconds).padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation/Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveDealType('flash')}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${activeDealType === 'flash'
                ? 'border-coral-500 text-coral-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-coral-600'
                }`}
            >
              <span className="text-xl">⚡</span>
              <span>Flash Deals</span>
            </button>
            <button
              onClick={() => setActiveDealType('clearance')}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${activeDealType === 'clearance'
                ? 'border-coral-500 text-coral-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-coral-600'
                }`}
            >
              <span className="text-xl">🔄</span>
              <span>Clearance</span>
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">Up to 70% off</span>
            </button>
            <button
              onClick={() => setActiveDealType('bestsellers')}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${activeDealType === 'bestsellers'
                ? 'border-coral-500 text-coral-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-coral-600'
                }`}
            >
              <span className="text-xl">⭐</span>
              <span>Best Sellers</span>
              <span className="text-xs text-gray-500">Top deals</span>
            </button>
            <button
              onClick={() => setActiveDealType('daily')}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${activeDealType === 'daily'
                ? 'border-coral-500 text-coral-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-coral-600'
                }`}
            >
              <span className="text-xl">📅</span>
              <span>Daily Deals</span>
              <span className="text-xs text-gray-500">New deals every day</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flash Deals Section */}
      {activeDealType === 'flash' && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-coral-600 text-xl">⚡</span>
              <h2 className="text-2xl font-bold text-gray-800">Flash Deals</h2>
            </div>
            <Link
              to="/shop"
              className="text-coral-600 hover:text-coral-700 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {getFilteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {getFilteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No flash deals available at the moment.</p>
            </div>
          )}
        </div>
      )}

      {/* Deals by Category Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Deals by Category</h2>

        {/* Category Filter */}
        <div className="flex items-center gap-4 mb-6 overflow-x-auto scrollbar-hide pb-2">
          {(['all', 'electronics', 'fashion', 'footwear', 'accessories'] as CategoryFilter[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${activeCategory === cat
                ? 'bg-coral-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {cat === 'all' ? 'All Deals' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {getFilteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        {getFilteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No deals available in this category at the moment.</p>
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div
          ref={observerTarget}
          className="w-full py-8 flex justify-center mt-12"
        >
          {loadingMore && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-coral-500"></div>
              <span className="text-gray-600">Loading more deals...</span>
            </div>
          )}
        </div>

        {/* End of list message */}
        {pagination && !pagination.hasNextPage && products.length > 0 && (
          <div className="w-full text-center py-8 text-gray-500">
            You've reached the end of all deals
          </div>
        )}
      </div>

      {/* Newsletter Subscription Footer */}
      <div className="bg-teal-600 text-white py-16 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Don't Miss Out!</h2>
          <p className="text-xl text-teal-50 mb-8">
            Subscribe to our newsletter and get exclusive deals delivered to your inbox
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="bg-coral-500 hover:bg-coral-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .from-coral-500 {
          background-color: #ff6b6b;
        }
        .to-pink-500 {
          background-color: #ec4899;
        }
        .bg-coral-500 {
          background-color: #ff6b6b;
        }
        .hover\\:bg-coral-600:hover {
          background-color: #ff5252;
        }
        .text-coral-600 {
          color: #ff6b6b;
        }
        .hover\\:text-coral-700:hover {
          color: #ff5252;
        }
        .border-coral-500 {
          border-color: #ff6b6b;
        }
        .hover\\:text-coral-600:hover {
          color: #ff6b6b;
        }
        .text-pink-50 {
          color: #fdf2f8;
        }
        .text-pink-100 {
          color: #fce7f3;
        }
      `}</style>
    </div>
  );
};

export default Deals;

