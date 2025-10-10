import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaCar,
  FaPhone,
  FaClock,
  FaRupeeSign,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaIdCard,
  FaArrowRight,
  FaPaperPlane,
} from "react-icons/fa";
import Navbar from "./Navbar";

const Vehicledetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = localStorage.getItem("currentUser");
  const storedUser = sessionStorage.getItem("storedUser"); // Track previous user login

  const parkingSpot =
    location.state?.parkingSpot ||
    JSON.parse(localStorage.getItem("parkingSpot"));

  // ✅ Restore values from sessionStorage only if parking spot is unchanged
  const [vehicleName, setVehicleName] = useState(
    () => sessionStorage.getItem("vehicleName") || ""
  );
  const [vehicleNumber, setVehicleNumber] = useState(
    () => sessionStorage.getItem("vehicleNumber") || ""
  );
  const [phoneNumber, setPhoneNumber] = useState(
    () => sessionStorage.getItem("phoneNumber") || ""
  );
  const [selectedTiming, setSelectedTiming] = useState(
    () => sessionStorage.getItem("selectedTiming") || ""
  );
  const [amount, setAmount] = useState(
    () => sessionStorage.getItem("amount") || ""
  );
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    // ✅ Reset fields when a new user logs in
    if (storedUser !== currentUser) {
      setVehicleName("");
      setVehicleNumber("");
      setPhoneNumber("");
      setSelectedTiming("");
      setAmount("");
      sessionStorage.clear(); // Clear previous session storage
      sessionStorage.setItem("storedUser", currentUser); // Update stored user
    }

    // ✅ Reset fields if the user changes the booked parking location
    if (location.state?.parkingSpot) {
      const previousParkingSpot = sessionStorage.getItem("previousParkingSpot");
      if (
        previousParkingSpot &&
        JSON.parse(previousParkingSpot).lat !== parkingSpot.lat
      ) {
        setVehicleName("");
        setVehicleNumber("");
        setPhoneNumber("");
        setSelectedTiming("");
        setAmount("");
      }
      sessionStorage.setItem(
        "previousParkingSpot",
        JSON.stringify(parkingSpot)
      ); // Store new location
    }
  }, [currentUser, location.state?.parkingSpot]);

  // ✅ Save data to sessionStorage when fields change
  useEffect(() => {
    sessionStorage.setItem("vehicleName", vehicleName);
    sessionStorage.setItem("vehicleNumber", vehicleNumber);
    sessionStorage.setItem("phoneNumber", phoneNumber);
    sessionStorage.setItem("selectedTiming", selectedTiming);
    sessionStorage.setItem("amount", amount);
  }, [vehicleName, vehicleNumber, phoneNumber, selectedTiming, amount]);

  const handleTimingSelect = (minutes) => {
    const ratePerHour = 100;
    const timingString =
      minutes >= 60 ? `${minutes / 60} hr` : `${minutes} min`;
    const calculatedAmount = Math.round((minutes / 60) * ratePerHour);

    setSelectedTiming(timingString);
    setAmount(calculatedAmount.toString());
  };

  const handleSendOtp = () => {
    if (phoneNumber.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    setOtpSent(true);
    alert(`Your OTP is: ${newOtp}`);
  };

  const handleBook = () => {
    if (
      !selectedTiming ||
      !amount ||
      !vehicleNumber ||
      !vehicleName ||
      !phoneNumber ||
      !otp
    ) {
      alert("Please fill all details and select timing.");
      return;
    }

    if (otp !== generatedOtp) {
      alert("Invalid OTP. Please try again.");
      return;
    }

    alert("OTP Verified Successfully! ✅");

    navigate("/PaymentGateways", {
      state: {
        parkingSpot,
        vehicleNumber,
        vehicleName,
        phoneNumber,
        selectedTiming,
        amount,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="container mx-auto px-4 lg:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center p-8">
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl mb-6">
                  <FaCar className="text-white text-4xl" />
                </div>
                <img
                  src="addv.png"
                  alt="Add Vehicle"
                  className="w-full max-w-md mx-auto rounded-2xl shadow-lg mb-6"
                />
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                  Vehicle Registration
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Add your vehicle details to secure your parking spot.
                  <span className="text-blue-600 font-semibold">
                    {" "}
                    Quick & secure
                  </span>{" "}
                  registration process.
                </p>

                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-center space-x-3 text-gray-500">
                    <FaShieldAlt className="text-green-500" />
                    <span className="text-sm font-medium">
                      Secure data protection
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-gray-500">
                    <FaClock className="text-blue-500" />
                    <span className="text-sm font-medium">
                      Real-time booking
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="space-y-6">
              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-4">
                  <FaCar className="text-white text-2xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Vehicle Details
                </h2>
                <p className="text-gray-600">
                  Register your vehicle for parking
                </p>
              </div>

              {/* Parking Location Card */}
              {parkingSpot ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <FaMapMarkerAlt className="text-white text-lg" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-2">
                        Selected Parking Location
                      </h3>
                      <p className="text-gray-700 font-medium mb-1">
                        {parkingSpot.name || "Saved Location"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Coordinates: {parkingSpot.lat.toFixed(4)},{" "}
                        {parkingSpot.lon.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <p className="text-red-600 font-medium text-center">
                    ⚠️ No Parking Spot Selected
                  </p>
                </div>
              )}

              {/* Form Card */}
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                  <FaIdCard className="text-blue-500" />
                  <span>Vehicle Information</span>
                </h3>

                <div className="space-y-6">
                  {/* Vehicle Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vehicle Registration Number
                    </label>
                    <div className="relative">
                      <FaCar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                        placeholder="e.g., DL 01 AB 1234"
                      />
                    </div>
                  </div>

                  {/* Vehicle Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vehicle Model/Name
                    </label>
                    <div className="relative">
                      <FaCar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={vehicleName}
                        onChange={(e) => setVehicleName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                        placeholder="e.g., Maruti Swift"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                        placeholder="Enter 10-digit mobile number"
                      />
                    </div>
                  </div>

                  {/* Duration Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Parking Duration
                    </label>
                    <div className="relative">
                      <FaClock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        value={selectedTiming}
                        onChange={(e) =>
                          handleTimingSelect(Number(e.target.value))
                        }
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                      >
                        <option value="">Select parking duration</option>
                        <option value="30">30 Minutes</option>
                        <option value="60">1 Hour</option>
                        <option value="120">2 Hours</option>
                        <option value="180">3 Hours</option>
                      </select>
                    </div>
                  </div>

                  {/* Amount Display */}
                  {amount && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FaRupeeSign className="text-yellow-600 text-xl" />
                          <span className="text-gray-700 font-medium">
                            Parking Fee:
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-gray-800">
                          ₹{amount}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Duration: {selectedTiming}
                      </p>
                    </div>
                  )}

                  {/* OTP Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <FaShieldAlt className="text-blue-500" />
                      <span>Mobile Verification</span>
                    </h4>

                    <button
                      onClick={handleSendOtp}
                      disabled={otpSent || !phoneNumber}
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                        otpSent
                          ? "bg-green-500 text-white cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105"
                      }`}
                    >
                      <FaPaperPlane />
                      <span>
                        {otpSent ? "OTP Sent Successfully" : "Send OTP"}
                      </span>
                    </button>

                    {otpSent && (
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Enter OTP
                        </label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-center text-lg font-mono"
                          placeholder="Enter 4-digit OTP"
                          maxLength="4"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    onClick={() =>
                      navigate("/Locdetails", { state: { parkingSpot } })
                    }
                    className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Additional Details
                  </button>

                  <button
                    onClick={handleBook}
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>Proceed to Payment</span>
                    <FaArrowRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vehicledetails;
