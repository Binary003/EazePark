import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaCar,
  FaGoogle,
  FaApple,
  FaFacebook,
} from "react-icons/fa";

const WelcomePage = ({ onSignupClick }) => {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginClick = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailOrPhone, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("userId", data.userId);
        navigate("/map");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLoginClick();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-amber-400/20 to-orange-400/20"></div>
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-6">
              <FaCar className="text-white text-4xl" />
            </div>
            <img
              src="./image 2.png"
              alt="Eaze Park"
              className="rounded-3xl shadow-2xl mb-8 max-w-md mx-auto"
            />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-4">
            EazePark
          </h1>
          <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-md mx-auto">
            Find, reserve, and pay for parking spots effortlessly.
            <span className="text-yellow-600 font-semibold">
              {" "}
              Smart parking
            </span>{" "}
            made simple.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                Real-time availability
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Secure payments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-4">
              <FaCar className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              EazePark
            </h1>
          </div>

          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome Back!
              </h2>
              <p className="text-gray-600">
                Sign in to your account to continue
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter email or phone number"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>

              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <button
                onClick={handleLoginClick}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="text-yellow-600 font-semibold hover:text-yellow-700 transition-colors"
                >
                  Sign up here
                </button>
              </p>
            </div>

            <div className="flex items-center my-8">
              <hr className="flex-1 border-gray-300" />
              <span className="text-sm text-gray-500 mx-4 font-medium">
                Or continue with
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

export default WelcomePage;
