import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AdminLogin from './components/AdminLogin';
import DashboardContent from './components/DashboardContent';
import UserManagement from './components/UserManagement';
import ProductManagement from './components/ProductManagement';
import OrderManagement from './components/OrderManagement';
import CustomerSupport from './components/CustomerSupport';
import AnalyticsReports from './components/AnalyticsReports';
import PendingSellers from './components/PendingSellers';
import AllSellers from './components/AllSellers';
import PaymentVerification from './components/PaymentVerification';
import SellerPayouts from './components/SellerPayouts';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'users' | 'products' | 'orders' | 'support' | 'analytics' | 'pending-sellers' | 'all-sellers' | 'payment-verification' | 'seller-payouts'>('dashboard');

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('adminAuthenticated');
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      }
      setIsChecking(false);
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminUsername');
    setIsAuthenticated(false);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <UserManagement />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'support':
        return <CustomerSupport />;
      case 'analytics':
        return <AnalyticsReports />;
      case 'pending-sellers':
        return <PendingSellers />;
      case 'all-sellers':
        return <AllSellers />;
      case 'payment-verification':
        return <PaymentVerification />;
      case 'seller-payouts':
        return <SellerPayouts />;
      default:
        return <DashboardContent />;
    }
  };

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // Show dashboard if authenticated
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} onLogout={handleLogout} />
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default App;

