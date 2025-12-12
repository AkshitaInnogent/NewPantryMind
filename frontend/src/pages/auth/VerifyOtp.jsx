import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyRegistrationOtp, sendRegistrationOtp } from "../../features/auth/authThunks";
import { clearError } from "../../features/auth/authSlice";
import { Alert } from "../../components/ui";

export default function VerifyOtp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [otp, setOtp] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  
  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) {
      navigate("/register");
      return;
    }
    if (isAuthenticated) {
      navigate("/kitchen-setup");
    }
  }, [email, isAuthenticated, user, navigate]);

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
    setResendLoading(true);
    setResendMessage("");
    try {
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
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>



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
            onClick={() => {
              dispatch(clearRegistrationState());
              navigate("/register");
            }}
            className="text-gray-500 hover:underline text-sm"
          >
            Back to Registration
          </button>
        </div>
      </div>
    </div>
  );
}