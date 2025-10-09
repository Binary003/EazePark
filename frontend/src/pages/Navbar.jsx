// components/Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkedAlt, FaUserPlus, FaHome } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 w-full bg-white shadow-inner flex justify-around py-2 z-50 border-t">
      <button
        onClick={() => navigate("/")}
        className="flex flex-col items-center text-sm text-gray-700 hover:text-blue-600"
      >
        <FaHome size={20} />
        Home
      </button>
      <button
        onClick={() => navigate("/map")}
        className="flex flex-col items-center text-sm text-gray-700 hover:text-blue-600"
      >
        <FaMapMarkedAlt size={20} />
        Map
      </button>
      <button
        onClick={() => navigate("/provider-register")}
        className="flex flex-col items-center text-sm text-gray-700 hover:text-blue-600"
      >
        <FaUserPlus size={20} />
        Register
      </button>
    </div>
  );
};

export default Navbar;
