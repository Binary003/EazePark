import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";

function LocDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get user-selected parking info from backend (sent via state)
  const parkingSpot = location.state?.parkingSpot || {
    name: "Unknown Location",
    lat: 0,
    lon: 0,
  };

  // State for time & date
  const [fromTime, setFromTime] = useState("05:30 PM");
  const [toTime, setToTime] = useState("07:30 PM");
  const [selectedDate, setSelectedDate] = useState("2024-12-02");

  // Time slot options
  const timeSlots = [
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
    "07:30 PM",
  ];

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Show User-Selected Location Info Instead of Static Image */}
        <div className="h-40 w-full bg-gray-200 flex flex-col justify-center items-center shadow-md">
          <h2 className="text-xl font-bold">{parkingSpot.name}</h2>
          <p className="text-sm">
            Lat: {parkingSpot.lat.toFixed(3)}, Lon: {parkingSpot.lon.toFixed(3)}
          </p>
        </div>

        {/* Location Details */}
        <div className="text-lg font-semibold p-4">Location Details</div>
        <div className="text-2xl font-bold px-4">{parkingSpot.name}</div>

        {/* Date Selection */}
        <div className="flex items-center p-4">
          <label className="text-lg font-semibold mr-4">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 p-2 rounded-md"
          />
        </div>

        {/* Time Slot Selection */}
        <div className="flex items-center space-x-4 px-4">
          <div className="border border-black rounded-md p-4 w-40">
            <div className="text-sm font-semibold">From:</div>
            <select
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          <div className="text-2xl">➡️</div>
          <div className="border border-black rounded-md p-4 w-40">
            <div className="text-sm font-semibold">To:</div>
            <select
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div className="px-4 mt-4">
          <div className="text-lg font-semibold mb-2">Select Vehicle Type:</div>
          <div className="flex space-x-4">
            {["Two Wheeler", "Four Wheeler"].map((type) => (
              <button
                key={type}
                className="p-4 border border-black rounded-md"
                onClick={() =>
                  navigate("/vehicledetails", {
                    state: {
                      parkingSpot, // Pass selected location
                      selectedDate, // Pass selected date
                      fromTime, // Pass time slot
                      toTime,
                      vehicleType: type, // Pass vehicle type
                      prevData: location.state || {}, // Pass previously entered data
                    },
                  })
                }
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Book Now Button */}
        <div className="px-4 mt-6">
          <button className="w-full bg-yellow-500 text-black font-semibold text-lg rounded-md py-3">
            Book Now
          </button>
        </div>
      </div>

      {/* Bottom Navigation - Fixed */}
      <div className="w-full flex justify-around bg-gray-800 text-white py-4 fixed bottom-0">
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <FaHome size={24} />
          <span className="text-sm">Home</span>
        </div>
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => navigate("/map")}
        >
          <FaMapMarkerAlt size={24} />
          <span className="text-sm">Map</span>
        </div>
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => alert("Info about the app!")}
        >
          <FaInfoCircle size={24} />
          <span className="text-sm">Info</span>
        </div>
      </div>
    </div>
  );
}

export default LocDetails;
