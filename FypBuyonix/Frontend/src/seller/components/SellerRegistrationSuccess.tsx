import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const SellerRegistrationSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex items-center justify-center px-6">
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

      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-12">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
          Application Submitted Successfully!
        </h1>
        
        <p className="text-center text-gray-600 mb-8">
          Thank you for your interest in becoming a Buyonix seller. Your application has been received and is now pending admin review.
        </p>

        {/* What Happens Next */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">What happens next?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Admin Review</h3>
                <p className="text-sm text-gray-600">Our admin team will review your application and verify all submitted documents.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Email Notification</h3>
                <p className="text-sm text-gray-600">You'll receive an email with the approval status within 1-2 business days.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Access Your Dashboard</h3>
                <p className="text-sm text-gray-600">Once approved, you can log in with your credentials and start selling immediately!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Return Button */}
        <Link
          to="/"
          className="w-full bg-teal-600 text-white py-3 rounded-md font-medium hover:bg-teal-700 transition-colors flex items-center justify-center"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default SellerRegistrationSuccess;

