import { useState } from "react";
import { FaEye, FaEyeSlash, FaStore } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const SellerRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessType: "",
    businessAddress: "",
    storeName: "",
    storeDescription: "",
    primaryCategory: "",
    website: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    iban: "",
    cnicNumber: "",
    taxNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = async () => {
    // Validation for each step
    if (currentStep === 1) {
      // Step 1: Account validation
      if (!formData.fullName) {
        return; // Browser will show "Please fill out this field"
      }
      if (!formData.email) {
        return;
      }
      if (!formData.phone) {
        return;
      }
      if (!formData.password) {
        return;
      }
      if (!formData.confirmPassword) {
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match!");
        return;
      }
    } else if (currentStep === 2) {
      // Step 2: Business validation
      if (!formData.businessName) {
        return;
      }
      if (!formData.businessType) {
        return;
      }
    } else if (currentStep === 3) {
      // Step 3: Store validation
      if (!formData.storeName) {
        return;
      }
      if (!formData.storeDescription) {
        return;
      }
      if (!formData.primaryCategory) {
        return;
      }
    } else if (currentStep === 4) {
      // Step 4: Bank validation
      if (!formData.accountHolderName) {
        return;
      }
      if (!formData.bankName) {
        return;
      }
      if (!formData.accountNumber) {
        return;
      }
      if (!formData.iban) {
        return;
      }
    } else if (currentStep === 5) {
      // Step 5: Verification validation
      if (!formData.cnicNumber) {
        return;
      }
      if (!formData.taxNumber) {
        return;
      }
      // On final step, submit registration to backend
      await handleSubmitRegistration();
      return;
    }

    // Move to next step if validation passes
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitRegistration = async () => {
    setIsSubmitting(true);
    setError("");
    
    try {
      const response = await fetch('http://localhost:5000/seller/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          businessName: formData.businessName,
          businessType: formData.businessType,
          businessAddress: formData.businessAddress,
          storeName: formData.storeName,
          storeDescription: formData.storeDescription,
          primaryCategory: formData.primaryCategory,
          website: formData.website,
          accountHolderName: formData.accountHolderName,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          iban: formData.iban,
          cnicNumber: formData.cnicNumber,
          taxNumber: formData.taxNumber
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Seller registration successful:', result.seller);
        // Store seller ID in localStorage
        localStorage.setItem('sellerId', result.seller.id);
        localStorage.setItem('sellerName', result.seller.storeName);
        localStorage.setItem('sellerEmail', result.seller.email);
        // Navigate to success page
        navigate("/seller-registration-success");
      } else {
        setError(result.message || 'Registration failed. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: "Account" },
    { number: 2, label: "Business" },
    { number: 3, label: "Store" },
    { number: 4, label: "Banking" },
    { number: 5, label: "Verify" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
      {/* Logo at Top Left */}
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src={logo} 
            alt="BUYONIX Logo" 
            className="h-14 w-14 object-contain"
          />
        </Link>
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-6 right-6">
        <Link 
          to="/become-seller" 
          className="flex items-center text-gray-700 hover:text-teal-600 font-medium"
        >
          <span className="mr-2">←</span> Back to Home
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 pt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-4 rounded-full">
              <FaStore className="text-3xl text-orange-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Become a Buyonix Seller</h1>
          <p className="text-gray-600">
            Join thousands of successful sellers and grow your business with our AI-powered platform
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center items-center mb-12">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    currentStep >= step.number
                      ? "bg-teal-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step.number}
                </div>
                <span className="text-xs mt-2 text-gray-600">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    currentStep > step.number ? "bg-teal-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Side - Form */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {currentStep === 1 && "Create Your Seller Account"}
              {currentStep === 2 && "Business Information"}
              {currentStep === 3 && "Store Details"}
              {currentStep === 4 && "Bank Details"}
              {currentStep === 5 && "Verification Documents"}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {currentStep === 1 && "Set up your login credentials to access your seller dashboard"}
              {currentStep === 2 && "Tell us about your business"}
              {currentStep === 3 && "Set up your online store"}
              {currentStep === 4 && "For receiving payments from sales"}
              {currentStep === 5 && "Required for account verification"}
            </p>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
              {/* Step 1: Account */}
              {currentStep === 1 && (
                <>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="youremail@example.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">You'll use this email to log into your seller account</p>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+92 300 1234567"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter your password"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Business - Placeholder */}
              {currentStep === 2 && (
                <>
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Enter your business name"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type *
                    </label>
                    <input
                      type="text"
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      placeholder="e.g., Individual, Company, Partnership"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Business Email *
                    </label>
                    <input
                      type="email"
                      id="businessEmail"
                      name="businessEmail"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="business@example.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Business Phone *
                    </label>
                    <input
                      type="tel"
                      id="businessPhone"
                      name="businessPhone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+92 300 1234567"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>
                </>
              )}

              {/* Step 3: Store - Placeholder */}
              {currentStep === 3 && (
                <>
                  <div>
                    <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      id="storeName"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                      placeholder="Your store name on Buyonix"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="storeDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      Store Description *
                    </label>
                    <textarea
                      id="storeDescription"
                      name="storeDescription"
                      value={formData.storeDescription}
                      onChange={(e) => handleChange(e as any)}
                      placeholder="Describe what you sell and what makes your store unique"
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="primaryCategory" className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Category *
                    </label>
                    <input
                      type="text"
                      id="primaryCategory"
                      name="primaryCategory"
                      value={formData.primaryCategory}
                      onChange={handleChange}
                      placeholder="e.g., Electronics, Fashion, Home & Garden"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                      Website (Optional)
                    </label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* Step 4: Banking - Placeholder */}
              {currentStep === 4 && (
                <>
                  <div>
                    <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      id="accountHolderName"
                      name="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={handleChange}
                      placeholder="Full name as per bank account"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      id="bankName"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      placeholder="e.g., HBL, UBL, Meezan Bank"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      placeholder="Enter your account number"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="iban" className="block text-sm font-medium text-gray-700 mb-2">
                      IBAN *
                    </label>
                    <input
                      type="text"
                      id="iban"
                      name="iban"
                      value={formData.iban}
                      onChange={handleChange}
                      placeholder="PK36SCBL0000001123456702"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>
                </>
              )}

              {/* Step 5: Verify - Placeholder */}
              {currentStep === 5 && (
                <>
                  <div>
                    <label htmlFor="cnicNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      CNIC Number *
                    </label>
                    <input
                      type="text"
                      id="cnicNumber"
                      name="cnicNumber"
                      value={formData.cnicNumber}
                      onChange={handleChange}
                      placeholder="12345-1234567-1"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      NTN / Sales Tax Number *
                    </label>
                    <input
                      type="text"
                      id="taxNumber"
                      name="taxNumber"
                      value={formData.taxNumber}
                      onChange={handleChange}
                      placeholder="Enter your tax number"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="space-y-4 mt-6">
                    <h3 className="text-sm font-semibold text-gray-700">Upload Documents</h3>
                    
                    {/* CNIC Front & Back */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center">
                        <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-600 mb-1">CNIC Front & Back</p>
                        <button
                          type="button"
                          className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                        >
                          Choose Files
                        </button>
                      </div>
                    </div>

                    {/* Business Documents */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center">
                        <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-600 mb-1">All Related Business Documents</p>
                        <button
                          type="button"
                          className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                        >
                          Choose Files
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-md font-medium ${
                    currentStep === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  ← Previous
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting 
                    ? "Submitting..." 
                    : currentStep === 5 
                      ? "Complete Registration" 
                      : "Next Step"} →
                </button>
              </div>
            </form>
          </div>

          {/* Right Side - Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Why Sell on Buyonix?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="text-teal-600 mt-1">✓</div>
                  <p className="text-sm text-gray-600">Access to millions of customers</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="text-teal-600 mt-1">✓</div>
                  <p className="text-sm text-gray-600">AI-powered sales analytics</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="text-teal-600 mt-1">✓</div>
                  <p className="text-sm text-gray-600">Smart inventory management</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="text-teal-600 mt-1">✓</div>
                  <p className="text-sm text-gray-600">Multiple payment options</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="text-teal-600 mt-1">✓</div>
                  <p className="text-sm text-gray-600">24/7 seller support</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="text-teal-600 mt-1">✓</div>
                  <p className="text-sm text-gray-600">Marketing tools included</p>
                </div>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-8">
              <h4 className="text-base font-semibold text-teal-800 mb-3">Commission Rate</h4>
              <p className="text-4xl font-bold text-teal-600 mb-4">5%</p>
              <p className="text-sm text-gray-600 mt-3 mb-1">Monthly Fee</p>
              <p className="text-lg font-semibold text-orange-500 mb-3">FREE</p>
              <p className="text-sm text-gray-600 mt-3 mb-1">Payout Cycle</p>
              <p className="text-lg font-semibold text-gray-700">Weekly</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <p className="text-2xl font-bold text-teal-600">10,000+</p>
            <p className="text-sm text-gray-600">Active Sellers</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <p className="text-2xl font-bold text-teal-600">50M+</p>
            <p className="text-sm text-gray-600">Monthly Visitors</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <p className="text-2xl font-bold text-teal-600">98%</p>
            <p className="text-sm text-gray-600">Seller Satisfaction</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <p className="text-2xl font-bold text-teal-600">24/7</p>
            <p className="text-sm text-gray-600">Support Available</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerRegistration;
