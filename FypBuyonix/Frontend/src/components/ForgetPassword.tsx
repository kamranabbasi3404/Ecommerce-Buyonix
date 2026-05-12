import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../assets/logo.png';
import OTPVerification from './OTPVerification';

type ForgetPasswordStep = 'email' | 'otp' | 'newPassword' | 'success';

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<ForgetPasswordStep>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Step 1: Handle email submission to send OTP
  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/auth/send-forgot-password-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        setStep('otp');
      } else {
        setError(result.message || 'Failed to send OTP. Please check your email.');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP verification
  const handleVerifyOTP = async (enteredOtp: string) => {
    setIsLoading(true);
    setError('');
    setOtp(enteredOtp);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-forgot-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: enteredOtp,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStep('newPassword');
      } else {
        setError(result.message || 'OTP verification failed');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-forgot-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Handle password reset
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    // Validate password length
    if (passwords.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStep('success');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={() => navigate('/login')}
        >
          <span className="text-2xl">&times;</span>
        </button>

        {/* Logo and title */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="BUYONIX Logo" className="h-12 w-12 object-contain mb-2" />
          <h2 className="text-xl font-semibold text-gray-800">
            {step === 'email' && 'Forgot Password'}
            {step === 'otp' && 'Verify Email'}
            {step === 'newPassword' && 'Reset Password'}
            {step === 'success' && 'Password Reset'}
          </h2>
          <p className="text-gray-600 text-sm">
            {step === 'email' && 'Enter your email address to receive OTP'}
            {step === 'otp' && 'Enter the 6-digit code sent to your email'}
            {step === 'newPassword' && 'Create a new password for your account'}
            {step === 'success' && 'Password reset successfully!'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Email Entry */}
        {step === 'email' && (
          <form onSubmit={handleSendOTP}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll send a verification code to this email address
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className={`w-full bg-teal-500 text-white py-2 rounded-md hover:bg-teal-600 active:bg-teal-700 active:scale-95 transition duration-200 font-medium ${
                isLoading || !email ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>

            <div className="mt-6 text-center text-sm">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-teal-600 font-medium hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <OTPVerification
            email={email}
            onVerify={handleVerifyOTP}
            onResend={handleResendOTP}
            isLoading={isLoading}
            error={error}
            purpose="forgot-password"
          />
        )}

        {/* Step 3: New Password */}
        {step === 'newPassword' && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Password match indicator */}
            {passwords.newPassword && passwords.confirmPassword && (
              <div className={`mb-4 px-3 py-2 rounded-md text-sm ${
                passwords.newPassword === passwords.confirmPassword
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {passwords.newPassword === passwords.confirmPassword
                  ? '✓ Passwords match'
                  : '✗ Passwords do not match'}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !passwords.newPassword || !passwords.confirmPassword}
              className={`w-full bg-teal-500 text-white py-2 rounded-md hover:bg-teal-600 active:bg-teal-700 active:scale-95 transition duration-200 font-medium ${
                isLoading || !passwords.newPassword || !passwords.confirmPassword
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <div className="mt-4 text-center text-sm text-gray-600">
              <button
                type="button"
                onClick={() => {
                  setStep('otp');
                  setError('');
                }}
                className="text-teal-600 hover:underline"
              >
                Go back to verify OTP
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Success Message */}
        {step === 'success' && (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Success!</h3>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You will be redirected to the login page in a few seconds.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-teal-500 text-white py-2 rounded-md hover:bg-teal-600 font-medium"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
