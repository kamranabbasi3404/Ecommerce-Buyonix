import React, { useState, useEffect } from 'react';

interface Seller {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  businessAddress: string;
  storeName: string;
  storeDescription: string;
  primaryCategory: string;
  website: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  cnicNumber: string;
  taxNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const AllSellers: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllSellers();
  }, []);

  const fetchAllSellers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:5000/seller/all', {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSellers(result.sellers);
      } else {
        setError(result.message || 'Failed to fetch sellers');
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-600', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-600', label: 'Rejected' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredSellers = sellers.filter(seller => {
    const matchesFilter = filter === 'all' || seller.status === filter;
    const matchesSearch = searchTerm === '' || 
      seller.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.businessName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sellers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
          <button
            onClick={fetchAllSellers}
            className="mt-2 text-sm underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Sellers</h1>
        <p className="text-base text-gray-600">
          View and manage all seller accounts ({filteredSellers.length} {filter !== 'all' ? filter : 'total'})
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, store, or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'approved' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'rejected' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Sellers List */}
      {filteredSellers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Sellers Found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms.' : 'No sellers match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSellers.map((seller) => (
            <div 
              key={seller._id} 
              className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedSeller(seller)}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {seller.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{seller.fullName}</h3>
                    <p className="text-sm text-gray-600">{seller.storeName}</p>
                    <p className="text-xs text-gray-500 mt-1">{seller.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end gap-2">
                  {getStatusBadge(seller.status)}
                  <p className="text-xs text-gray-500">
                    Joined: {formatDate(seller.createdAt)}
                  </p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{seller.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Business</p>
                  <p className="text-sm font-medium text-gray-900">{seller.businessName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm font-medium text-gray-900">{seller.primaryCategory}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">CNIC</p>
                  <p className="text-sm font-medium text-gray-900">{seller.cnicNumber}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seller Details Modal */}
      {selectedSeller && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSeller(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedSeller.fullName}</h2>
                <p className="text-sm text-gray-600">{selectedSeller.storeName}</p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedSeller.status)}
                <button
                  onClick={() => setSelectedSeller(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedSeller.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedSeller.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    <p className="text-sm font-medium text-gray-900">{selectedSeller.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">CNIC Number</p>
                    <p className="text-sm font-medium text-gray-900">{selectedSeller.cnicNumber}</p>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Business Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedSeller.businessName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Business Type</p>
                    <p className="text-sm font-medium text-gray-900">{selectedSeller.businessType}</p>
                  </div>
                  {selectedSeller.businessAddress && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Business Address</p>
                      <p className="text-sm font-medium text-gray-900">{selectedSeller.businessAddress}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tax Number (NTN)</p>
                    <p className="text-sm font-medium text-gray-900">{selectedSeller.taxNumber}</p>
                  </div>
                </div>
              </div>

              {/* Store Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Store Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Store Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedSeller.storeName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Store Description</p>
                    <p className="text-sm text-gray-900">{selectedSeller.storeDescription}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Primary Category</p>
                      <p className="text-sm font-medium text-gray-900">{selectedSeller.primaryCategory}</p>
                    </div>
                    {selectedSeller.website && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Website</p>
                        <p className="text-sm font-medium text-gray-900">
                          <a href={selectedSeller.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                            {selectedSeller.website}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Banking Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Account Holder Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedSeller.accountHolderName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedSeller.bankName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Account Number</p>
                    <p className="text-sm font-medium text-gray-900">{selectedSeller.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">IBAN</p>
                    <p className="text-sm font-medium text-gray-900">{selectedSeller.iban}</p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    {getStatusBadge(selectedSeller.status)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Registration Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(selectedSeller.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllSellers;

