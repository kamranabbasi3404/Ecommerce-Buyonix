import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContextType';
import Chatbot from '../components/Chatbot';
import Recommendations from '../components/Recommendations';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: string[];
  rating: number;
  reviewCount: number;
  category: string;
  sellerId: {
    storeName: string;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
  hasNextPage: boolean;
}

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const initialLoadDone = useRef(false);

  // Check if user needs to be redirected after login (for Google OAuth)
  useEffect(() => {
    const redirectPath = localStorage.getItem('redirectAfterLogin');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (redirectPath && isLoggedIn) {
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
    }
  }, [navigate]);

  // Fetch products with pagination
  const fetchProducts = useCallback(async (page: number, limit: number = 5) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(
        `http://localhost:5000/product?page=${page}&limit=${limit}`,
        {
          credentials: 'include',
        }
      );

      const result = await response.json();

      if (result.success) {
        // Append new products if loading more, otherwise replace
        if (page === 1) {
          setProducts(result.products);
        } else {
          setProducts((prev) => [...prev, ...result.products]);
        }

        setPagination(result.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      if (page === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  // Initial load on component mount - load 12 products first
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchProducts(1, 10); // Initial load with 10 products
    }
  }, [fetchProducts]);

  // Handle Load More button click
  const handleLoadMore = () => {
    if (pagination && pagination.hasNextPage && !loadingMore) {
      fetchProducts(currentPage + 1, 5); // Load 5 more products
    }
  };



  const ProductCard = ({ product }: { product: Product }) => {
    const cartContext = useContext(CartContext);
    const discountPercent = product.discount > 0 ? `-${product.discount}%` : null;
    const imageUrl = product.images?.[0] || 'https://via.placeholder.com/300';

    const handleAddToCart = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent modal from opening
      if (cartContext) {
        cartContext.addToCart({
          _id: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          images: product.images,
        });
      }
    };

    const handleCardClick = () => {
      navigate(`/product/${product._id}`);
    };

    return (
      <div
        onClick={handleCardClick}
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
              <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
              {product.originalPrice > product.price && (
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative w-full h-[80vh] bg-black -mt-20 pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{
            backgroundImage: "url('/src/assets/hero.jpeg')",
          }}
        ></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 h-full flex flex-col justify-center text-white">
          <span className="px-4 py-1 bg-white text-black rounded-full w-fit mb-4 font-medium">
            🎉 Welcome to Buyonix
          </span>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Discover Amazing <br /> Deals on Everything <br /> You Love
          </h1>

          <p className="text-lg md:text-xl text-gray-200 max-w-2xl">
            Shop with confidence using AI-powered features: Visual Search,
            Smart Bargaining, and personalized recommendations tailored just for you.
          </p>

          <div className="mt-6 flex gap-4">
            <Link to="/shop">
              <button className="px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600">
                Shop Now

              </button>
            </Link>
            <Link to="/about">
              <button className="px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white hover:text-black">
                Explore Features
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Products Sections */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* AI Recommendations Section */}
        <Recommendations />

        {/* All Products Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">All Products</h2>
              <p className="text-gray-600">Browse all products from our trusted sellers</p>
            </div>
            <Link to="/shop">
              <button className="text-teal-600 hover:text-teal-700 font-medium">View All in Shop</button>
            </Link>
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              {/* Load More Button */}
              <div className="w-full py-8 flex justify-center">
                {loadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                    <span className="text-gray-600">Loading more products...</span>
                  </div>
                ) : pagination && pagination.hasNextPage ? (
                  <button
                    onClick={handleLoadMore}
                    className="px-8 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-md"
                  >
                    Load More Products
                  </button>
                ) : products.length > 0 ? (
                  <div className="text-gray-500">
                    You've reached the end of the products list
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="w-full text-center py-12 text-gray-500">
              No products available yet. Check back soon!
            </div>
          )}
        </div>


        {/* Why Choose Buyonix Section */}
        <div className="bg-white rounded-2xl shadow-lg p-12 mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Why Choose Buyonix?</h2>
            <p className="text-gray-600">Experience the next generation of e-commerce with cutting-edge AI technology</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">📷</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Visual Search</h3>
              <p className="text-gray-600">Upload a photo and find similar products instantly with AI-powered image recognition</p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Bargaining</h3>
              <p className="text-gray-600">Negotiate with our AI to get the best possible price on your favorite items</p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 AI Assistant</h3>
              <p className="text-gray-600">Get instant help in English or Roman English anytime you need it</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chatbot Button */}
      {!isChatbotOpen && (
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all hover:scale-110"
          aria-label="Open chatbot"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* Chatbot Component */}
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </div>
  );
};

export default Home;

