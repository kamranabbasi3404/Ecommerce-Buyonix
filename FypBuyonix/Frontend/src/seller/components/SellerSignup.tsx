import { useNavigate } from "react-router-dom";

const SellerSignup = () => {
  const navigate = useNavigate();

  // Display registration process overview
  return (
    <div>
        {/* Registration Process Steps */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-800">Create Account</h5>
              <p className="text-xs text-gray-600">Set up your login credentials</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-800">Business Details</h5>
              <p className="text-xs text-gray-600">Tell us about your business and store</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-800">Verification</h5>
              <p className="text-xs text-gray-600">Upload documents for verification</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              4
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-800">Admin Approval</h5>
              <p className="text-xs text-gray-600">Wait for admin verification (1-2 days)</p>
            </div>
          </div>
        </div>

        {/* Start Registration Button */}
        <button
          type="button"
          onClick={() => navigate("/seller-registration")}
          className="w-full bg-orange-500 text-white py-3 rounded-md font-medium hover:bg-orange-600 transition-colors flex items-center justify-center"
        >
          <span className="mr-2"></span> Start Registration
        </button>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <span className="text-teal-600 font-medium cursor-pointer hover:text-teal-700">
              Log in here
            </span>
          </p>
        </div>
      </div>
  );
};

export default SellerSignup;
