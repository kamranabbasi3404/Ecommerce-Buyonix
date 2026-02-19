import React, { useEffect, useState } from 'react';

interface OrderPayment {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  date: string;
  items: number;
}

const PaymentVerification: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [payments, setPayments] = useState<OrderPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/order/admin/all', { credentials: 'include' });
      if (!res.ok) { setPayments([]); return; }
      const data = await res.json();

      if (data.success && Array.isArray(data.orders)) {
        const formatted: OrderPayment[] = data.orders.map((o: any) => ({
          orderNumber: o.orderNumber || '',
          customerName: o.customerInfo
            ? `${o.customerInfo.firstName} ${o.customerInfo.lastName}`
            : 'N/A',
          customerEmail: o.customerInfo?.email || '',
          customerPhone: o.customerInfo?.phoneNumber || '',
          amount: o.total || 0,
          paymentMethod: o.paymentMethod || 'N/A',
          paymentStatus: o.paymentStatus || 'unpaid',
          orderStatus: o.orderStatus || 'pending',
          date: o.orderDate
            ? new Date(o.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—',
          items: Array.isArray(o.items) ? o.items.length : 0,
        }));
        setPayments(formatted);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error('Payments fetch error', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const updatePaymentStatus = async (orderNumber: string, paymentStatus: string) => {
    setActionLoading(orderNumber);
    try {
      const res = await fetch(`http://localhost:5000/order/${orderNumber}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchPayments();
      } else {
        alert('Failed to update payment status');
      }
    } catch (err) {
      console.error('Error updating payment:', err);
      alert('Error updating payment status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirm = (orderNumber: string, customerName: string) => {
    if (window.confirm(`Confirm payment for order ${orderNumber} by ${customerName}?`)) {
      updatePaymentStatus(orderNumber, 'paid');
    }
  };

  const handleReject = (orderNumber: string, customerName: string) => {
    if (window.confirm(`Reject payment for order ${orderNumber} by ${customerName}?`)) {
      updatePaymentStatus(orderNumber, 'rejected');
    }
  };

  // Apply filters
  let filtered = payments;
  if (filter === 'unpaid') filtered = payments.filter(p => p.paymentStatus === 'unpaid');
  else if (filter === 'paid') filtered = payments.filter(p => p.paymentStatus === 'paid');

  // Apply search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.orderNumber.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.customerEmail.toLowerCase().includes(q)
    );
  }

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidCount = payments.filter(p => p.paymentStatus === 'paid').length;
  const unpaidCount = payments.filter(p => p.paymentStatus === 'unpaid').length;

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'unpaid': return 'bg-orange-100 text-orange-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bank': return 'bg-blue-100 text-blue-700';
      case 'cod': return 'bg-amber-100 text-amber-700';
      case 'stripe': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Verification</h1>
        <p className="text-base text-gray-600">
          Review and verify customer payment statuses
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Orders</div>
          <div className="text-2xl font-bold text-gray-900">{payments.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-teal-600">PKR {totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <div className="text-xs font-semibold text-green-600 uppercase mb-1">✅ Paid</div>
          <div className="text-2xl font-bold text-green-600">{paidCount}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <div className="text-xs font-semibold text-orange-600 uppercase mb-1">⏳ Unpaid</div>
          <div className="text-2xl font-bold text-orange-600">{unpaidCount}</div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by Order #, Customer name, or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
          {(['all', 'unpaid', 'paid'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${filter === f
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {f === 'all' ? 'All' : f === 'unpaid' ? '⏳ Unpaid' : '✅ Paid'}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <div className="text-sm text-gray-500">Loading payments...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500 text-sm">
              {searchQuery ? 'Try a different search term' : 'No orders have been placed yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order #</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Payment</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((payment, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-semibold text-teal-600">{payment.orderNumber}</div>
                      <div className="text-xs text-gray-400">{payment.items} item{payment.items !== 1 ? 's' : ''}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {payment.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                          <div className="text-xs text-gray-400">{payment.customerEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-bold text-gray-900">PKR {payment.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase ${getMethodBadge(payment.paymentMethod)}`}>
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${getPaymentBadge(payment.paymentStatus)}`}>
                        {payment.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-600 capitalize">{payment.orderStatus}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-gray-500">{payment.date}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      {payment.paymentStatus === 'unpaid' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleConfirm(payment.orderNumber, payment.customerName)}
                            disabled={actionLoading === payment.orderNumber}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            ✓ Confirm
                          </button>
                          <button
                            onClick={() => handleReject(payment.orderNumber, payment.customerName)}
                            disabled={actionLoading === payment.orderNumber}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          {payment.paymentStatus === 'paid' ? '✅ Verified' : '❌ Rejected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 text-sm text-gray-500">
            Showing {filtered.length} of {payments.length} orders
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentVerification;
