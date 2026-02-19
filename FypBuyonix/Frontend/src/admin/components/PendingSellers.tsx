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
  status: string;
  createdAt: string;
}

const PendingSellers: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  const fetchPendingSellers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:5000/seller/pending', {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSellers(result.sellers);
      } else {
        setError(result.message || 'Failed to fetch pending sellers');
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (sellerId: string, sellerName: string) => {
    if (!window.confirm(`Are you sure you want to approve ${sellerName}'s application? They will be able to log in immediately.`)) {
      return;
    }

    try {
      setProcessing(sellerId);
      const response = await fetch(`http://localhost:5000/seller/${sellerId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`${sellerName}'s application has been approved successfully!`);
        // Remove the seller from the list
        setSellers(sellers.filter(seller => seller._id !== sellerId));
      } else {
        alert(result.message || 'Failed to approve seller');
      }
    } catch (error) {
      console.error('Error approving seller:', error);
      alert('Network error. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (sellerId: string, sellerName: string) => {
    if (!window.confirm(`Are you sure you want to reject ${sellerName}'s application? This action cannot be undone.`)) {
      return;
    }

    try {
      setProcessing(sellerId);
      const response = await fetch(`http://localhost:5000/seller/${sellerId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`${sellerName}'s application has been rejected.`);
        // Remove the seller from the list
        setSellers(sellers.filter(seller => seller._id !== sellerId));
      } else {
        alert(result.message || 'Failed to reject seller');
      }
    } catch (error) {
      console.error('Error rejecting seller:', error);
      alert('Network error. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending sellers...</p>
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
            onClick={fetchPendingSellers}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Seller Applications</h1>
        <p className="text-base text-gray-600">
          Review and approve seller registration requests ({sellers.length} pending)
        </p>
      </div>

      {sellers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Applications</h3>
          <p className="text-gray-600">All seller applications have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sellers.map((seller) => (
            <div key={seller._id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              {/* Seller Header */}
              <div className="mb-6 pb-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                      {seller.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{seller.fullName}</h3>
                      <p className="text-sm text-gray-600">{seller.storeName}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-600 self-start">
                    <span>⏰</span>
                    Pending Review
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Submitted on {formatDate(seller.createdAt)}
                </p>
              </div>

              {/* Main Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                    Personal Information
                  </h4>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Full Name:</p>
                      <p className="text-sm text-gray-900">{seller.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email:</p>
                      <p className="text-sm text-gray-900">{seller.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone:</p>
                      <p className="text-sm text-gray-900">{seller.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                    Business Information
                  </h4>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Business Name:</p>
                      <p className="text-sm text-gray-900">{seller.businessName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Business Type:</p>
                      <p className="text-sm text-gray-900">{seller.businessType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Store Name:</p>
                      <p className="text-sm text-gray-900">{seller.storeName}</p>
                    </div>
                    {seller.businessAddress && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Business Address:</p>
                        <p className="text-sm text-gray-900">{seller.businessAddress}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Store Details */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Store Details
                </h4>
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Store Description:</p>
                    <p className="text-sm text-gray-900">{seller.storeDescription}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Primary Category:</p>
                    <p className="text-sm text-gray-900">{seller.primaryCategory}</p>
                  </div>
                  {seller.website && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Website:</p>
                      <p className="text-sm text-gray-900">
                        <a href={seller.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                          {seller.website}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Banking Information */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Banking Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Account Holder:</p>
                    <p className="text-sm text-gray-900">{seller.accountHolderName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Bank Name:</p>
                    <p className="text-sm text-gray-900">{seller.bankName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Account Number:</p>
                    <p className="text-sm text-gray-900">{seller.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">IBAN:</p>
                    <p className="text-sm text-gray-900">{seller.iban}</p>
                  </div>
                </div>
              </div>

              {/* Verification Information */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Verification Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">CNIC Number:</p>
                    <p className="text-sm text-gray-900">{seller.cnicNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tax Number (NTN):</p>
                    <p className="text-sm text-gray-900">{seller.taxNumber}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handleReject(seller._id, seller.fullName)}
                  disabled={processing === seller._id}
                  className={`flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold shadow-sm ${
                    processing === seller._id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
                    <span className="text-red-600 text-xs font-bold">✕</span>
                  </div>
                  {processing === seller._id ? 'Processing...' : 'Reject Application'}
                </button>
                <button 
                  onClick={() => handleApprove(seller._id, seller.fullName)}
                  disabled={processing === seller._id}
                  className={`flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-semibold shadow-sm ${
                    processing === seller._id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-teal-400 flex items-center justify-center border border-teal-300">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  {processing === seller._id ? 'Processing...' : 'Approve & Create Account'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingSellers;
