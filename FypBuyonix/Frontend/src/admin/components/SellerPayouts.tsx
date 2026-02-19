import React, { useEffect, useState } from 'react';

interface Payout {
  payoutId: string;
  sellerStoreName: string;
  sellerEmail: string;
  amountDue: number;
  payoutMethod: string;
  maskedAccount: string;
  dueDate: string;
  status: 'Pending' | 'Processing';
}

const SellerPayouts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summaryData, setSummaryData] = useState({ totalPayoutsDue: 0, processedThisMonth: 0, sellersAwaiting: 0, processingTime: '—' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/payouts', { credentials: 'include' });
        if (!res.ok) {
          // No backend yet - keep empty
          setPayouts([]);
          setSummaryData({ totalPayoutsDue: 0, processedThisMonth: 0, sellersAwaiting: 0, processingTime: '—' });
          return;
        }
        const data = await res.json();
        setPayouts(Array.isArray(data.payouts) ? data.payouts : []);
        // compute simple summary if provided or compute from payouts
        if (data.summary) {
          setSummaryData(data.summary);
        } else {
          const total = Array.isArray(data.payouts) ? data.payouts.reduce((acc: number, p: { amountDue?: number | string }) => acc + (Number(p.amountDue) || 0), 0) : 0;
          const pendingCount = Array.isArray(data.payouts) ? (data.payouts.filter((p: { status?: string }) => p.status === 'Pending').length) : 0;
          setSummaryData({ totalPayoutsDue: total, processedThisMonth: 0, sellersAwaiting: pendingCount, processingTime: '—' });
        }
      } catch (err) {
        console.error('Fetch payouts error', err);
        setPayouts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, []);

  const handleProcessPayout = (payoutId: string, sellerName: string, amount: number) => {
    if (window.confirm(`Process payout ${payoutId} for ${sellerName} ($${amount.toFixed(2)})?`)) {
      alert(`Payout ${payoutId} has been initiated.`);
      // In a real application, this would make an API call
    }
  };

  const filteredPayouts = payouts.filter(payout =>
    payout.payoutId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payout.sellerStoreName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payout.sellerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Payouts</h1>
        <p className="text-base text-gray-600">
          Process payments to sellers for their sales
        </p>
      </div>
      {loading && <div className="mb-4 p-3 bg-white rounded-md border border-gray-100 text-sm text-gray-600">Loading payouts…</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Payouts Due */}
        <div className="bg-white rounded-2xl shadow-lg p-6 relative border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="absolute top-5 right-5 w-8 h-8 opacity-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-amber-500">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 leading-snug h-10">Total Payouts Due</h3>
          <p className="text-3xl font-bold text-teal-600 mb-3">${summaryData.totalPayoutsDue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 leading-relaxed">Awaiting processing</p>
        </div>

        {/* Processed This Month */}
        <div className="bg-white rounded-2xl shadow-lg p-6 relative border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="absolute top-5 right-5 w-8 h-8 opacity-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 leading-snug h-10">Processed This<br />Month</h3>
          <p className="text-3xl font-bold text-teal-600 mb-3">{summaryData.processedThisMonth}</p>
          <p className="text-xs text-green-600 leading-relaxed">+15% from last month</p>
        </div>

        {/* Sellers Awaiting Payment */}
        <div className="bg-white rounded-2xl shadow-lg p-6 relative border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="absolute top-5 right-5 w-8 h-8 opacity-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-500">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 leading-snug h-10">Sellers Awaiting<br />Payment</h3>
          <p className="text-3xl font-bold text-teal-600 mb-3">{summaryData.sellersAwaiting}</p>
          <p className="text-xs text-gray-500 leading-relaxed">Pending verification</p>
        </div>

        {/* Processing Time */}
        <div className="bg-white rounded-2xl shadow-lg p-6 relative border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="absolute top-5 right-5 w-8 h-8 opacity-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-orange-500">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 leading-snug h-10">Processing Time</h3>
          <p className="text-3xl font-bold text-teal-600 mb-3">{summaryData.processingTime}</p>
          <p className="text-xs text-gray-500 leading-relaxed">Average processing</p>
        </div>
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
            placeholder="Search by Seller Name, Email, or Payout ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      {/* Seller Payouts Queue Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-gray-900">Seller Payouts Queue</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
              All
            </button>
            <button className="px-3 py-1 text-xs bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
              Pending
            </button>
            <button className="px-3 py-1 text-xs bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
              Processing
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <input type="checkbox" className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Payout ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount Due
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Payout Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredPayouts.map((payout, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input type="checkbox" className="rounded border-gray-300 text-teal-500 focus:ring-teal-500" />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{payout.payoutId}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {payout.sellerStoreName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm text-gray-900 font-medium">{payout.sellerStoreName}</div>
                        <div className="text-xs text-gray-500">{payout.sellerEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-teal-600">${payout.amountDue.toFixed(2)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{payout.payoutMethod}</div>
                    <div className="text-xs text-gray-500">{payout.maskedAccount}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{payout.dueDate}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      payout.status === 'Pending' 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {payout.status === 'Pending' ? (
                      <button
                        onClick={() => handleProcessPayout(payout.payoutId, payout.sellerStoreName, payout.amountDue)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Process
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500">In Progress</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayouts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payouts found</h3>
            <p className="text-gray-500">No payouts match your search criteria.</p>
          </div>
        )}
        
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredPayouts.length}</span> of{' '}
            <span className="font-medium">{filteredPayouts.length}</span> results
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerPayouts;

