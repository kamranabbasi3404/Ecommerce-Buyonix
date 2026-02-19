import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import logo from "../../assets/logo.png";

interface Order {
  _id: string;
  total: number;
  orderStatus: string;
  createdAt: string;
  items: {
    productId: string;
    productName: string;
    category?: string;
    quantity: number;
    price: number;
  }[];
}

interface SellerInfo {
  id: string;
  fullName?: string;
  _id?: string;
}

interface MonthlyDataItem {
  name: string;
  orders: number;
  revenue: number;
}

interface WeeklyDataItem {
  day: string;
  orders: number;
  revenue: number;
}

interface CategoryDataItem {
  name: string;
  value: number;
  color: string;
}

interface Product {
  _id: string;
  name: string;
  category?: string;
}

const SellerAnalytics = () => {
  const navigate = useNavigate();
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataItem[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyDataItem[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDataItem[]>([]);

  // Date filters
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'year'>('7days');

  // Get available years from orders
  const getAvailableYears = () => {
    const years = new Set<number>();
    years.add(currentYear);
    orders.forEach(order => {
      const year = new Date(order.createdAt).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  useEffect(() => {
    const sellerData = localStorage.getItem('sellerInfo');
    if (sellerData) {
      const seller = JSON.parse(sellerData);
      setSellerInfo(seller);
      fetchAllData(seller.id);
    } else {
      navigate('/become-seller');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchAllData = async (sellerId: string) => {
    try {
      setLoading(true);

      // Fetch products
      const productsResponse = await fetch(`http://localhost:5000/product/seller/${sellerId}`, {
        credentials: 'include',
      });

      let totalProducts = 0;
      const productCategories: { [key: string]: number } = {};

      if (productsResponse.ok) {
        const productsResult = await productsResponse.json();
        if (productsResult.success) {
          totalProducts = productsResult.products.length;
          // Count products by category
          productsResult.products.forEach((product: Product) => {
            const cat = product.category || 'Other';
            productCategories[cat] = (productCategories[cat] || 0) + 1;
          });
        }
      }

      // Fetch orders
      const ordersResponse = await fetch(`http://localhost:5000/order/seller/${sellerId}`, {
        credentials: 'include',
      });

      let ordersData: Order[] = [];
      let totalRevenue = 0;
      let totalOrders = 0;

      if (ordersResponse.ok) {
        const ordersResult = await ordersResponse.json();
        if (ordersResult.success && ordersResult.orders) {
          ordersData = ordersResult.orders;
          totalOrders = ordersData.length;
          totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0);
        }
      }

      setOrders(ordersData);
      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
      });

      // Process data for charts
      processMonthlyData(ordersData);
      processWeeklyData(ordersData);
      processCategoryData(ordersData, productCategories);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (ordersData: Order[], year: number = selectedYear) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const monthlyStats: { [key: string]: { orders: number; revenue: number } } = {};
    months.forEach(m => { monthlyStats[m] = { orders: 0, revenue: 0 }; });

    ordersData.forEach(order => {
      const date = new Date(order.createdAt);
      if (date.getFullYear() === year) {
        const month = months[date.getMonth()];
        monthlyStats[month].orders += 1;
        monthlyStats[month].revenue += order.total;
      }
    });

    const data = months.map(month => ({
      name: month,
      orders: monthlyStats[month].orders,
      revenue: monthlyStats[month].revenue
    }));

    setMonthlyData(data);
  };

  const processWeeklyData = (ordersData: Order[], range: typeof dateRange = dateRange) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();

    let startTime: Date;

    if (range === '7days') {
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === '30days') {
      startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === '90days') {
      startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else {
      startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    const dailyStats: { [key: string]: { orders: number; revenue: number } } = {};
    days.forEach(d => { dailyStats[d] = { orders: 0, revenue: 0 }; });

    ordersData.forEach(order => {
      const date = new Date(order.createdAt);
      if (date >= startTime && date <= now) {
        const day = days[date.getDay()];
        dailyStats[day].orders += 1;
        dailyStats[day].revenue += order.total;
      }
    });

    const todayIndex = now.getDay();
    const reorderedDays = [...days.slice(todayIndex + 1), ...days.slice(0, todayIndex + 1)];

    const data = reorderedDays.map(day => ({
      day,
      orders: dailyStats[day].orders,
      revenue: dailyStats[day].revenue
    }));

    setWeeklyData(data);
  };

  const processCategoryData = (ordersData: Order[], productCategories: { [key: string]: number }) => {
    const colors = ['#0d9488', '#14b8a6', '#5eead4', '#99f6e4', '#ccfbf1', '#2dd4bf', '#f97316', '#8b5cf6'];

    // Always use product categories if available (more reliable than order items)
    // This shows how many products are in each category
    if (Object.keys(productCategories).length > 0) {
      const data = Object.entries(productCategories).map(([name, value], index) => ({
        name,
        value: Math.round(value),
        color: colors[index % colors.length]
      }));
      setCategoryData(data);
      return;
    }

    // Fallback: try to get categories from orders
    const categoryRevenue: { [key: string]: number } = {};
    ordersData.forEach(order => {
      order.items.forEach(item => {
        const cat = item.category || 'Uncategorized';
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (item.price * item.quantity);
      });
    });

    if (Object.keys(categoryRevenue).length > 0) {
      const data = Object.entries(categoryRevenue).map(([name, value], index) => ({
        name,
        value: Math.round(value),
        color: colors[index % colors.length]
      }));
      setCategoryData(data);
    } else {
      // No data at all
      setCategoryData([]);
    }
  };

  // Calculate growth percentage (comparing last 30 days to previous 30 days)
  const calculateGrowth = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    let last30Revenue = 0;
    let prev30Revenue = 0;

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      if (date >= thirtyDaysAgo) {
        last30Revenue += order.total;
      } else if (date >= sixtyDaysAgo && date < thirtyDaysAgo) {
        prev30Revenue += order.total;
      }
    });

    if (prev30Revenue === 0) return last30Revenue > 0 ? 100 : 0;
    return Math.round(((last30Revenue - prev30Revenue) / prev30Revenue) * 100);
  };

  const getCompletionRate = () => {
    if (orders.length === 0) return 0;
    const completed = orders.filter(o => o.orderStatus === 'delivered' || o.orderStatus === 'shipped').length;
    return Math.round((completed / orders.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const revenueGrowth = calculateGrowth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed top-0 left-0 h-screen overflow-y-auto">
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="BUYONIX" className="h-10 w-10" />
          </Link>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            <Link to="/seller-dashboard" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
              <span className="text-xl">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/seller-products" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
              <span className="text-xl">📦</span>
              <span>Products</span>
            </Link>
            <Link to="/seller-orders" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
              <span className="text-xl">📋</span>
              <span>Orders</span>
            </Link>
            <Link to="/seller-analytics" className="flex items-center space-x-3 px-4 py-3 bg-teal-600 text-white rounded-lg font-medium">
              <span className="text-xl">📈</span>
              <span>Analytics</span>
            </Link>
            <Link to="/seller-payouts" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
              <span className="text-xl">💰</span>
              <span>Payouts</span>
            </Link>
            <Link to="/seller-chats" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
              <span className="text-xl">💬</span>
              <span>Chats</span>
            </Link>
          </div>
        </nav>

        <div className="absolute bottom-6 left-4 right-4 space-y-2">
          <button
            onClick={async () => {
              try {
                await fetch('http://localhost:5000/seller/logout', { method: 'POST', credentials: 'include' });
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
          <Link to="/" className="flex items-center justify-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300">
            <span>←</span>
            <span>Back to Shopping</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 ml-64">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back{sellerInfo?.fullName ? `, ${sellerInfo.fullName}` : ''}! Here's your real-time store performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Total Revenue</span>
              <span className="text-2xl">💵</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">PKR {stats.totalRevenue.toLocaleString()}</div>
            <div className={`text-sm mt-1 flex items-center ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span>{revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(revenueGrowth)}%</span>
              <span className="text-gray-400 ml-1">vs last 30 days</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Total Orders</span>
              <span className="text-2xl">📦</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalOrders}</div>
            <div className="text-sm text-teal-600 mt-1">All time orders</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Products Listed</span>
              <span className="text-2xl">🏷️</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalProducts}</div>
            <div className="text-sm text-teal-600 mt-1">Active products</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Avg. Order Value</span>
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">PKR {stats.avgOrderValue.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">Per order</div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Monthly Revenue</h3>
              <select
                value={selectedYear}
                onChange={(e) => {
                  const year = parseInt(e.target.value);
                  setSelectedYear(year);
                  processMonthlyData(orders, year);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-gray-50"
              >
                {getAvailableYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            {monthlyData.some(m => m.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value) => [`PKR ${Number(value || 0).toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0d9488" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No revenue data for {selectedYear}</p>
                </div>
              </div>
            )}
          </div>

          {/* Weekly Orders Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Orders by Period</h3>
              <div className="flex gap-1">
                {[
                  { value: '7days', label: '7D' },
                  { value: '30days', label: '30D' },
                  { value: '90days', label: '90D' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setDateRange(option.value as typeof dateRange);
                      processWeeklyData(orders, option.value as typeof dateRange);
                    }}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${dateRange === option.value
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {weeklyData.some(d => d.orders > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Bar dataKey="orders" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📦</div>
                  <p>No orders in this period</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Trend */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Monthly Orders Trend</h3>
              <select
                value={selectedYear}
                onChange={(e) => {
                  const year = parseInt(e.target.value);
                  setSelectedYear(year);
                  processMonthlyData(orders, year);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-gray-50"
              >
                {getAvailableYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            {monthlyData.some(m => m.orders > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="orders" name="Orders" stroke="#0d9488" strokeWidth={2} dot={{ fill: '#0d9488' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p>No trend data for {selectedYear}</p>
                </div>
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">By Category</h3>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value) => [`${value || 0}`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">🏷️</div>
                  <p>No category data</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-3xl font-bold text-teal-600">{getCompletionRate()}%</div>
              <div className="text-sm text-gray-600 mt-1">Order Completion Rate</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{stats.totalOrders}</div>
              <div className="text-sm text-gray-600 mt-1">Total Orders Received</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{stats.totalProducts}</div>
              <div className="text-sm text-gray-600 mt-1">Products in Store</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
