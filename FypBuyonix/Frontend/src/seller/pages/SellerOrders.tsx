import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../../assets/logo.png";

interface OrderItem {
  productId: string;
  productName: string;
  category?: string;
  price: number;
  quantity: number;
  subtotal?: number;
  image?: string | null;
}

interface Order {
  _id?: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  orderDate: string;
  createdAt: string;
}

const SellerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  const fetchSellerOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get seller ID from localStorage or session
      const sellerId = localStorage.getItem('sellerId');

      if (!sellerId) {
        setError('Please log in as a seller');
        setLoading(false);
        return;
      }

      const res = await fetch(`http://localhost:5000/order/seller/${sellerId}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await res.json();
      console.log('Orders API response:', data);

      if (data && data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        console.log(`Loaded ${data.orders.length} orders for seller`);
      } else {
        console.warn('Invalid response format or no orders found:', data);
        setOrders([]);
      }
    } catch (err) {
      console.error('Orders fetch error', err);
      setError(err instanceof Error ? err.message : 'Unable to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-600';
      case 'shipped':
        return 'bg-blue-100 text-blue-600';
      case 'confirmed':
        return 'bg-orange-100 text-orange-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed top-0 left-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="BUYONIX" className="h-10 w-10" />
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="p-4">
          <div className="space-y-2">
            <Link
              to="/seller-dashboard"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span className="text-xl">📊</span>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/seller-products"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span className="text-xl">📦</span>
              <span>Products</span>
            </Link>

            <Link
              to="/seller-orders"
              className="flex items-center space-x-3 px-4 py-3 bg-teal-600 text-white rounded-lg font-medium"
            >
              <span className="text-xl">📋</span>
              <span>Orders</span>
            </Link>

            <Link
              to="/seller-analytics"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span className="text-xl">📈</span>
              <span>Analytics</span>
            </Link>

            <Link
              to="/seller-payouts"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span className="text-xl">💰</span>
              <span>Payouts</span>
            </Link>

            <Link
              to="/seller-chats"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span className="text-xl">💬</span>
              <span>Chats</span>
            </Link>
          </div>
        </nav>

        {/* Logout and Back to Shopping */}
        <div className="absolute bottom-6 left-4 right-4 space-y-2">
          <button
            onClick={async () => {
              try {
                await fetch('http://localhost:5000/seller/logout', {
                  method: 'POST',
                  credentials: 'include',
                });
              } catch (error) {
                console.error('Logout error:', error);
              }
              localStorage.removeItem('sellerInfo');
              localStorage.removeItem('sellerId');
              navigate('/become-seller');
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
          <Link
            to="/"
            className="flex items-center justify-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300"
          >
            <span>←</span>
            <span>Back to Shopping</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 ml-64">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-600 mt-1">View and manage your orders</p>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading orders...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600">Your orders will appear here once customers start purchasing your products.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Address</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id || order.orderNumber} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{order.orderNumber}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{order.customerPhone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{order.customerAddress}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={item.productId || index} className="text-sm text-gray-900">
                              <span className="font-medium">{item.productName}</span>
                              <span className="text-gray-500 ml-2">(Qty: {item.quantity})</span>
                            </div>
                          ))}
                          {order.items.length > 1 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Total: {order.items.length} item(s)
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">PKR {order.total.toFixed(0)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadgeClass(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerOrders;
