import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContextType';

// Add CSS for scrollbar hiding
const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

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

// Category icon mapping
const getCategoryIcon = (category: string): string => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('electronic')) return '📱';
  if (categoryLower.includes('fashion') || categoryLower.includes('apparel') || categoryLower.includes('clothing')) return '👕';
  if (categoryLower.includes('footwear') || categoryLower.includes('shoe')) return '👟';
  if (categoryLower.includes('accessor')) return '⌚';
  if (categoryLower.includes('sport')) return '⚽';
  if (categoryLower.includes('home')) return '🏠';
  return '📦'; // Default icon
};

const Categories: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cartContext = useContext(CartContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

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

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped: { [key: string]: Product[] } = {};
    products.forEach(product => {
      if (product.category) {
        if (!grouped[product.category]) {
          grouped[product.category] = [];
        }
        grouped[product.category].push(product);
      }
    });
    return grouped;
  }, [products]);

  // Get unique categories
  const categories = useMemo(() => {
    return Object.keys(productsByCategory).sort();
  }, [productsByCategory]);

  // Product card component
  const ProductCard = ({ product }: { product: Product }) => {
    const imageUrl = product.images && product.images.length > 0
      ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
      : 'https://via.placeholder.com/300';
    const discountPercent = product.discount && product.discount > 0 ? `-${product.discount}%` : null;

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
      <div className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow relative">
        <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
          {discountPercent && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
              Sale
            </div>
          )}
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          {product.category && (
            <div className="text-xs text-gray-500 mb-1 capitalize">{product.category}</div>
          )}
          <Link to={`/product/${product._id}`} className="block hover:text-teal-600 transition-colors">
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">{product.name}</h3>
          </Link>
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
            className="w-full bg-teal-600 text-white py-2 rounded-md font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>🛒</span>
            Add to Cart
          </button>
        </div>
      </div>
    );
  };

  // Category card component for horizontal navigation
  const CategoryCard = ({ category, count }: { category: string; count: number }) => {
    const icon = getCategoryIcon(category);
    return (
      <div className="flex-shrink-0 w-56 bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
        <div className="text-5xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 capitalize">{category}</h3>
        <p className="text-sm text-gray-600 mb-4">{count} {count === 1 ? 'product' : 'products'}</p>
        <Link
          to={`/shop?category=${encodeURIComponent(category)}`}
          className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Browse Collection
        </Link>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="py-12 text-center text-gray-600">Loading categories...</div>
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
    <>
      <style>{scrollbarHideStyle}</style>
      <div className="min-h-screen bg-gray-50">
        {/* Header Banner */}
        <div className="bg-teal-600 text-white py-16 pt-24">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold mb-4">Shop by Category</h1>
            <p className="text-xl text-teal-50">Find exactly what you're looking for in our organized collections</p>
          </div>
        </div>

        {/* Horizontal Category Navigation */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => (
              <CategoryCard
                key={category}
                category={category}
                count={productsByCategory[category].length}
              />
            ))}
            {categories.length === 0 && (
              <div className="text-center text-gray-600 py-8 w-full">No categories available</div>
            )}
          </div>
        </div>

        {/* Product Sections by Category */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          {categories.map((category) => {
            const categoryProducts = productsByCategory[category];
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category} className="mb-12">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getCategoryIcon(category)}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 capitalize">{category}</h2>
                      <p className="text-gray-600 mt-1">
                        Explore our collection of {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/shop?category=${encodeURIComponent(category)}`}
                    className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                  >
                    View All
                    <span>→</span>
                  </Link>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}

          {categories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products available</h3>
              <p className="text-gray-600">Products will appear here once they are added.</p>
            </div>
          )}

          {/* Infinite scroll trigger */}
          <div
            ref={observerTarget}
            className="w-full py-8 flex justify-center mt-12"
          >
            {loadingMore && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                <span className="text-gray-600">Loading more products...</span>
              </div>
            )}
          </div>

          {/* End of list message */}
          {pagination && !pagination.hasNextPage && products.length > 0 && (
            <div className="w-full text-center py-8 text-gray-500">
              You've reached the end of all categories
            </div>
          )}
        </div>

        {/* Why Shop by Category Section */}
        <div className="bg-gradient-to-br from-blue-50 to-teal-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">Why Shop by Category?</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Find exactly what you need faster with our organized and easy-to-navigate collections.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Benefit Card 1 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-4xl mb-4">🧭</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Navigation</h3>
                <p className="text-gray-600">Quickly find products in your preferred category.</p>
              </div>

              {/* Benefit Card 2 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Curated Collections</h3>
                <p className="text-gray-600">Hand-picked products within each category.</p>
              </div>

              {/* Benefit Card 3 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Search</h3>
                <p className="text-gray-600">Easily refine your search within every category.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Categories;

