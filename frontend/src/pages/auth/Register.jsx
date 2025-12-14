import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../features/auth/authThunks";
import { clearError } from "../../features/auth/authSlice";
import { Input } from "../../components/ui";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../utils/toast";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, user, isAuthenticated, error, registrationEmail } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return "";
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setForm({ ...form, email });
    setEmailError(validateEmail(email));
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setForm({ ...form, password });
    setPasswordError(validatePassword(password));
  };

  useEffect(() => {
    if (user) {
      navigate("/kitchen-setup");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (registrationEmail) {
      showToast.success("Registration successful! Please check your email for OTP.");
      navigate("/verify-otp", { state: { email: registrationEmail } });
    }
  }, [registrationEmail, navigate]);

  useEffect(() => {
    if (error) {
      const errorMessage = typeof error === 'string' ? error : 
        error.error || error.message || "Registration failed";
      showToast.error(errorMessage);
    }
  }, [error]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      showToast.warning("You are already logged in!");
      return;
    }
    
    const emailValidationError = validateEmail(form.email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }
    
    const passwordValidationError = validatePassword(form.password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    
    dispatch(clearError());
    try {
      await dispatch(registerUser(form)).unwrap();
      // Registration successful, will redirect to OTP verification via useEffect
    } catch (err) {
      // Error handled by Redux
    }
  };

  return (
    <div className="m-2 p-4 flex items-center justify-center min-h-screen bg-[#f7faf7] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-200"
      >


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

          <div>
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={handleEmailChange}
              disabled={isAuthenticated}
              className={emailError ? "border-red-500" : ""}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          <div>
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={handlePasswordChange}
              disabled={isAuthenticated}
              className={passwordError ? "border-red-500" : ""}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>
        </div>

        <button
          disabled={loading || isAuthenticated || emailError || passwordError}
          className={`w-full mt-6 py-3 rounded-xl text-white font-semibold transition-all ${
            loading || isAuthenticated || emailError
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
