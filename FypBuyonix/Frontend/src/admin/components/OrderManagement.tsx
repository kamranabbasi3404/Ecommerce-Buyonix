import React, { useEffect, useState } from 'react';

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  total: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost:5000/order/admin/all', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await res.json();
      if (data && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Orders fetch error', err);
      setError('Unable to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string | undefined) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-600';
      case 'shipped':
        return 'bg-blue-100 text-blue-600';
      case 'confirmed':
        return 'bg-orange-100 text-orange-600';
      case 'pending':
        return 'bg-gray-100 text-gray-600';
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
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Orders</h1>
        <p className="text-base text-gray-600">
          Track and manage all orders across the platform
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div>
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading orders...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No orders found.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{order.orderNumber}</div></td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-medium">{order.customerInfo.firstName.charAt(0)}</div>
                        <div className="text-sm text-gray-900">{order.customerInfo.firstName} {order.customerInfo.lastName}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap"><div className="text-sm text-gray-600">{order.customerInfo.email}</div></td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-4 whitespace-nowrap"><span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadgeClass(order.orderStatus)}`}>{order.orderStatus}</span></td>
                    <td className="px-4 py-4 whitespace-nowrap"><div className="text-sm font-semibold text-gray-900">PKR {order.total.toFixed(0)}</div></td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium"><div className="flex gap-3"><button className="text-teal-600 hover:text-teal-800 transition-colors">View</button><button className="text-gray-400 hover:text-gray-600 transition-colors">Details</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Showing <span className="font-medium">1</span> to <span className="font-medium">{orders.length}</span> of <span className="font-medium">{orders.length}</span> results</div>
          <div className="flex gap-2"><button className="px-3 py-1 text-sm bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">Previous</button><button className="px-3 py-1 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">Next</button></div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;

