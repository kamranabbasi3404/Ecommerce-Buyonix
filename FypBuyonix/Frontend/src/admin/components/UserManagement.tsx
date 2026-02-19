import React, { useEffect, useState } from 'react';

interface SellerSummary {
  _id: string;
  fullName?: string;
  email?: string;
  storeName?: string;
}

const UserManagement: React.FC = () => {
  // Per request: show only sellers' ids in user section
  const [sellerIds, setSellerIds] = useState<SellerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/seller/all', { credentials: 'include' });
      if (!res.ok) {
        setSellerIds([]);
        return;
      }
      const data = await res.json();
      if (data && Array.isArray(data.sellers)) {
        setSellerIds(
          data.sellers.map((s: { _id: string; fullName?: string; email?: string; storeName?: string }) => ({ _id: s._id, fullName: s.fullName, email: s.email, storeName: s.storeName }))
        );
      } else {
        setSellerIds([]);
      }
    } catch (err) {
      console.error('Fetch sellers error', err);
      setError('Unable to fetch sellers');
      setSellerIds([]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-base text-gray-600">
          Manage all user accounts on the platform
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 hidden md:table-header-group">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Seller ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Store / Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr><td className="p-6 text-center text-gray-600" colSpan={3}>Loading sellers...</td></tr>
              ) : error ? (
                <tr><td className="p-6 text-center text-red-600" colSpan={3}>{error}</td></tr>
              ) : sellerIds.length === 0 ? (
                <tr><td className="p-6 text-center text-gray-600" colSpan={3}>No sellers found.</td></tr>
              ) : (
                sellerIds.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{s._id}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{s.storeName || s.fullName || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{s.email || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">Showing <span className="font-medium">1</span> to <span className="font-medium">{sellerIds.length}</span> of <span className="font-medium">{sellerIds.length}</span> results</div>
          <div className="flex gap-1"><button className="px-2.5 py-1 text-xs bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">Previous</button><button className="px-2.5 py-1 text-xs bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">Next</button></div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

