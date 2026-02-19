import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBox, FaShoppingBag, FaTruck, FaCheckCircle, FaTimesCircle, FaClock, FaSearch, FaArrowLeft } from 'react-icons/fa';

interface OrderItem {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    images?: string[];
}

interface Order {
    _id: string;
    orderNumber: string;
    customerInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        address: string;
        city: string;
    };
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

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    pending: { icon: <FaClock />, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
    confirmed: { icon: <FaCheckCircle />, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    shipped: { icon: <FaTruck />, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    delivered: { icon: <FaCheckCircle />, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    cancelled: { icon: <FaTimesCircle />, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
};

export default function MyOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const userInfoStr = localStorage.getItem('userInfo');
            if (!userInfoStr) {
                setLoading(false);
                return;
            }
            const userInfo = JSON.parse(userInfoStr);
            const userEmail = userInfo.email;

            const res = await fetch('http://localhost:5000/order/admin/all', { credentials: 'include' });
            const data = await res.json();

            if (data.success && data.orders) {
                // Filter orders for this user by email
                const myOrders = data.orders.filter(
                    (o: Order) => o.customerInfo?.email?.toLowerCase() === userEmail?.toLowerCase()
                );
                setOrders(myOrders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'all' || order.orderStatus === filter;
        const matchesSearch = searchQuery === '' ||
            order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const filters = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-3 transition-colors"
                    >
                        <FaArrowLeft /> Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-500 mt-1">Track and manage your orders</p>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-2.5">
                            <FaSearch className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search by order number or product name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {filters.map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${filter === f
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <FaShoppingBag className="text-5xl text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {orders.length === 0 ? 'No Orders Yet' : 'No Matching Orders'}
                        </h2>
                        <p className="text-gray-500 mb-6">
                            {orders.length === 0 ? "You haven't placed any orders yet." : 'Try adjusting your search or filter.'}
                        </p>
                        {orders.length === 0 && (
                            <Link to="/shop" className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700">
                                Start Shopping
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => {
                            const cfg = statusConfig[order.orderStatus] || statusConfig.pending;
                            return (
                                <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    {/* Order Header */}
                                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                        <div>
                                            <p className="font-bold text-gray-900">Order #{order.orderNumber}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {new Date(order.orderDate || order.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border capitalize ${cfg.bg} ${cfg.color}`}>
                                                {cfg.icon} {order.orderStatus}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${order.paymentStatus === 'paid'
                                                ? 'bg-green-50 border-green-200 text-green-600'
                                                : 'bg-yellow-50 border-yellow-200 text-yellow-600'
                                                }`}>
                                                {order.paymentStatus === 'paid' ? '💰 Paid' : '⏳ Unpaid'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="p-5">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 mb-3 last:mb-0">
                                                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {item.images && item.images[0] ? (
                                                        <img
                                                            src={typeof item.images[0] === 'string' ? item.images[0] : (item.images[0] as { url?: string })?.url || ''}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <FaBox className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                                                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
                                        <p className="text-sm text-gray-500">
                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {order.paymentMethod?.toUpperCase()}
                                        </p>
                                        <p className="font-bold text-lg text-gray-900">Total: ${order.total?.toFixed(2)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
