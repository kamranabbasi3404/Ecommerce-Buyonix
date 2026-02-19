import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import AddPayoutMethodModal from "../components/AddPayoutMethodModal.tsx";

const SellerPayouts = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get seller info from localStorage
    const sellerData = localStorage.getItem('sellerInfo');
    if (sellerData) {
      const seller = JSON.parse(sellerData);
      setSellerInfo(seller);
      // Fetch full seller details including bank info
      fetchSellerDetails(seller.id);
    } else {
      navigate('/become-seller');
    }
  }, [navigate]);

  const fetchSellerDetails = async (sellerId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/seller/${sellerId}`, {
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        setSellerInfo(result.seller);
      }
    } catch (error) {
      console.error('Error fetching seller details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = () => {
    // Refresh seller details after adding
    if (sellerInfo?._id) {
      fetchSellerDetails(sellerInfo._id);
    }
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const bankDetails = sellerInfo ? {
    bankName: sellerInfo.bankName,
    accountHolderName: sellerInfo.accountHolderName,
    accountNumber: sellerInfo.accountNumber,
    iban: sellerInfo.iban
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed top-0 left-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="BUYONIX" className="h-10 w-10" />
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="p-4">
          <div className="space-y-2">
            <Link
              to="/seller-dashboard"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span className="text-xl">📊</span>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/seller-products"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span className="text-xl">📦</span>
              <span>Products</span>
            </Link>

            <Link
              to="/seller-orders"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span className="text-xl">📋</span>
              <span>Orders</span>
            </Link>

            <Link
              to="/seller-analytics"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span className="text-xl">📈</span>
              <span>Analytics</span>
            </Link>

            <Link
              to="/seller-payouts"
              className="flex items-center space-x-3 px-4 py-3 bg-teal-600 text-white rounded-lg font-medium"
            >
              <span className="text-xl">💰</span>
              <span>Payouts</span>
            </Link>

            <Link
              to="/seller-chats"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span className="text-xl">💬</span>
              <span>Chats</span>
            </Link>
          </div>
        </nav>

        {/* Logout and Back to Shopping */}
        <div className="absolute bottom-6 left-4 right-4 space-y-2">
          <button
            onClick={async () => {
              try {
                await fetch('http://localhost:5000/seller/logout', {
                  method: 'POST',
                  credentials: 'include',
                });
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
          <Link
            to="/"
            className="flex items-center justify-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300"
          >
            <span>←</span>
            <span>Back to Shopping</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 ml-64">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Payout Settings</h1>
          <p className="text-gray-600 mt-1">Manage your payout methods and view payout history</p>
        </div>

        {/* Saved Payout Methods */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Bank Details</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              <span className="text-lg">✏️</span>
              <span>Update Bank Details</span>
            </button>
          </div>

          {/* Bank Details Display */}
          {bankDetails ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏦</span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800">{bankDetails.bankName}</h3>
                    <p className="text-sm text-gray-600">Account Holder: {bankDetails.accountHolderName}</p>
                    <p className="text-sm text-gray-600">Account: ****-****-{bankDetails.accountNumber?.slice(-4)}</p>
                    <p className="text-sm text-gray-600">IBAN: {bankDetails.iban}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No bank details found. Please add your bank details to receive payouts.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Add Bank Details
              </button>
            </div>
          )}
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Payout History</h2>

          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <p className="text-gray-600">No payout history yet. Your payouts will appear here once you start receiving payments.</p>
          </div>
        </div>
      </div>

      {/* Add Payout Method Modal */}
      <AddPayoutMethodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMethod={handleAddMethod}
      />
    </div>
  );
};

export default SellerPayouts;
