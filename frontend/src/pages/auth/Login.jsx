import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../features/auth/authThunks";
import { clearError } from "../../features/auth/authSlice";
import { Input } from "../../components/ui";
import { showToast } from "../../utils/toast";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, user, error, isAuthenticated } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Handle success notification
  useEffect(() => {
    if (isAuthenticated && user) {
      showToast.success(`Welcome back, ${user.firstName || user.email}!`);
    }
  }, [isAuthenticated, user]);

  // Handle error notification - removed toast for login page
  // Error will only show in the login card

  // Role-based redirect after login
  useEffect(() => {
    if (user) {
      console.log(" User role on login:", user.role);
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "MEMBER") {
        navigate("/member");
      } else {
        navigate("/kitchen-setup");
      }
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginUser(form));
  };

  const handleInputChange = (field, value) => {
    if (error) dispatch(clearError());
    setForm({ ...form, [field]: value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f7faf7] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-200"
      >
        {/* Green tag like landing page */}
        <div className="inline-flex items-center gap-2 bg-[#e8f7ec] text-[#14833b] px-4 py-2 rounded-full text-sm font-medium mx-auto mb-6">
          🔒 Secure Login
        </div>

        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm flex items-center gap-3 animate-pulse">
            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 text-xs">⚠️</span>
            </div>
            <div>
              <p className="font-medium">Login Failed</p>
              <p className="text-red-600 mt-1">
                {typeof error === 'string' ? error : error.error || error.message || "Please check your email and password and try again."}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Email"
            value={form.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          />
        </div>

        <button
          disabled={loading}
          className={`w-full mt-6 py-3 rounded-xl text-white font-semibold transition-all
            ${
              loading
                ? "bg-[#1fa74a]/40 cursor-not-allowed"
                : "bg-[#1fa74a] hover:bg-[#188a3c] shadow-sm hover:shadow-md"
            }
          `}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mt-4 text-sm text-gray-500">
          Forgot password?{" "}
          <span 
            onClick={() => navigate("/forgot-password")}
            className="text-[#1fa74a] hover:underline cursor-pointer"
          >
            Reset
          </span>
        </p>
      </form>
    </div>
  );
}
