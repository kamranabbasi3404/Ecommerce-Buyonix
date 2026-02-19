import React, { useState, useRef, useEffect } from 'react';

interface OTPVerificationProps {
  email: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
  isLoading?: boolean;
  error?: string;
  purpose: 'signup' | 'login';
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onVerify,
  onResend,
  isLoading = false,
  error,
  purpose,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    // Countdown timer for resend
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.length === 6) {
      onVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const pastedDigits = pastedData.split('').filter(char => /^\d$/.test(char));
    
    if (pastedDigits.length === 6) {
      const newOtp = [...pastedDigits];
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      onVerify(newOtp.join(''));
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    setCountdown(60);
    setCanResend(false);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    onResend();
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Verify Your Email</h3>
        <p className="text-sm text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="text-sm font-medium text-teal-600 mt-1">{email}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-center gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        ))}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => onVerify(otp.join(''))}
          disabled={otp.some(digit => !digit) || isLoading}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            otp.every(digit => digit !== '') && !isLoading
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
      </div>

      <div className="text-center text-sm">
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading}
            className="text-teal-600 hover:text-teal-700 font-medium disabled:text-gray-400"
          >
            Resend OTP
          </button>
        ) : (
          <p className="text-gray-600">
            Resend OTP in <span className="font-semibold">{countdown}s</span>
          </p>
        )}
      </div>

      <div className="text-center text-xs text-gray-500">
        <p>Didn't receive the code? Check your spam folder</p>
      </div>
    </div>
  );
};

export default OTPVerification;

