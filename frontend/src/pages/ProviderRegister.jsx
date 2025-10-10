import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaImage,
  FaLocationArrow,
  FaBriefcase,
  FaCheck,
  FaTimes,
  FaUpload,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import Navbar from "./Navbar";

const ProviderRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    price: "",
    image: null,
  });

  const [submitStatus, setSubmitStatus] = useState(null);
  const [registeredLocations, setRegisteredLocations] = useState([]);
  const [showManageSection, setShowManageSection] = useState(false);

  // Fetch registered locations
  const fetchRegisteredLocations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/providers`);
      const data = await response.json();
      setRegisteredLocations(data);
    } catch (error) {
      console.error("Error fetching registered locations:", error);
    }
  };

  // Delete a registered location
  const handleDeleteLocation = async (locationId, locationName) => {
    console.log('Attempting to delete provider:', { locationId, locationName });
    
    if (window.confirm(`Are you sure you want to delete "${locationName}"?`)) {
      try {
        const deleteUrl = `${import.meta.env.VITE_API_BASE_URL}/api/providers/${locationId}`;
        console.log('DELETE URL:', deleteUrl);
        
        const response = await fetch(deleteUrl, { method: 'DELETE' });
        
        console.log('Delete response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Delete successful:', result);
          alert('Parking location deleted successfully!');
          fetchRegisteredLocations(); // Refresh the list
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Delete failed:', errorData);
          alert(`Failed to delete parking location: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error("Error deleting location:", error);
        alert('Error deleting parking location');
      }
    }
  };

  // Fetch locations when manage section is opened
  useEffect(() => {
    if (showManageSection) {
      fetchRegisteredLocations();
    }
  }, [showManageSection]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLocationFetch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const address = data.display_name || `${latitude}, ${longitude}`;
          setFormData((prev) => ({ ...prev, location: address }));
        } catch (error) {
          alert("Unable to fetch address. Try again.");
        }
      });
    } else {
      alert("Geolocation not supported.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, phone, location, price, image } = formData;
    if (!name || !email || !phone || !location || !price || !image) {
      alert("❌ Please fill in all fields.");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/provider-register`,
        {
          method: "POST",
          body: data,
        }
      );

      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        console.error("❌ Failed to parse JSON:", text);
        throw new Error("Invalid server response");
      }

      if (response.ok) {
        setSubmitStatus("success");
        alert("✅ Registration successful!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          location: "",
          price: "",
          image: null,
        });
      } else {
        setSubmitStatus("error");
        alert(result?.error || "❌ Registration failed.");
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      setSubmitStatus("error");
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Navbar />

      <div className="container mx-auto px-4 lg:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center p-8">
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl mb-6">
                  <FaBriefcase className="text-white text-4xl" />
                </div>
                <img
                  src="/register.png"
                  alt="Register Illustration"
                  className="w-full max-w-md mx-auto rounded-2xl shadow-lg mb-6"
                />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                  Earn from Your Space
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Transform your unused parking space into a
                  <span className="text-orange-600 font-semibold">
                    {" "}
                    steady income stream
                  </span>
                  . Join thousands of providers earning daily!
                </p>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FaCheck className="text-green-600 text-sm" />
                    </div>
                    <span className="font-medium">
                      Easy registration process
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaRupeeSign className="text-blue-600 text-sm" />
                    </div>
                    <span className="font-medium">
                      Flexible pricing control
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <FaBriefcase className="text-purple-600 text-sm" />
                    </div>
                    <span className="font-medium">24/7 earning potential</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="space-y-6">
              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-4">
                  <FaBriefcase className="text-white text-2xl" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Become a Provider
                </h1>
                <p className="text-gray-600">
                  Start earning from your parking space
                </p>
              </div>

              {/* Form Card */}
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Register Your Parking Space
                  </h2>
                  <p className="text-gray-600">
                    Fill in the details to get started
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                      <FaUser className="text-orange-500" />
                      <span>Personal Information</span>
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
                        />
                      </div>

                      <div className="relative">
                        <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Location & Pricing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                      <FaMapMarkerAlt className="text-red-500" />
                      <span>Location & Pricing</span>
                    </h3>

                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="location"
                        placeholder="Parking location address"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full pl-12 pr-16 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={handleLocationFetch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                        title="Detect current location"
                      >
                        <FaLocationArrow size={14} />
                      </button>
                    </div>

                    <div className="relative">
                      <FaRupeeSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="price"
                        placeholder="Price per hour (₹)"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                      <FaImage className="text-blue-500" />
                      <span>Parking Space Image</span>
                    </h3>

                    <div className="relative">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 transition-colors">
                        <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          PNG, JPG up to 10MB
                        </p>
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={handleChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <button
                          type="button"
                          className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                          Choose File
                        </button>
                      </div>
                      {formData.image && (
                        <div className="mt-2 text-sm text-green-600 flex items-center space-x-2">
                          <FaCheck />
                          <span>Image selected: {formData.image.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                  >
                    <FaCheck />
                    <span>Submit Registration</span>
                  </button>
                </form>

                {/* Status Messages */}
                {submitStatus === "success" && (
                  <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center space-x-3">
                    <FaCheck className="text-green-600" />
                    <div>
                      <p className="font-semibold">Registration Successful!</p>
                      <p className="text-sm">
                        We'll verify your details and get back to you soon.
                      </p>
                    </div>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center space-x-3">
                    <FaTimes className="text-red-600" />
                    <div>
                      <p className="font-semibold">Registration Failed!</p>
                      <p className="text-sm">
                        Please check your details and try again.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Manage Registered Locations Section */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <FaEye className="mr-3" />
                  Manage Your Parking Locations
                </h2>
                <button
                  onClick={() => setShowManageSection(!showManageSection)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors duration-200"
                >
                  {showManageSection ? 'Hide' : 'View'}
                </button>
              </div>
            </div>

            {showManageSection && (
              <div className="p-8">
                {registeredLocations.length === 0 ? (
                  <div className="text-center py-8">
                    <FaMapMarkerAlt className="text-gray-300 text-6xl mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No parking locations registered yet</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {registeredLocations.map((location) => (
                      <div
                        key={location._id}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                              {location.name}
                            </h3>
                            <div className="space-y-2 text-gray-600">
                              <p className="flex items-center">
                                <FaMapMarkerAlt className="mr-2 text-red-500" />
                                {location.displayAddress || location.location}
                              </p>
                              <p className="flex items-center">
                                <FaRupeeSign className="mr-2 text-green-500" />
                                ₹{location.price}/hour
                              </p>
                              <p className="flex items-center">
                                <FaEnvelope className="mr-2 text-blue-500" />
                                {location.email}
                              </p>
                              <p className="flex items-center">
                                <FaPhone className="mr-2 text-purple-500" />
                                {location.phone}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteLocation(location._id, location.name)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors duration-200"
                          >
                            <FaTrash />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegister;
