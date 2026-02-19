import React, { useEffect, useState } from 'react';

interface ProductSeller {
  _id?: string;
  storeName?: string;
  businessName?: string;
}

interface Product {
  _id: string;
  name: string;
  sellerId: string | ProductSeller;
  price: number;
  stock: number;
  category: string;
  images?: string[];
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost:5000/product', { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Failed to fetch products (${res.status})`);
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      const e = err as Error;
      console.error('Product fetch error', e);
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        <p className="text-base text-gray-600">
          View and manage all products from all sellers
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search products..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div>
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading products...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No products found.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Image</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Seller</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-4 w-20">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-2xl border border-gray-200">
                        {product.images && product.images.length > 0 ? '�️' : '�'}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="text-sm text-gray-600">{typeof product.sellerId === 'object' && product.sellerId !== null ? (((product.sellerId as ProductSeller).storeName) || ((product.sellerId as ProductSeller).businessName) || ((product.sellerId as ProductSeller)._id)) : product.sellerId}</div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="text-sm font-semibold text-gray-900">{typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : product.price}</div>
                    </td>
                    <td className="px-3 py-4">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-600">{product.stock}</span>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600"><span className="inline-flex px-2 py-1 text-xs bg-gray-100 rounded-md">{product.category}</span></td>
                    <td className="px-3 py-4 text-sm font-medium">
                      <div className="flex gap-3">
                        <button className="text-teal-600 hover:text-teal-800 transition-colors whitespace-nowrap">Edit</button>
                        <button className="text-red-500 hover:text-red-700 transition-colors whitespace-nowrap">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Showing <span className="font-medium">1</span> to <span className="font-medium">{products.length}</span> of <span className="font-medium">{products.length}</span> results</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">Previous</button>
            <button className="px-3 py-1 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;

