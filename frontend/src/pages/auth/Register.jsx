import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../features/auth/authThunks";
import { clearError } from "../../features/auth/authSlice";
import { Input, Alert } from "../../components/ui";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, user, isAuthenticated, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      navigate("/kitchen-setup");
    }
  }, [user, navigate]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      alert("You are already logged in!");
      return;
    }
    dispatch(clearError());
    dispatch(registerUser(form));
  };

  return (
    <div className="m-2 p-4 flex items-center justify-center min-h-screen bg-[#f7faf7] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-200"
      >
        {isAuthenticated && (
          <Alert
            type="warning"
            title="Already Logged In"
            message="You are already logged in. Please logout first to register a new account."
            className="mb-4"
          />
        )}

        {error && (
          <Alert
            type="error"
            title="Registration Failed"
            message={error.message || error || "User already exists or registration failed"}
            className="mb-4"
          />
        )}

        {/* Green Tag Badge (same style as landing page) */}
        <div className="inline-flex items-center gap-2 bg-[#e8f7ec] text-[#14833b] px-4 py-2 rounded-full text-sm font-medium mx-auto mb-6">
          📝 Create Your Account
        </div>

        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Register
        </h2>

        <div className="space-y-4">
          <Input
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            disabled={isAuthenticated}
          />

          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={isAuthenticated}
          />

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={isAuthenticated}
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={isAuthenticated}
          />
        </div>

        <button
          disabled={loading || isAuthenticated}
          className={`w-full mt-6 py-3 rounded-xl text-white font-semibold transition-all ${
            loading || isAuthenticated
              ? "bg-[#1fa74a]/40 cursor-not-allowed"
              : "bg-[#1fa74a] hover:bg-[#188a3c] shadow-sm hover:shadow-md"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center mt-4 text-sm text-gray-500">
          Already have an account?{" "}
          <span 
            onClick={() => navigate("/login")}
            className="text-[#1fa74a] hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
