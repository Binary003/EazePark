import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QRCode from "qrcode-generator";
import {
  FaTicketAlt,
  FaMapMarkerAlt,
  FaClock,
  FaCar,
  FaRoute,
  FaCheck,
  FaDownload,
  FaShare,
  FaHome,
  FaCalendarAlt,
} from "react-icons/fa";
import Navbar from "./Navbar";

function TicketPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const parkingSpot = location.state?.parkingSpot;
  const vehicleDetails = location.state?.vehicleDetails;

  const [qrCodeData, setQrCodeData] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  useEffect(() => {
    if (parkingSpot) {
      // Generate a unique ticket ID
      const uniqueTicketID = `EP${Date.now().toString().slice(-8)}`;
      setTicketId(uniqueTicketID);

      // Set booking time
      setBookingTime(new Date().toLocaleString());

      // Generate QR code
      const qr = QRCode(0, "M"); // Error correction level M for better reliability
      const qrData = JSON.stringify({
        ticketId: uniqueTicketID,
        location: parkingSpot.name,
        lat: parkingSpot.lat || parkingSpot.latitude,
        lon: parkingSpot.lon || parkingSpot.longitude,
        vehicle: vehicleDetails?.vehicleNumber || "N/A",
        time: new Date().toISOString(),
      });
      qr.addData(qrData);
      qr.make();
      setQrCodeData(qr.createDataURL(8)); // Larger size for better scanning
    }
  }, [parkingSpot, vehicleDetails]);

  if (!parkingSpot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <Navbar />
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          <div className="w-20 h-20 bg-red-500 rounded-full mx-auto flex items-center justify-center mb-6">
            <FaTicketAlt className="text-white text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Ticket Found
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your ticket details. Please try booking a parking
            spot again.
          </p>
          <button
            onClick={() => navigate("/map")}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Go to Map
          </button>
        </div>
      </div>
    );
  }

  // Google Maps Navigation Link
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${
    parkingSpot.lat || parkingSpot.latitude
  },${parkingSpot.lon || parkingSpot.longitude}`;

  const handleDownload = () => {
    // Create a canvas to combine ticket info and QR code
    alert("Download feature coming soon!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "EazePark Ticket",
        text: `My parking ticket for ${parkingSpot.name}`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(
        `Parking Ticket: ${ticketId} at ${parkingSpot.name}`
      );
      alert("Ticket details copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />

      <div className="container mx-auto px-4 lg:px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-xl mb-4 animate-pulse">
              <FaCheck className="text-white text-3xl" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600 text-lg">
              Your parking spot has been successfully reserved
            </p>
          </div>

          {/* Ticket Card */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20 mb-6">
            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaTicketAlt className="text-2xl" />
                  <div>
                    <h2 className="text-2xl font-bold">Parking Ticket</h2>
                    <p className="text-green-100">EazePark Digital Ticket</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-100">Ticket ID</p>
                  <p className="text-xl font-bold">{ticketId}</p>
                </div>
              </div>
            </div>

            {/* Ticket Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* QR Code Section */}
                <div className="text-center">
                  {qrCodeData && (
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 inline-block">
                      <img
                        src={qrCodeData}
                        alt="QR Code"
                        className="w-48 h-48 mx-auto mb-4"
                      />
                      <p className="text-sm text-gray-600 font-medium">
                        Scan for quick access
                      </p>
                    </div>
                  )}
                </div>

                {/* Ticket Details */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <FaMapMarkerAlt className="text-green-500 mt-1" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Parking Location
                        </p>
                        <p className="text-gray-900 font-bold text-lg">
                          {parkingSpot.name}
                        </p>
                      </div>
                    </div>

                    {vehicleDetails?.vehicleNumber && (
                      <div className="flex items-start space-x-3">
                        <FaCar className="text-blue-500 mt-1" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            Vehicle
                          </p>
                          <p className="text-gray-900 font-bold">
                            {vehicleDetails.vehicleNumber}
                          </p>
                          {vehicleDetails.vehicleName && (
                            <p className="text-sm text-gray-600">
                              {vehicleDetails.vehicleName}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-3">
                      <FaCalendarAlt className="text-purple-500 mt-1" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Booking Time
                        </p>
                        <p className="text-gray-900 font-bold">{bookingTime}</p>
                      </div>
                    </div>

                    {vehicleDetails?.selectedTiming && (
                      <div className="flex items-start space-x-3">
                        <FaClock className="text-orange-500 mt-1" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            Duration
                          </p>
                          <p className="text-gray-900 font-bold">
                            {vehicleDetails.selectedTiming}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <FaCheck className="text-green-600" />
                      <span className="text-green-800 font-semibold">
                        Confirmed & Active
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Your parking spot is reserved
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <FaRoute />
              <span>Navigate</span>
            </a>

            <button
              onClick={handleShare}
              className="flex items-center justify-center space-x-2 py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <FaShare />
              <span>Share</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center justify-center space-x-2 py-4 px-6 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <FaDownload />
              <span>Download</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
            <h3 className="font-bold text-gray-800 mb-2">
              Important Instructions
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Show this QR code at the parking entry/exit</li>
              <li>• Keep your vehicle documents ready</li>
              <li>• Follow parking guidelines and time limits</li>
              <li>• Contact support for any assistance</li>
            </ul>
          </div>

          {/* Back to Home Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate("/map")}
              className="inline-flex items-center space-x-2 py-3 px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <FaHome />
              <span>Back to Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketPage;
