import { useState } from "react";
import { FaStore } from "react-icons/fa";
import { Link } from "react-router-dom";
import SellerLogin from "../components/SellerLogin.tsx";
import SellerSignup from "../components/SellerSignup.tsx";
import logo from "../../assets/logo.png";

const SellerPortal = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("signup");

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
      {/* Logo at Top Center */}
      <div className="flex justify-center pt-6 pb-4">
        <Link to="/seller-dashboard" className="flex flex-col items-center">
          <img 
            src={logo} 
            alt="BUYONIX Logo" 
            className="h-12 w-12 object-contain"           
          />
          <h1 className="font-bold text-lg text-gray-800 mt-1">BUYONIX</h1>
          
        </Link>
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-6 right-6">
        <Link 
          to="/" 
          className="flex items-center text-gray-700 hover:text-teal-600 font-medium"
        >
          <span className="mr-2">←</span> Back to Home
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Information */}
          <div className="space-y-6">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-4 rounded-full">
                <FaStore className="text-4xl text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Seller Portal</h1>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-800">
                Grow your business with Buyonix's AI-powered e-commerce platform
              </h2>
            </div>

            {/* Benefits List */}
            <div className="bg-white rounded-lg p-6 shadow-md space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Why sell on Buyonix?
              </h3>
              
              <div className="flex items-start space-x-3">
                <div className="bg-teal-100 p-2 rounded-full mt-1">
                  <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Access millions of customers across Pakistan</h4>
                  <p className="text-sm text-gray-600">Reach a vast customer base and expand your business nationwide.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-teal-100 p-2 rounded-full mt-1">
                  <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">AI-powered analytics and sales insights</h4>
                  <p className="text-sm text-gray-600">Make data-driven decisions with advanced analytics tools.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-teal-100 p-2 rounded-full mt-1">
                  <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Secure payment processing and fast payouts</h4>
                  <p className="text-sm text-gray-600">Get paid quickly with our reliable payment system.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-teal-100 p-2 rounded-full mt-1">
                  <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">24/7 seller support and training resources</h4>
                  <p className="text-sm text-gray-600">Get help whenever you need it from our dedicated team.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Signup Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 pb-3 text-center font-medium transition-colors ${
                  activeTab === "login"
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="mr-2">🔓</span> Login
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={`flex-1 pb-3 text-center font-medium transition-colors ${
                  activeTab === "signup"
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="mr-2">📝</span> Sign Up
              </button>
            </div>

            {/* Welcome Message */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {activeTab === "signup" ? "Start Selling Today" : "Welcome Back"}
              </h3>
              <p className="text-gray-600 mt-1">
                {activeTab === "signup" 
                  ? "Create your seller account in just a few steps" 
                  : "Log in to access your seller dashboard"}
              </p>
            </div>

            {/* Form Content */}
            {activeTab === "login" ? <SellerLogin /> : <SellerSignup />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerPortal;
