import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/user/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: form.newPassword,
        }),
      });

      if (response.ok) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError("Invalid or expired token");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f7faf7] px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-200">
        
        <div className="inline-flex items-center gap-2 bg-[#e8f7ec] text-[#14833b] px-4 py-2 rounded-full text-sm font-medium mx-auto mb-6">
          🔐 New Password
        </div>

        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Reset Password
        </h2>

        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Enter new password"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1fa74a] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1fa74a] focus:border-transparent"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className={`w-full mt-6 py-3 rounded-xl text-white font-semibold transition-all ${
            loading || !token
              ? "bg-[#1fa74a]/40 cursor-not-allowed"
              : "bg-[#1fa74a] hover:bg-[#188a3c] shadow-sm hover:shadow-md"
          }`}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-[#1fa74a] hover:underline text-sm"
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}