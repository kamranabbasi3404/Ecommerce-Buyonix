import { FaSearch, FaShoppingCart, FaUser, FaStore, FaSignOutAlt, FaComments } from "react-icons/fa";
import { BsCamera } from "react-icons/bs";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Import Link, useNavigate, and useLocation from react-router-dom
import { useState, useEffect, useRef, useContext } from "react"; // Import hooks for state management
import logo from "../assets/logo.png";
import { checkAuthStatus } from "../utils/auth.js";
import { CartContext } from "../context/CartContextType";
import VisualSearch from "./VisualSearch";

const Navbar = () => {
  // State to track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // User data from localStorage or session
  const [userData, setUserData] = useState<{ displayName?: string; email?: string } | null>(null);
  // State to control dropdown visibility
  const [showDropdown, setShowDropdown] = useState(false);
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // Get current route path

  // Get cart context
  const cartContext = useContext(CartContext);
  // Visual search modal state
  const [showVisualSearch, setShowVisualSearch] = useState(false);




  // Ref for dropdown to handle click outside
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to handle logout
  const handleLogout = async () => {
    setIsLoggedIn(false);
    setShowDropdown(false);

    try {
      // Call backend logout endpoint
      await fetch('http://localhost:5000/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear authentication status from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');

    // Dispatch custom event to notify navbar of auth status change
    window.dispatchEvent(new Event('authStatusChanged'));

    // Reload page to ensure clean state (or navigate to home)
    window.location.href = '/';
  };

  // Check authentication status and listen for changes
  useEffect(() => {
    const checkLoginStatus = async () => {
      // First check localStorage for regular login
      const localLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const userInfoStr = localStorage.getItem("userInfo");

      // Load user data from localStorage
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          setUserData(userInfo);
        } catch (error) {
          console.error('Error parsing user info:', error);
        }
      }

      // Then check Google auth status
      try {
        const googleAuthData = await checkAuthStatus();
        const googleLoggedIn = googleAuthData && googleAuthData.success;

        // If Google auth is successful, update user data
        if (googleLoggedIn && googleAuthData.user) {
          setUserData(googleAuthData.user);
          localStorage.setItem('userInfo', JSON.stringify(googleAuthData.user));
        }

        // User is logged in if either local or Google auth is successful
        const isAuthenticated = localLoggedIn || googleLoggedIn;
        setIsLoggedIn(isAuthenticated);

        // If Google auth is successful, also set localStorage for consistency
        if (googleLoggedIn && !localLoggedIn) {
          localStorage.setItem('isLoggedIn', 'true');
        }
      } catch {
        // If Google auth check fails, fall back to localStorage
        setIsLoggedIn(localLoggedIn);
      }
    };

    // Check initial status
    checkLoginStatus();

    // Also check when the page becomes visible (useful for Google OAuth redirects)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkLoginStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for storage changes (when user logs in from anxother tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "isLoggedIn") {
        checkLoginStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events (when user logs in from same tab)
    const handleAuthChange = () => {
      checkLoginStatus();
    };

    window.addEventListener("authStatusChanged", handleAuthChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStatusChanged", handleAuthChange);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 w-full bg-white shadow-sm border-b border-gray-200 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex flex-col items-center">
          {/* Using Link component properly */}
          <Link to="/" className="flex flex-col items-center">
            <img
              src={logo}
              alt="BUYONIX Logo"
              className="h-10 w-10 object-contain"
            />
            <h1 className="font-bold text-sm text-gray-800">BUYONIX</h1>
          </Link>

        </div>

        {/* Navigation Links */}
        <ul className="flex space-x-8 text-gray-700 font-medium ml-8">
          <li className={`cursor-pointer ${location.pathname === '/' ? 'text-teal-600 font-semibold' : 'hover:text-teal-600'}`}>
            <Link to="/">Home</Link>
          </li>
          <li className={`cursor-pointer ${location.pathname === '/shop' ? 'text-teal-600 font-semibold' : 'hover:text-teal-600'}`}>
            <Link to="/shop">Shop</Link>
          </li>
          <li className={`cursor-pointer ${location.pathname === '/categories' ? 'text-teal-600 font-semibold' : 'hover:text-teal-600'}`}>
            <Link to="/categories">Categories</Link>
          </li>
          <li className={`cursor-pointer ${location.pathname === '/deals' ? 'text-teal-600 font-semibold' : 'hover:text-teal-600'}`}>
            <Link to="/deals">Deals</Link>
          </li>
          <li className={`cursor-pointer ${location.pathname === '/about' ? 'text-teal-600 font-semibold' : 'hover:text-teal-600'}`}>
            <Link to="/about">About</Link>
          </li>
        </ul>

        {/* Search Bar */}
        <div className="flex items-center border rounded-full px-4 py-2 w-80 bg-gray-50">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const q = searchQuery.trim();
                if (q.length > 0) {
                  navigate(`/shop?query=${encodeURIComponent(q)}`);
                } else {
                  navigate('/shop');
                }
              }
            }}
            className="ml-2 w-full bg-transparent outline-none text-sm text-gray-700"
          />
          <button
            aria-label="Search"
            onClick={() => {
              const q = searchQuery.trim();
              if (q.length > 0) navigate(`/shop?query=${encodeURIComponent(q)}`);
              else navigate('/shop');
            }}
            className="ml-2"
          >
            <FaSearch className="text-gray-400" />
          </button>
          <button
            onClick={() => setShowVisualSearch(true)}
            className="ml-2 p-1 hover:bg-teal-50 rounded-full transition-colors"
            aria-label="Visual Search"
            title="Search by image"
          >
            <BsCamera className="text-teal-600 text-lg" />
          </button>


        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center space-x-4">
          <Link to="/become-seller" className="flex items-center border border-orange-500 text-orange-500 px-4 py-1.5 rounded-md hover:bg-orange-50">
            <FaStore className="mr-2" />
            Become a Seller
          </Link>

          {isLoggedIn ? (
            // User profile with dropdown when logged in
            <div className="relative" ref={dropdownRef}>
              <div
                className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <FaUser />
              </div>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    {userData && (
                      <>
                        <p className="font-semibold text-gray-800">{userData.displayName || 'User'}</p>
                        <p className="text-sm text-gray-600">{userData.email}</p>
                      </>
                    )}
                  </div>
                  <div className="p-2">
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      👤 My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      📦 My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      ❤️ My Wishlist
                    </Link>
                    <Link
                      to="/chats"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      💬 My Chats
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link
                      to="/settings"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      ⚙️ Settings
                    </Link>
                    <Link
                      to="/support"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      🎧 Customer Support
                    </Link>
                    <Link
                      to="/faqs"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      ❓ FAQs
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
                    >
                      <FaSignOutAlt className="mr-2" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Sign In button when not logged in
            <Link to="/signin" className="flex items-center bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700">
              <FaUser className="mr-2" />
              Sign In
            </Link>
          )}

          {isLoggedIn && (
            <Link to="/chats" className="relative text-gray-700 hover:text-teal-600 transition-colors">
              <FaComments className="text-xl" />
            </Link>
          )}

          <button
            onClick={() => cartContext?.setIsCartOpen(true)}
            className="relative text-gray-700 hover:text-teal-600 transition-colors"
            aria-label="Shopping cart"
          >
            <FaShoppingCart className="text-2xl" />
            {cartContext && cartContext.cartItems.length > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartContext.cartItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Visual Search Modal */}
      <VisualSearch
        isOpen={showVisualSearch}
        onClose={() => setShowVisualSearch(false)}
      />
    </nav>
  );
};

export default Navbar;