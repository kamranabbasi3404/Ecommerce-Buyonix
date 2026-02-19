import React, { useState, useEffect } from 'react';
import logo from '../../assets/logo.png';

interface SidebarProps {
  currentPage: 'dashboard' | 'users' | 'products' | 'orders' | 'support' | 'analytics' | 'pending-sellers' | 'all-sellers' | 'payment-verification' | 'seller-payouts';
  onPageChange: (page: 'dashboard' | 'users' | 'products' | 'orders' | 'support' | 'analytics' | 'pending-sellers' | 'all-sellers' | 'payment-verification' | 'seller-payouts') => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, onLogout }) => {
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    fetchPendingCount();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [currentPage]); // Refresh when page changes

  const fetchPendingCount = async () => {
    try {
      const response = await fetch('http://localhost:5000/seller/pending', {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        setPendingCount(result.sellers.length);
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard' as const, icon: '📊', label: 'Dashboard' },
    { id: 'users' as const, icon: '👥', label: 'Users' },
    { id: 'products' as const, icon: '📦', label: 'Products' },
    { id: 'orders' as const, icon: '✅', label: 'Orders' },
    { id: 'support' as const, icon: '💬', label: 'Customer Support' },
    { id: 'analytics' as const, icon: '📈', label: 'Analytics & Reports' }
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col border-r border-gray-200">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Buyonix Logo" className="w-10 h-10 rounded-lg" />
          <div>
            <div className="text-lg font-bold text-gray-800">Buyonix</div>
            <div className="text-xs text-gray-500">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav
        className="flex-1 p-4 overflow-y-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Main Menu */}
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 gap-3 rounded-lg ${isActive
                    ? 'bg-teal-600 text-white font-medium shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <span className="text-lg w-6 flex justify-center">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Seller Management */}
        <div className="mt-6">
          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Seller Management
          </div>
          <div className="space-y-1 mt-1">
            <div
              onClick={() => onPageChange('pending-sellers')}
              className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 gap-3 rounded-lg ${currentPage === 'pending-sellers'
                  ? 'bg-teal-600 text-white font-medium shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <span className="text-lg w-6 flex justify-center">🏪</span>
              <span className="text-sm">Pending Sellers</span>
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full ml-auto animate-pulse">
                  {pendingCount}
                </span>
              )}
            </div>
            <div
              onClick={() => onPageChange('all-sellers')}
              className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 gap-3 rounded-lg ${currentPage === 'all-sellers'
                  ? 'bg-teal-600 text-white font-medium shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <span className="text-lg w-6 flex justify-center">👥</span>
              <span className="text-sm">All Sellers</span>
            </div>
          </div>
        </div>

        {/* Financials */}
        <div className="mt-6">
          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Financials
          </div>
          <div className="space-y-1 mt-1">
            <div
              onClick={() => onPageChange('payment-verification')}
              className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 gap-3 rounded-lg ${currentPage === 'payment-verification'
                  ? 'bg-teal-600 text-white font-medium shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <span className="text-lg w-6 flex justify-center">💳</span>
              <span className="text-sm">Payment Verification</span>
            </div>
            <div
              onClick={() => onPageChange('seller-payouts')}
              className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 gap-3 rounded-lg ${currentPage === 'seller-payouts'
                  ? 'bg-teal-600 text-white font-medium shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <span className="text-lg w-6 flex justify-center">💰</span>
              <span className="text-sm">Seller Payouts</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer Buttons */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={() => onLogout?.()}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
        <button className="w-full flex items-center justify-center space-x-2 py-3 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors text-sm">
          <span>←</span>
          <span>Back to Shopping</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
