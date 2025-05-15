import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupPage = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignupClick = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const response = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      }),
    });

    if (response.ok) {
      alert("Signup successful! Please log in.");
      navigate("/welcome");
    } else {
      const data = await response.json();
      alert(data.error || "Signup failed. Try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-yellow-50">
      <div className="w-1/2 flex flex-col items-center justify-center p-8">
        <img
          src="./img3.png"
          alt="Eaze Park"
          className="rounded-lg shadow-lg mb-6"
        />
        <h1 className="text-4xl font-bold text-gray-800">
          Don't have an Account?
        </h1>
        <p className="text-lg text-black mt-2">
          No Problem, Create a new Account here
        </p>
      </div>

      {/* Right Side */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-yellow-50 border-l-4 border-black p-8">
        <img src="./logo2.png" alt="Logo" className="w-72 h-32 mb-4" />
        <h2 className="text-2xl font-bold mb-6">Create a New Account</h2>
        <input
          type="text"
          name="name"
          placeholder="Enter name"
          className="w-full p-3 border border-black rounded-md mb-4"
          onChange={handleChange}
        />
        <input
          type="text"
          name="email"
          placeholder="Enter email"
          className="w-full p-3 border border-black rounded-md mb-4"
          onChange={handleChange}
        />
        <input
          type="text"
          name="phone"
          placeholder="Enter phone number"
          className="w-full p-3 border border-black rounded-md mb-4"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Enter password"
          className="w-full p-3 border border-black rounded-md mb-6"
          onChange={handleChange}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          className="w-full p-3 border border-black rounded-md mb-6"
          onChange={handleChange}
        />
        <button
          className="w-full p-3 bg-yellow-500 text-white font-semibold rounded-md mb-4 hover:bg-yellow-600"
          onClick={handleSignupClick}
        >
          Sign Up
        </button>
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <span
            className="text-yellow-500 font-semibold cursor-pointer"
            onClick={() => navigate("/")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
