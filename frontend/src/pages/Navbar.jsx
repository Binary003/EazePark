import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaMapMarkedAlt,
  FaUserPlus,
  FaHome,
  FaCar,
  FaTicketAlt,
  FaCreditCard,
  FaUser,
  FaBell,
} from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const navItems = [
    {
      path: "/",
      icon: FaHome,
      label: "Home",
      color: "from-blue-500 to-blue-600",
    },
    {
      path: "/map",
      icon: FaMapMarkedAlt,
      label: "Map",
      color: "from-green-500 to-green-600",
    },
    {
      path: "/vehicledetails",
      icon: FaCar,
      label: "Vehicle",
      color: "from-purple-500 to-purple-600",
    },
    {
      path: "/ticket",
      icon: FaTicketAlt,
      label: "Tickets",
      color: "from-orange-500 to-orange-600",
    },
    {
      path: "/paymentgateways",
      icon: FaCreditCard,
      label: "Payment",
      color: "from-pink-500 to-pink-600",
    },
    {
      path: "/provider-register",
      icon: FaUserPlus,
      label: "Register",
      color: "from-red-500 to-red-600",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setActiveTab(path);
  };

  // Don't show navbar on login/signup pages
  if (
    location.pathname === "/" ||
    location.pathname === "/signup" ||
    location.pathname === "/welcome"
  ) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:flex fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 px-6 py-4 z-50 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo Section */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => handleNavigation("/map")}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <FaCar className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                EazePark
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Smart Parking Solutions
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center space-x-2 py-3 px-6 rounded-xl transition-all duration-300 transform ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white scale-105 shadow-lg`
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100 active:scale-95"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-3">
            <button className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors relative">
              <FaBell className="text-gray-600" size={18} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>
            <button className="p-2 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <FaUser className="text-white text-sm" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Header - Simple Logo Only */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 px-4 py-3 z-50 shadow-sm">
        <div className="flex items-center justify-center">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleNavigation("/map")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
              <FaCar className="text-white text-lg" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              EazePark
            </h1>
          </div>
        </div>
      </div>

      {/* Bottom Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 px-2 py-1 z-50 shadow-lg">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-300 transform ${
                  isActive
                    ? `bg-gradient-to-br ${item.color} text-white scale-105 shadow-lg`
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100 active:scale-95"
                }`}
              >
                <Icon
                  size={isActive ? 20 : 16}
                  className="transition-all duration-300"
                />
                <span
                  className={`text-xs font-medium mt-1 transition-all duration-300 ${
                    isActive ? "text-white" : ""
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer for desktop navigation */}
      <div className="hidden lg:block h-20"></div>

      {/* Spacer for mobile navigation */}
      <div className="lg:hidden h-16"></div>

      {/* Bottom spacer for mobile bottom nav */}
      <div className="lg:hidden h-16"></div>
    </>
  );
};

export default Navbar;
