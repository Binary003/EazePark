import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import QRCode from "qrcode-generator";

function TicketPage() {
  const location = useLocation();
  const parkingSpot = location.state?.parkingSpot;

  const [qrCodeData, setQrCodeData] = useState("");

  useEffect(() => {
    if (parkingSpot) {
      // Generate a unique ticket ID
      const uniqueTicketID = `ticket-${parkingSpot.name}-${Date.now()}`;

      // Generate QR code
      const qr = QRCode(0, "L"); // Error correction level L
      qr.addData(uniqueTicketID);
      qr.make();
      setQrCodeData(qr.createDataURL(6)); // Size 6 for better visibility
    }
  }, [parkingSpot]);

  if (!parkingSpot) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold text-red-600">
          No ticket details found.
        </p>
      </div>
    );
  }

  // Google Maps Navigation Link
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${parkingSpot.latitude},${parkingSpot.longitude}`;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Parking Ticket</h1>

      {/* Ticket Details */}
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-lg font-semibold mb-2">Your Parking Ticket</h2>

        {/* Dynamically Generated QR Code */}
        {qrCodeData && (
          <img
            src={qrCodeData}
            alt="QR Code"
            className="w-32 h-32 mx-auto mb-4"
          />
        )}

        <p className="text-gray-700 font-semibold">Booked Location:</p>
        <p className="text-gray-900 mb-4">{parkingSpot.name}</p>

        {/* Navigation Button */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md"
        >
          Navigate to Location
        </a>
      </div>
    </div>
  );
}

export default TicketPage;
