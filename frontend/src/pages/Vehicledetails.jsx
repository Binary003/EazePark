import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
    <div className="flex flex-col md:flex-row h-screen bg-[#f8f5ee]">
      <div className="flex-1 flex flex-col justify-center items-center p-5">
        <div className="w-3/4 h-3/4 bg-white shadow-lg p-5">
          <img
            src="addv.png"
            alt="Add Vehicle"
            className="w-full h-full object-cover rounded"
          />
        </div>
        <h2 className="text-3xl font-bold mt-4">Add Your Vehicle..</h2>
      </div>

      <div className="flex-1 flex flex-col justify-start px-10 space-y-4 overflow-y-auto max-h-[85vh]">
        <h2 className="text-2xl font-bold">Add Your Vehicle:</h2>

        {parkingSpot ? (
          <div className="w-full bg-gray-100 p-2 rounded text-sm">
            <p>
              <strong>Parking Location:</strong>{" "}
              {parkingSpot.name || "Saved Location"}
            </p>
            <p>
              Latitude: {parkingSpot.lat.toFixed(3)}, Longitude:{" "}
              {parkingSpot.lon.toFixed(3)}
            </p>
          </div>
        ) : (
          <p className="text-red-500">No Parking Spot Selected</p>
        )}

        <div className="w-full space-y-3">
          <label className="text-lg font-medium">Vehicle Number:</label>
          <input
            type="text"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter vehicle number"
          />

          <label className="text-lg font-medium">Vehicle Name:</label>
          <input
            type="text"
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter vehicle name"
          />

          <label className="text-lg font-medium">Phone Number:</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter phone number"
          />
        </div>

        <label className="text-lg font-medium">Select Parking Duration:</label>
        <select
          value={selectedTiming}
          onChange={(e) => handleTimingSelect(Number(e.target.value))}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-400"
        >
          <option value="">Select Timing</option>
          <option value="30">30 Minutes</option>
          <option value="60">1 Hour</option>
          <option value="120">2 Hours</option>
          <option value="180">3 Hours</option>
        </select>

        <p className="text-lg font-bold">Amount: ₹{amount}</p>

        <button
          onClick={handleSendOtp}
          className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
          disabled={otpSent}
        >
          {otpSent ? "OTP Sent" : "Send OTP"}
        </button>
        {/* OTP Input Field (Appears Only After Sending OTP) */}
        {otpSent && (
          <div className="w-full space-y-3">
            <label className="text-lg font-medium">Enter OTP:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter OTP"
            />
          </div>
        )}

        <button
          onClick={() => navigate("/Locdetails", { state: { parkingSpot } })}
          className="px-4 py-2 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600"
        >
          Additional Details
        </button>

        <button
          onClick={handleBook}
          className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default Vehicledetails;
