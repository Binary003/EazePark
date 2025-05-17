import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const WelcomePage = ({ onSignupClick }) => {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLoginClick = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("userId", data.userId); // Store user ID
        navigate("/map"); // Navigate to map page on success
      } else {
        setError(data.error); // Show error message
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="flex min-h-screen bg-yellow-50">
      <div className="w-1/2 flex flex-col items-center justify-center p-8">
        <img
          src="./image 2.png"
          alt="Eaze Park"
          className="rounded-lg shadow-lg mb-6"
        />
        <h1 className="text-4xl font-bold text-gray-800">Eaze Park</h1>
        <p className="text-lg text-black mt-2">
          Book your parking before you start your day
        </p>
      </div>

      <div className="w-1/2 flex flex-col items-center justify-center bg-yellow-50 border-l-4 border-black p-8">
        <img src="./logo2.png" alt="Logo" className="w-72 h-32 mb-4" />
        <h2 className="text-2xl font-bold mb-6">Login to your Account</h2>
        {error && <p className="text-red-500">{error}</p>} {/* Error message */}
        <input
          type="text"
          placeholder="Enter mobile number or email"
          className="w-full p-3 border border-black rounded-md mb-4"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter password"
          className="w-full p-3 border border-black rounded-md mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full p-3 bg-yellow-500 text-white font-semibold rounded-md mb-4 hover:bg-yellow-600"
          onClick={handleLoginClick}
        >
          Login
        </button>
        <p className="text-sm text-gray-500">
          Don't have an account?{" "}
          <span
            className="text-yellow-500 font-semibold cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </span>
        </p>
        <div className="flex items-center my-4">
          <hr className="w-1/3 border-gray-300" />
          <span className="text-sm text-gray-500 mx-2">or</span>
          <hr className="w-1/3 border-gray-300" />
        </div>
        <button className="w-full p-3 border border-gray-300 text-gray-600 font-semibold rounded-md hover:bg-gray-100">
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
