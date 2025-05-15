import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function PaymentGateways() {
  const navigate = useNavigate();
  const location = useLocation();
  const parkingSpot = location.state?.parkingSpot;
  const [showPopup, setShowPopup] = useState(false);

  // Function to handle successful payment
  const handlePaymentSuccess = () => {
    setShowPopup(true);

    setTimeout(() => {
      navigate("/ticket", { state: { parkingSpot } }); // Redirect to Ticket Page
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-yellow-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Gateway</h1>
      <p className="mb-8 text-gray-600">
        Complete your payment to proceed with booking.
      </p>

      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md space-y-8">
        {/* QR Code Payment Section */}
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">QR Code Payment</h2>
          <p className="text-gray-600 mb-4">
            Scan the QR code below to complete payment.
          </p>
          <div className="flex items-center justify-center bg-gray-200 p-4 rounded-lg">
            <img
              src="./qr.png"
              alt="QR Code"
              className="w-32 h-32 object-contain"
            />
          </div>

          <button
            onClick={handlePaymentSuccess}
            className="mt-4 bg-green-500 text-white font-semibold py-2 px-4 rounded-md"
          >
            I Have Paid
          </button>
        </div>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-green-600 text-xl font-semibold mb-2">
              Payment Successful! 🎉
            </h2>
            <p className="text-gray-700">
              Redirecting to your parking ticket...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentGateways;
