import React, { useEffect, useState, useContext, useMemo, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CartContext } from '../context/CartContextType';
import { trackProductView, trackCartAdd } from '../utils/interactionTracking';

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

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const cartContext = useContext(CartContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);

  const query = (searchParams.get('query') || '').trim().toLowerCase();
  const categoryParam = searchParams.get('category') || '';

  // Set initial category from URL param
  useEffect(() => {
    if (categoryParam && !selectedCategories.includes(categoryParam)) {
      setSelectedCategories([categoryParam]);
    }
  }, [categoryParam, selectedCategories]);

  // Fetch products with pagination
  const fetchProducts = useCallback(async (page: number) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(
        `http://localhost:5000/product?page=${page}&limit=20`,
        {
          credentials: 'include',
        }
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

  // Initial load on component mount
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchProducts(1);
    }
  }, [fetchProducts]);

  // Setup IntersectionObserver for infinite scroll
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

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category) {
        cats.add(p.category);
      }
    });
    return Array.from(cats).sort();
  }, [products]);

  // Toggle category selection
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setMinRating(0);
  };

  // Filter products based on search query, categories, and rating
  const filtered = products.filter(p => {
    // Search query filter
    if (query) {
      const name = (p.name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const matchesQuery = name.includes(query) || desc.includes(query) || cat.includes(query);
      if (!matchesQuery) return false;
    }

    // Category filter
    if (selectedCategories.length > 0) {
      if (!p.category || !selectedCategories.includes(p.category)) {
        return false;
      }
    }

    // Rating filter
    if (minRating > 0) {
      const rating = p.rating || 0;
      if (rating < minRating) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-2">Shop All Products</h1>
      <p className="text-gray-600 mb-6">Browse our complete collection of {products.length} products</p>

      <div className="flex gap-6">
        {/* Left Sidebar - Filters */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span>🔍</span> Filters
              </h2>
            </div>

            {/* Categories Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{category}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        ({products.filter(p => p.category === category).length})
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No categories available</p>
                )}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Minimum Rating</h3>
              <div className="space-y-2">
                {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                  <label
                    key={rating}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                  >
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === rating}
                      onChange={() => setMinRating(rating)}
                      className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      {rating} & up
                    </span>
                  </label>
                ))}
                <label
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === 0}
                    onChange={() => setMinRating(0)}
                    className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">All Ratings</span>
                </label>
              </div>
            </div>

            {/* Reset Filters Button */}
            {(selectedCategories.length > 0 || minRating > 0) && (
              <button
                onClick={handleResetFilters}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {loading ? (
            <div className="py-12 text-center text-gray-600">Loading products...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
              {(selectedCategories.length > 0 || minRating > 0) && (
                <button
                  onClick={handleResetFilters}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4 text-sm text-gray-600">
                Showing {filtered.length} of {products.length} products
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {filtered.map((p) => {
                  const imageUrl = p.images && p.images.length > 0 ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url) : 'https://via.placeholder.com/300';
                  const discountPercent = p.discount && p.discount > 0 ? `-${p.discount}%` : null;

                  return (
                    <div key={p._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                      {discountPercent && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                          {discountPercent}
                        </div>
                      )}
                      <Link to={`/product/${p._id}`} onClick={() => trackProductView(p._id)} className="block">
                        <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                      <div className="p-4">
                        {p.category && (
                          <div className="text-xs text-gray-500 mb-1 capitalize">{p.category}</div>
                        )}
                        <Link
                          to={`/product/${p._id}`}
                          onClick={() => trackProductView(p._id)}
                          className="block hover:text-teal-600 transition-colors"
                        >
                          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{p.name}</h3>
                        </Link>
                        {/* Rating - always show stars */}
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400 text-sm">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>{i < Math.floor(p.rating || 0) ? '★' : '☆'}</span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 ml-1">
                            {(p.rating || 0).toFixed(1)} ({p.reviewCount || 0})
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-lg font-bold text-gray-900">${p.price?.toFixed(2) || 'N/A'}</span>
                            {p.originalPrice && p.originalPrice > (p.price || 0) && (
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                ${p.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (cartContext) {
                              // Track cart addition
                              trackCartAdd(p._id);

                              // Add to cart
                              cartContext.addToCart({
                                _id: p._id,
                                name: p.name,
                                price: p.price || 0,
                                quantity: 1,
                                images: p.images,
                              });
                            }
                          }}
                          className="w-full bg-teal-600 text-white py-2 rounded-md font-medium hover:bg-teal-700 transition-colors"
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Infinite scroll trigger element */}
              <div
                ref={observerTarget}
                className="w-full py-8 flex justify-center mt-6"
              >
                {loadingMore && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                    <span className="text-gray-600">Loading more products...</span>
                  </div>
                )}
              </div>

              {/* Message when no more products */}
              {pagination && !pagination.hasNextPage && products.length > 0 && (
                <div className="w-full text-center py-8 text-gray-500">
                  You've reached the end of the products list
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
