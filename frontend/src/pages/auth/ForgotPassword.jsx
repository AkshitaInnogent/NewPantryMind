import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:8080/api/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("Password reset email sent! Check your inbox.");
      } else {
        setError("Email not found or error occurred");
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
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {loading ? "Sending..." : "Send Reset Link"}
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