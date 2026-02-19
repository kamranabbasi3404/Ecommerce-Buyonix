import React, { useEffect, useState } from 'react';

interface RecentOrder {
  orderNumber: string;
  customerName: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  orderDate: string;
}

const DashboardContent: React.FC = () => {
  const [revenue, setRevenue] = useState<number>(0);
  const [totalSellers, setTotalSellers] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalTickets, setTotalTickets] = useState<number>(0);
  const [openTickets, setOpenTickets] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [ordersRes, sellersRes, productsRes, ticketsRes] = await Promise.allSettled([
          fetch('http://localhost:5000/order/admin/all', { credentials: 'include' }),
          fetch('http://localhost:5000/seller/all', { credentials: 'include' }),
          fetch('http://localhost:5000/product', { credentials: 'include' }),
          fetch('http://localhost:5000/support/queries', { credentials: 'include' })
        ]);

        // Orders + Revenue
        if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
          const data = await ordersRes.value.json();
          if (data.success) {
            setTotalOrders(data.totalOrders || (data.orders ? data.orders.length : 0));
            setRevenue(data.totalRevenue || 0);
            // Get recent 5 orders
            if (Array.isArray(data.orders)) {
              const recent = data.orders.slice(0, 5).map((o: any) => ({
                orderNumber: o.orderNumber,
                customerName: o.customerInfo ? `${o.customerInfo.firstName} ${o.customerInfo.lastName}` : 'N/A',
                total: o.total || 0,
                orderStatus: o.orderStatus || 'pending',
                paymentStatus: o.paymentStatus || 'unpaid',
                orderDate: o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
              }));
              setRecentOrders(recent);
            }
          }
        }

        // Sellers
        if (sellersRes.status === 'fulfilled' && sellersRes.value.ok) {
          const data = await sellersRes.value.json();
          const sellers = data.sellers || [];
          setTotalSellers(Array.isArray(sellers) ? sellers.length : 0);
        }

        // Products
        if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
          const data = await productsRes.value.json();
          // Use pagination.totalProducts for accurate count (API paginates, default limit=10)
          setTotalProducts(data.pagination?.totalProducts ?? (Array.isArray(data.products) ? data.products.length : 0));
        }

        // Support Tickets
        if (ticketsRes.status === 'fulfilled' && ticketsRes.value.ok) {
          const data = await ticketsRes.value.json();
          if (data.success && Array.isArray(data.tickets)) {
            setTotalTickets(data.tickets.length);
            setOpenTickets(data.tickets.filter((t: any) => t.status !== 'Resolved').length);
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-yellow-100 text-yellow-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      paid: 'bg-green-100 text-green-700',
      unpaid: 'bg-orange-100 text-orange-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  const metrics = [
    {
      title: 'Total Revenue',
      icon: '💰',
      value: `PKR ${revenue.toLocaleString()}`,
      description: `From ${totalOrders} orders`,
      gradient: 'from-teal-500 to-emerald-500',
      iconBg: 'bg-teal-100'
    },
    {
      title: 'Total Orders',
      icon: '📦',
      value: String(totalOrders),
      description: 'Customer orders',
      gradient: 'from-blue-500 to-indigo-500',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Total Products',
      icon: '🛍️',
      value: String(totalProducts),
      description: 'Across all sellers',
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Active Sellers',
      icon: '🏪',
      value: String(totalSellers),
      description: 'Registered sellers',
      gradient: 'from-orange-500 to-amber-500',
      iconBg: 'bg-orange-100'
    },
    {
      title: 'Support Tickets',
      icon: '🎫',
      value: String(totalTickets),
      description: `${openTickets} open`,
      gradient: 'from-rose-500 to-red-500',
      iconBg: 'bg-rose-100'
    }
  ];

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8 overflow-y-auto">
      {loading && (
        <div className="mb-4 p-3 bg-white rounded-lg border border-gray-100 text-sm text-gray-600 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          Loading dashboard data…
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Overview</h1>
        <p className="text-base text-gray-600">Monitor sales, products, and support across the platform</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${metric.gradient} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`}></div>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xl ${metric.iconBg} p-2 rounded-lg`}>{metric.icon}</span>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{metric.title}</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
            <p className="text-xs text-gray-400">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-4xl mb-2">📋</div>
              <p>No orders yet</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Order #</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-teal-600">{order.orderNumber}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{order.customerName}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">PKR {order.total.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{order.orderDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Revenue per Order */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Average Order Value</h3>
          <div className="text-2xl font-bold text-gray-900">
            PKR {totalOrders > 0 ? Math.round(revenue / totalOrders).toLocaleString() : '0'}
          </div>
          <p className="text-xs text-gray-400 mt-1">Per order average</p>
        </div>

        {/* Products per Seller */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Products per Seller</h3>
          <div className="text-2xl font-bold text-gray-900">
            {totalSellers > 0 ? Math.round(totalProducts / totalSellers) : '0'}
          </div>
          <p className="text-xs text-gray-400 mt-1">Average per seller</p>
        </div>

        {/* Support Resolution */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Ticket Status</h3>
          <div className="text-2xl font-bold text-gray-900">
            {totalTickets > 0 ? `${Math.round(((totalTickets - openTickets) / totalTickets) * 100)}%` : '—'}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {totalTickets - openTickets} resolved / {totalTickets} total
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
