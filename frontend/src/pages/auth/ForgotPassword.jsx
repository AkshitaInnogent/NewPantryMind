import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { sendPasswordResetOtp, resetPasswordWithOtp } from "../../features/auth/authThunks";
import { clearError } from "../../features/auth/authSlice";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const [step, setStep] = useState(1); // 1: email, 2: otp + password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleInputChange = (field, value) => {
    if (error) dispatch(clearError());
    if (field === 'email') setEmail(value);
    if (field === 'otp') setOtp(value.replace(/\D/g, "").slice(0, 6));
    if (field === 'newPassword') setNewPassword(value);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setMessage("");
    try {
      console.log("Sending OTP to:", email);
      const result = await dispatch(sendPasswordResetOtp(email)).unwrap();
      console.log("OTP sent successfully:", result);
      setMessage("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      console.error("Failed to send OTP:", err);
      // Error handled by Redux
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    try {
      await dispatch(resetPasswordWithOtp({ email, otp, newPassword })).unwrap();
      // Don't navigate here - let the useEffect handle it
    } catch (err) {
      // Error handled by Redux
    }
  };

  // Use useEffect to handle navigation after authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/kitchen-setup");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f7faf7] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-200">
        
        <div className="inline-flex items-center gap-2 bg-[#e8f7ec] text-[#14833b] px-4 py-2 rounded-full text-sm font-medium mx-auto mb-6">
          🔑 Reset Password
        </div>

        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Forgot Password?
        </h2>

        <p className="text-center text-gray-600 mb-6 text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {typeof error === 'string' ? error : error.error || error.message || "An error occurred. Please try again."}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1fa74a] focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold transition-all ${
                loading
                  ? "bg-[#1fa74a]/40 cursor-not-allowed"
                  : "bg-[#1fa74a] hover:bg-[#188a3c] shadow-sm hover:shadow-md"
              }`}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => handleInputChange('otp', e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1fa74a] focus:border-transparent text-center text-xl tracking-widest"
                maxLength={6}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1fa74a] focus:border-transparent"
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
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Back to Email
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-[#1fa74a] hover:underline text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}