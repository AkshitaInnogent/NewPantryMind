import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyRegistrationOtp, sendRegistrationOtp, registerUser } from "../../features/auth/authThunks";
import { clearError } from "../../features/auth/authSlice";

export default function VerifyOtp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [otp, setOtp] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [registrationAttempted, setRegistrationAttempted] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  
  const email = location.state?.email || "";
  const registrationData = location.state?.registrationData;
  const fromRegistration = location.state?.fromRegistration;

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/kitchen-setup");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Send registration OTP automatically when coming from registration (only once)
    if (fromRegistration && registrationData && !registrationAttempted) {
      setRegistrationAttempted(true);
      handleInitialRegistration();
    }
  }, [fromRegistration, registrationData, registrationAttempted]);

  const handleInitialRegistration = async () => {
    if (initialLoading) return; // Prevent duplicate calls
    
    setInitialLoading(true);
    try {
      // First register the user
      await dispatch(registerUser(registrationData)).unwrap();
      // Then send OTP
      await dispatch(sendRegistrationOtp(email)).unwrap();
    } catch (err) {
      // Don't navigate back, just show error - user can try resend or go back manually
      console.error('Registration/OTP sending failed:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      dispatch(clearError());
      try {
        await dispatch(verifyRegistrationOtp({ email, otp })).unwrap();
        navigate("/kitchen-setup");
      } catch (err) {
        // Error handled by Redux
      }
    }
  };

  const handleResendOtp = async () => {
    if (resendLoading || initialLoading) return; // Prevent duplicate calls
    
    setResendLoading(true);
    setResendMessage("");
    dispatch(clearError());
    try {
      // If we have registration data, register first then send OTP
      if (fromRegistration && registrationData) {
        await dispatch(registerUser(registrationData)).unwrap();
      }
      await dispatch(sendRegistrationOtp(email)).unwrap();
      setResendMessage("OTP sent successfully!");
      setCountdown(60);
    } catch (err) {
      setResendMessage("Failed to send OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f7faf7] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-200">
        <div className="inline-flex items-center gap-2 bg-[#e8f7ec] text-[#14833b] px-4 py-2 rounded-full text-sm font-medium mx-auto mb-6">
          📧 Verify Email
        </div>

        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-4">
          Enter Verification Code
        </h2>

        <p className="text-center text-gray-600 mb-6 text-sm">
          {initialLoading ? "Setting up your account..." : `We've sent a 6-digit code to `}<strong>{email}</strong>
        </p>

        {initialLoading && (
          <div className="bg-blue-100 text-blue-700 p-3 rounded-lg mb-4 text-sm text-center">
            📧 Registering your account and sending OTP...
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {typeof error === 'string' ? error : error.error || error.message || "An error occurred"}
          </div>
        )}

        {resendMessage && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${
            resendMessage.includes('successfully') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {resendMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1fa74a] focus:border-transparent text-center text-2xl tracking-widest"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all ${
              loading || otp.length !== 6
                ? "bg-[#1fa74a]/40 cursor-not-allowed"
                : "bg-[#1fa74a] hover:bg-[#188a3c] shadow-sm hover:shadow-md"
            }`}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResendOtp}
            disabled={resendLoading || countdown > 0}
            className={`text-[#1fa74a] hover:underline text-sm ${
              resendLoading || countdown > 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : resendLoading ? "Sending..." : "Resend Code"}
          </button>
        </div>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              console.log('Back button clicked');
              window.location.href = '/register';
            }}
            className="text-gray-500 hover:underline text-sm cursor-pointer"
          >
            ← Back to Registration
          </button>
        </div>
      </div>
    </div>
  );
}