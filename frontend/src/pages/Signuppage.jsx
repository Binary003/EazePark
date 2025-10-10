import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCar,
  FaGoogle,
  FaApple,
  FaFacebook,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const SignupPage = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Real-time password validation
    if (e.target.name === "password") {
      const password = e.target.value;
      setPasswordValidation({
        minLength: password.length >= 8,
        hasNumber: /\d/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      });
    }
  };

  const handleSignupClick = async () => {
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (
      !passwordValidation.minLength ||
      !passwordValidation.hasNumber ||
      !passwordValidation.hasSpecial
    ) {
      setError("Please meet all password requirements!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          }),
        }
      );

      if (response.ok) {
        alert("Signup successful! Please log in.");
        navigate("/");
      } else {
        const data = await response.json();
        setError(data.error || "Signup failed. Try again.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationItem = ({ isValid, text }) => (
    <div
      className={`flex items-center space-x-2 text-sm ${
        isValid ? "text-green-600" : "text-gray-400"
      }`}
    >
      {isValid ? <FaCheck size={12} /> : <FaTimes size={12} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-blue-400/20 to-indigo-400/20"></div>
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-6">
              <FaCar className="text-white text-4xl" />
            </div>
            <img
              src="./img3.png"
              alt="Eaze Park"
              className="rounded-3xl shadow-2xl mb-8 max-w-md mx-auto"
            />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-4">
            Join EazePark
          </h1>
          <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-md mx-auto">
            Create your account and start your
            <span className="text-purple-600 font-semibold">
              {" "}
              smart parking
            </span>{" "}
            journey today.
          </p>
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Free account setup</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                Instant parking access
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">24/7 customer support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-4">
              <FaCar className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              EazePark
            </h1>
          </div>

          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Create Account
              </h2>
              <p className="text-gray-600">Join thousands of happy parkers</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                  onChange={handleChange}
                  value={formData.name}
                />
              </div>

              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                  onChange={handleChange}
                  value={formData.email}
                />
              </div>

              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone number"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                  onChange={handleChange}
                  value={formData.phone}
                />
              </div>

              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                  onChange={handleChange}
                  value={formData.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {formData.password && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Password Requirements:
                  </h4>
                  <ValidationItem
                    isValid={passwordValidation.minLength}
                    text="At least 8 characters"
                  />
                  <ValidationItem
                    isValid={passwordValidation.hasNumber}
                    text="Contains a number"
                  />
                  <ValidationItem
                    isValid={passwordValidation.hasSpecial}
                    text="Contains special character"
                  />
                </div>
              )}

              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  className={`w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                    formData.confirmPassword &&
                    formData.password !== formData.confirmPassword
                      ? "border-red-300 focus:ring-red-400"
                      : "border-gray-200 focus:ring-purple-400"
                  }`}
                  onChange={handleChange}
                  value={formData.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    Passwords don't match
                  </p>
                )}

              <button
                onClick={handleSignupClick}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/")}
                  className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>

            <div className="flex items-center my-8">
              <hr className="flex-1 border-gray-300" />
              <span className="text-sm text-gray-500 mx-4 font-medium">
                Or sign up with
              </span>
              <hr className="flex-1 border-gray-300" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button className="flex items-center justify-center py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-300 transform hover:scale-105">
                <FaGoogle className="text-red-500 text-lg" />
              </button>
              <button className="flex items-center justify-center py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-300 transform hover:scale-105">
                <FaApple className="text-gray-800 text-lg" />
              </button>
              <button className="flex items-center justify-center py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-300 transform hover:scale-105">
                <FaFacebook className="text-blue-600 text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
