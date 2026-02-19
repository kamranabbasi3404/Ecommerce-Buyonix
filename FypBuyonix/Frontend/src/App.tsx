import { Routes, Route, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import SignUp from './components/SignUp';
import Login from './components/Login';
import ShoppingCart from './components/ShoppingCart';
import { CartProvider } from './context/CartContext';
import SellerPortal from './seller/pages/SellerPortal.tsx';
import SellerRegistration from './seller/components/SellerRegistration.tsx';
import SellerRegistrationSuccess from './seller/components/SellerRegistrationSuccess.tsx';
import SellerDashboard from './seller/pages/SellerDashboard.tsx';
import SellerProducts from './seller/pages/SellerProducts.tsx';
import SellerOrders from './seller/pages/SellerOrders.tsx';
import SellerAnalytics from './seller/pages/SellerAnalytics.tsx';
import SellerPayouts from './seller/pages/SellerPayouts.tsx';
import SellerChats from './seller/pages/SellerChats.tsx';
import SellerSupport from './seller/pages/SellerSupport.tsx';
import About from './pages/About.tsx';
import Home from './pages/Home.tsx';
import Shop from './pages/Shop';
import Categories from './pages/Categories';
import Deals from './pages/Deals';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import BuyNow from './pages/BuyNow';
import OrderConfirmation from './pages/OrderConfirmation';
import ProductDetail from './pages/ProductDetail';
import AllChats from './pages/AllChats';
import Support from './pages/Support';
import FAQs from './pages/FAQs';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import Settings from './pages/Settings';
import Footer from './components/Footer';
// import Sidebar from './admin/components/Sidebar.tsx';;
// import DashboardContent from './admin/components/DashboardContent.tsx';;
// import UserManagement from './admin/components/UserManagement.tsx';
// import ProductManagement from './admin/components/ProductManagement.tsx';
// import OrderManagement from './admin/components/OrderManagement';  
// import CustomerSupport from './admin/components/CustomerSupport';
// import AnalyticsReports from './admin/components/AnalyticsReports';
// import PendingSellers from './admin/components/PendingSellers';
// import PaymentVerification from './admin/components/PaymentVerification';
// import SellerPayouts from './admin/components/SellerPayouts';





function App() {
  const location = useLocation();
  const isSellerRoute = location.pathname.startsWith('/seller-') || location.pathname === '/become-seller' || location.pathname === '/seller-registration' || location.pathname === '/seller-registration-success';

  return (
    <CartProvider>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50">
        {!isSellerRoute && <Navbar />}
        <div className={!isSellerRoute ? "pt-20" : ""}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signin" element={<Login />} /> {/* Alias for login */}
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            {/* Add more routes as needed */}
            <Route path="/shop" element={<Shop />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/buy-now" element={<BuyNow />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/chats" element={<AllChats />} />
            <Route path="/support" element={<Support />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/settings" element={<Settings />} />
            {/* <Route path="/cart" element={<Cart />} /> */}

            <Route path="/become-seller" element={<SellerPortal />} />
            <Route path="/seller-registration" element={<SellerRegistration />} />
            <Route path="/seller-registration-success" element={<SellerRegistrationSuccess />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/seller-products" element={<SellerProducts />} />
            <Route path="/seller-orders" element={<SellerOrders />} />
            <Route path="/seller-analytics" element={<SellerAnalytics />} />
            <Route path="/seller-payouts" element={<SellerPayouts />} />
            <Route path="/seller-chats" element={<SellerChats />} />
            <Route path="/seller-support" element={<SellerSupport />} />


          </Routes>
        </div>
        {!isSellerRoute && <ShoppingCart />}
        {!isSellerRoute && <Footer />}
      </div>
    </CartProvider>
  );
}

export default App;